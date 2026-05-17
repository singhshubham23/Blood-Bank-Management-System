import mongoose from "mongoose";
import { Request, Response } from "express";
import RequestModel from "../models/Request";
import Inventory from "../models/Inventory";
import Transaction from "../models/Transaction";
import User from "../models/User";
import { sendBulkSMS } from "../utils/sendSMS";
import { IInventory } from "../types";

const DEFAULT_GROUPS = {
  "A+": 0, "A-": 0, "B+": 0, "B-": 0,
  "O+": 0, "O-": 0, "AB+": 0, "AB-": 0,
};
const ALLOWED_GROUPS = Object.keys(DEFAULT_GROUPS);

export const createRequest = async (req: Request, res: Response) => {
  try {
    const { bloodGroup, units, requestType, requestToOrg, notes, priority } = req.body;

    if (!bloodGroup || units == null || !requestType)
      return res.status(400).json({ error: "Missing required fields" });

    if (!ALLOWED_GROUPS.includes(bloodGroup))
      return res.status(400).json({ error: "Invalid bloodGroup" });

    if (!["DONATE", "RECEIVE", "ADMIN_SUPPLY"].includes(requestType))
      return res.status(400).json({ error: "Invalid requestType" });

    if (requestType === "ADMIN_SUPPLY") {
      if (!req.user || !["organisation", "hospital"].includes(req.user.role)) {
        return res.status(403).json({ error: "Only institutes can request admin supply" });
      }
    }

    const nUnits = Number(units);
    if (!Number.isInteger(nUnits) || nUnits <= 0)
      return res.status(400).json({ error: "Units must be a positive integer" });

    const validPriority = ["normal", "emergency"].includes(priority) ? priority : "normal";

    const newReq = await RequestModel.create({
      requester: req.user?._id,
      requestToOrg: requestType === "ADMIN_SUPPLY" ? null : requestToOrg || null,
      requestType,
      bloodGroup,
      units: nUnits,
      notes,
      priority: validPriority,
    });

    res.status(201).json(newReq);

    if (requestType === "RECEIVE" && validPriority === "emergency") {
      setImmediate(async () => {
        try {
          const donors = await User.find({
            bloodGroup,
            phone: { $exists: true, $ne: "" },
            role: "user",
            _id: { $ne: req.user?._id },
          }).select("phone name");

          if (donors.length === 0) {
            console.log("[SMS] No matching donors found for emergency alert");
            return;
          }

          const phoneNumbers = donors
            .map((d) => d.phone)
            .filter((p): p is string => Boolean(p && p.length >= 10));

          const message = `🩸 EMERGENCY: ${bloodGroup} blood needed urgently! ${nUnits} unit(s) required. Please open the BloodBank app to respond. Every drop counts!`;

          console.log(`[SMS] Sending emergency alerts to ${phoneNumbers.length} ${bloodGroup} donors`);
          await sendBulkSMS(phoneNumbers, message);
        } catch (smsErr: any) {
          console.error("[SMS] Emergency notification error:", smsErr.message);
        }
      });
    }
  } catch (err: any) {
    console.error("createRequest error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getMyRequests = async (req: Request, res: Response) => {
  try {
    const requests = await RequestModel.find({ requester: req.user?._id })
      .populate("processedBy", "name email")
      .populate("requester", "name email")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err: any) {
    console.error("getMyRequests error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllRequests = async (req: Request, res: Response) => {
  try {
    let filter: any = {};
    if (req.user?.role === "organisation" || req.user?.role === "hospital") {
      filter = { $or: [{ requestToOrg: req.user._id }, { requestToOrg: null }] };
    }
    const requests = await RequestModel.find(filter)
      .populate("requester", "name email")
      .populate("processedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err: any) {
    console.error("getAllRequests error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const processRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, orgId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const request = await RequestModel.findById(id).session(session);
    if (!request) throw new Error("Request not found");

    if (!["APPROVE", "REJECT", "COMPLETE"].includes(action)) throw new Error("Invalid action");

    if (action === "REJECT") {
      request.status = "REJECTED";
      request.processedBy = req.user?._id as any;
      await request.save({ session });
      await session.commitTransaction();
      return res.json(request);
    }

    if (action === "APPROVE") {
      if (request.status !== "PENDING") throw new Error("Only pending requests can be approved");

      if (request.requestType === "ADMIN_SUPPLY") {
        if (req.user?.role !== "admin") throw new Error("Only admin can approve supply requests");
        if (!orgId || !mongoose.Types.ObjectId.isValid(orgId))
          throw new Error("orgId (source institute) is required");

        const sourceOrgId = new mongoose.Types.ObjectId(orgId);
        const sourceFilter = { orgId: sourceOrgId };
        const destFilter = { orgId: request.requester };

        let sourceInv = await Inventory.findOne(sourceFilter).session(session);
        if (!sourceInv) throw new Error("Source institute inventory not found");

        let destInv = await Inventory.findOne(destFilter).session(session);
        if (!destInv) {
          const created = await Inventory.create([{
            orgId: request.requester,
            bloodBankName: undefined,
            groups: { ...DEFAULT_GROUPS },
          }], { session });
          destInv = created[0];
        }

        const groupKey = request.bloodGroup;
        const units = Number(request.units);
        const sourceCurrent = (sourceInv.groups as any).get ? (sourceInv.groups as any).get(groupKey) : (sourceInv.groups as any)[groupKey];
        if (Number(sourceCurrent || 0) < units) throw new Error("Insufficient units in source inventory");

        await Inventory.updateOne(
          sourceFilter,
          { $inc: { [`groups.${groupKey}`]: -units }, $set: { lastUpdated: new Date() } },
          { session }
        );
        await Inventory.updateOne(
          destFilter,
          { $inc: { [`groups.${groupKey}`]: units }, $set: { lastUpdated: new Date() } },
          { session }
        );

        await Transaction.create([{
          user: req.user._id,
          orgId: sourceOrgId,
          type: "OUT",
          bloodGroup: groupKey,
          units,
          relatedRequest: request._id,
        }, {
          user: request.requester,
          orgId: request.requester as any,
          type: "IN",
          bloodGroup: groupKey,
          units,
          relatedRequest: request._id,
        }], { session });

        request.status = "APPROVED";
        request.processedBy = req.user._id as any;
        await request.save({ session });

        await session.commitTransaction();
        return res.json(request);
      }

      const targetOrgId = request.requestToOrg || orgId || null;
      const invFilter = targetOrgId ? { orgId: targetOrgId } : { orgId: null };

      let inv = await Inventory.findOne(invFilter).session(session);
      if (!inv) {
        const created = await Inventory.create([{
          orgId: invFilter.orgId,
          bloodBankName: targetOrgId ? undefined : "Central Blood Bank",
          groups: { ...DEFAULT_GROUPS },
        }], { session });
        inv = created[0];
      }

      const groupKey = request.bloodGroup;
      const units = Number(request.units);

      const getCurrent = (invDoc: IInventory | null, key: string) => {
        if (!invDoc || !invDoc.groups) return 0;
        if (typeof (invDoc.groups as any).get === "function") {
          const v = (invDoc.groups as any).get(key);
          return Number(v || 0);
        }
        return Number((invDoc.groups as any)[key] || 0);
      };

      if (request.requestType === "RECEIVE") {
        const current = getCurrent(inv, groupKey);
        if (current < units) throw new Error("Insufficient units in inventory");

        await Inventory.updateOne(
          invFilter,
          { $inc: { [`groups.${groupKey}`]: -units }, $set: { lastUpdated: new Date() } },
          { session }
        );

        await Transaction.create([{
          user: request.requester,
          orgId: inv.orgId || null,
          type: "OUT",
          bloodGroup: groupKey,
          units,
          relatedRequest: request._id,
        }], { session });
      }

      if (request.requestType === "DONATE") {
        await Inventory.updateOne(
          invFilter,
          { $inc: { [`groups.${groupKey}`]: units }, $set: { lastUpdated: new Date() } },
          { session }
        );

        await Transaction.create([{
          user: request.requester,
          orgId: inv.orgId || null,
          type: "IN",
          bloodGroup: groupKey,
          units,
          relatedRequest: request._id,
        }], { session });
      }

      request.status = "APPROVED";
      request.processedBy = req.user?._id as any;
      await request.save({ session });

      await session.commitTransaction();

      const io = req.app.get("io");
      const deltaObj = { [groupKey]: request.requestType === "DONATE" ? units : -units };
      if (io) {
        io.to(inv.orgId ? `inventory_${inv.orgId}` : "inventory_global").emit("inventory:update", {
          orgId: inv.orgId || null,
          deltas: deltaObj,
          updated: null,
        });
      }
      return res.json(request);
    }

    if (action === "COMPLETE") {
      request.status = "COMPLETED";
      request.processedBy = req.user?._id as any;
      await request.save({ session });
      await session.commitTransaction();
      return res.json(request);
    }

    throw new Error("Unhandled action");
  } catch (err: any) {
    try {
      await session.abortTransaction();
    } catch (abortErr) {
      console.error("abortTransaction error:", abortErr);
    }
    console.error("processRequest error:", err);
    return res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
};
