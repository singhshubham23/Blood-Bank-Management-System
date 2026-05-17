import mongoose from "mongoose";
import { Request, Response } from "express";
import Inventory from "../models/Inventory";
import RequestModel from "../models/Request";
import Transaction from "../models/Transaction";
import User from "../models/User";
import jwt from "jsonwebtoken";
import { emitInventoryUpdate } from "../utils/socket";
import { invalidateCache, invalidateByPrefix } from "../config/redis";
import { IInventory } from "../types";

const DEFAULT_GROUPS = {
  "A+": 0, "A-": 0, "B+": 0, "B-": 0,
  "O+": 0, "O-": 0, "AB+": 0, "AB-": 0,
};
const ALLOWED_GROUPS = Object.keys(DEFAULT_GROUPS);

function parseOrgId(id: string | null | undefined): mongoose.Types.ObjectId | null {
  if (!id) return null;
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
}

function getCurrent(invDoc: IInventory | null, key: string): number {
  if (!invDoc || !invDoc.groups) return 0;
  if (typeof (invDoc.groups as any).get === "function") {
    const v = (invDoc.groups as any).get(key);
    return Number(v || 0);
  }
  return Number((invDoc.groups as any)[key] || 0);
}

export async function registerOrganisation(req: Request, res: Response) {
  try {
    const { name, email, password, phone, address } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ error: "Organisation already exists" });

    const org = await User.create({
      name,
      email,
      password,
      phone,
      location: address,
      role: "organisation",
    });

    const token = jwt.sign({ id: (org as any)._id }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Organisation registered",
      token,
      organisation: org,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function loginOrganisation(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password required" });
    }

    const org = await User.findOne({ email, role: "organisation" });
    if (!org)
      return res.status(400).json({ success: false, error: "Organisation not found" });

    const isMatch = org.password === password; // if plaintext
    if (!isMatch)
      return res.status(400).json({ success: false, error: "Invalid credentials" });

    const token = jwt.sign({ id: org._id }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Organisation logged in",
      token,
      organisation: org,
    });
  } catch (err: any) {
    console.error("loginOrganisation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getInventory(req: Request, res: Response) {
  try {
    const requestedOrgId = parseOrgId(req.query.orgId as string) || req.user?._id;
    const filter = requestedOrgId ? { orgId: requestedOrgId } : { orgId: null };

    let inv = await Inventory.findOne(filter);
    if (!inv) {
      const created = await Inventory.create([{
        orgId: filter.orgId,
        bloodBankName: !requestedOrgId ? "Central Blood Bank" : undefined,
        groups: { ...DEFAULT_GROUPS },
      }]);
      inv = created[0];
    }

    res.json({ success: true, inventory: inv });
  } catch (err: any) {
    console.error("organisation.getInventory error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateInventory(req: Request, res: Response) {
  const { updates } = req.body;
  const inputOrgId = parseOrgId(req.body.orgId);
  const targetOrgId = req.user?.role === "admin" ? inputOrgId || req.user?._id : req.user?._id;

  if (!updates || typeof updates !== "object")
    return res.status(400).json({ success: false, error: "Invalid updates" });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const filter = targetOrgId ? { orgId: targetOrgId } : { orgId: null };

    let inv = await Inventory.findOne(filter).session(session);
    if (!inv) {
      const created = await Inventory.create([{
        orgId: filter.orgId || null,
        groups: { ...DEFAULT_GROUPS },
      }], { session });
      inv = created[0];
    }

    for (const [group, delta] of Object.entries(updates)) {
      if (!ALLOWED_GROUPS.includes(group)) {
        throw new Error(`Invalid blood group: ${group}`);
      }
      const current = getCurrent(inv, group);
      const newVal = current + Number(delta);
      if (newVal < 0)
        throw new Error(`Insufficient units: ${group} would become negative`);
    }

    const $inc: { [key: string]: number } = {};
    Object.keys(updates).forEach(
      (k) => ($inc[`groups.${k}`] = Number((updates as any)[k]))
    );

    const updated = await Inventory.findOneAndUpdate(
      filter,
      { $inc, $set: { lastUpdated: new Date() } },
      { new: true, session, upsert: true }
    );

    if (!updated) throw new Error("Inventory not found after update");

    const txs = Object.entries(updates).map(([group, delta]) => ({
      user: req.user?._id,
      orgId: updated.orgId || null,
      type: Number(delta) >= 0 ? "IN" : "OUT",
      bloodGroup: group,
      units: Math.abs(Number(delta)),
      timestamp: new Date(),
    }));

    if (txs.length)
      await Transaction.insertMany(txs, { session, ordered: true });

    await session.commitTransaction();

    await invalidateCache("cache:globalInventory", "cache:adminInventory");
    await invalidateByPrefix("cache:invSearch:*");

    emitInventoryUpdate(
      { orgId: filter.orgId || null, deltas: updates, inventory: updated },
      filter.orgId
    );

    res.json({ success: true, inventory: updated });
  } catch (err: any) {
    await session.abortTransaction();
    console.error("organisation.updateInventory error:", err);
    res.status(400).json({ success: false, error: err.message });
  } finally {
    session.endSession();
  }
}

export async function getAllRequests(req: Request, res: Response) {
  try {
    let filter: any = {};
    if (req.user?.role === "admin") {
      const qOrgId = parseOrgId(req.query.orgId as string);
      if (qOrgId) filter = { requestToOrg: qOrgId };
    } else {
      filter = {
        $or: [{ requestToOrg: req.user?._id }, { requestToOrg: null }],
      };
    }

    const requests = await RequestModel.find(filter)
      .populate("requester", "name email phone")
      .populate("processedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err: any) {
    console.error("organisation.getAllRequests error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function processRequest(req: Request, res: Response) {
  const { id } = req.params;
  const { action } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const request = await RequestModel.findById(id).session(session);
    if (!request) throw new Error("Request not found");

    if (!["APPROVE", "REJECT", "COMPLETE"].includes(action))
      throw new Error("Invalid action");

    if (action === "REJECT") {
      request.status = "REJECTED";
      request.processedBy = req.user?._id;
      await request.save({ session });
      await session.commitTransaction();
      return res.json({ success: true, request });
    }

    if (action === "APPROVE") {
      if (request.status !== "PENDING")
        throw new Error("Only pending requests can be approved");
      if (request.requestType === "ADMIN_SUPPLY") {
        throw new Error("Admin supply requests must be approved by admin");
      }

      const targetOrgId = request.requestToOrg || req.user?._id;
      const invFilter = targetOrgId ? { orgId: targetOrgId } : { orgId: null };

      let inv = await Inventory.findOne(invFilter).session(session);
      if (!inv) {
        const created = await Inventory.create([{
          orgId: invFilter.orgId,
          bloodBankName: invFilter.orgId ? undefined : "Central Blood Bank",
          groups: { ...DEFAULT_GROUPS },
        }], { session });
        inv = created[0];
      }

      const groupKey = request.bloodGroup;
      const units = Number(request.units);

      if (request.requestType === "RECEIVE") {
        const current = getCurrent(inv, groupKey);
        if (current < units) throw new Error("Insufficient units in inventory");

        await Inventory.updateOne(
          invFilter,
          {
            $inc: { [`groups.${groupKey}`]: -units },
            $set: { lastUpdated: new Date() },
          },
          { session }
        );

        await Transaction.insertMany(
          [
            {
              user: request.requester,
              orgId: inv.orgId || null,
              type: "OUT",
              bloodGroup: groupKey,
              units,
              relatedRequest: request._id,
            },
          ],
          { session, ordered: true }
        );
      } else if (request.requestType === "DONATE") {
        await Inventory.updateOne(
          invFilter,
          {
            $inc: { [`groups.${groupKey}`]: units },
            $set: { lastUpdated: new Date() },
          },
          { session }
        );

        await Transaction.insertMany(
          [
            {
              user: request.requester,
              orgId: inv.orgId || null,
              type: "IN",
              bloodGroup: groupKey,
              units,
              relatedRequest: request._id,
            },
          ],
          { session, ordered: true }
        );
      }

      request.status = "APPROVED";
      request.processedBy = req.user?._id;
      await request.save({ session });

      await session.commitTransaction();

      emitInventoryUpdate(
        {
          orgId: inv.orgId || null,
          deltas: {
            [groupKey]: request.requestType === "DONATE" ? units : -units,
          },
        },
        inv.orgId
      );

      return res.json({ success: true, request });
    }

    if (action === "COMPLETE") {
      request.status = "COMPLETED";
      request.processedBy = req.user?._id;
      await request.save({ session });
      await session.commitTransaction();
      return res.json({ success: true, request });
    }

    throw new Error("Unhandled action");
  } catch (err: any) {
    try {
      await session.abortTransaction();
    } catch (abortErr) {
      console.error("abortTransaction error:", abortErr);
    }
    console.error("organisation.processRequest error:", err);
    return res.status(400).json({ success: false, error: err.message });
  } finally {
    session.endSession();
  }
}

export async function getTransactions(req: Request, res: Response) {
  try {
    const qOrgId = parseOrgId(req.query.orgId as string);
    const filter =
      req.user?.role === "admin"
        ? qOrgId
          ? { orgId: qOrgId }
          : {}
        : { orgId: req.user?._id };

    const list = await Transaction.find(filter)
      .sort({ timestamp: -1 })
      .populate("user", "name email");
    res.json({ success: true, transactions: list });
  } catch (err: any) {
    console.error("organisation.getTransactions error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = req.user?._id;
    const { name, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone },
      { new: true }
    ).select("-password");

    res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error("organisation.updateProfile error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
