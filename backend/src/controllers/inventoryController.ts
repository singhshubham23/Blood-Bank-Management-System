import mongoose from "mongoose";
import { Request, Response } from "express";
import Inventory from "../models/Inventory";
import { emitInventoryUpdate } from "../utils/socket";
import { getCache, setCache, invalidateCache, invalidateByPrefix } from "../config/redis";
import { IInventory } from "../types";

function parseOrgId(id: string | null | undefined): mongoose.Types.ObjectId | null {
  if (!id) return null;
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
}

export async function getInventory(req: Request, res: Response) {
  try {
    const orgId = parseOrgId(req.query.orgId as string);
    const filter = orgId ? { orgId } : { orgId: null };

    let inv = await Inventory.findOne(filter);
    if (!inv) {
      inv = await Inventory.create({
        orgId: filter.orgId,
        bloodBankName: !orgId ? "Central Blood Bank" : undefined,
        groups: {},
      });
    }

    res.json({ success: true, inventory: inv });
  } catch (err: any) {
    console.error("getInventory error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getGlobalInventory(req: Request, res: Response) {
  try {
    const cached = await getCache("cache:globalInventory");
    if (cached) {
      return res.json(cached);
    }

    const groups: { [key: string]: number } = {
      "A+": 0, "A-": 0, "B+": 0, "B-": 0,
      "O+": 0, "O-": 0, "AB+": 0, "AB-": 0,
    };
    const list = await Inventory.find({});
    let lastUpdated: Date | null = null;

    list.forEach((inv) => {
      const g = inv.groups || {};
      Object.keys(groups).forEach((key) => {
        // Handle Map or Object
        const val = (g as any).get ? (g as any).get(key) : (g as any)[key];
        groups[key] += Number(val || 0);
      });
      if (inv.lastUpdated) {
        if (!lastUpdated || inv.lastUpdated > lastUpdated) {
          lastUpdated = inv.lastUpdated;
        }
      }
    });

    const response = {
      success: true,
      inventory: {
        bloodBankName: "Global Inventory",
        groups,
        lastUpdated,
      },
    };

    await setCache("cache:globalInventory", response, 60);

    res.json(response);
  } catch (err: any) {
    console.error("getGlobalInventory error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateInventory(req: Request, res: Response) {
  const { updates } = req.body;
  const orgId = parseOrgId(req.body.orgId);

  if (!updates || typeof updates !== "object")
    return res.status(400).json({ success: false, error: "Invalid updates" });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const filter = orgId ? { orgId } : { orgId: null };
    let inv = await Inventory.findOne(filter).session(session);
    if (!inv) {
      const created = await Inventory.create([{ orgId: filter.orgId, groups: {} }], { session });
      inv = created[0];
    }

    const allowedGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    for (const [group, delta] of Object.entries(updates)) {
      if (!allowedGroups.includes(group))
        throw new Error(`Invalid blood group: ${group}`);

      const current = (inv.groups as any).get
        ? (inv.groups as any).get(group) || 0
        : (inv.groups as any)[group] || 0;

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

    await session.commitTransaction();

    await invalidateCache("cache:globalInventory", "cache:adminInventory");
    await invalidateByPrefix("cache:invSearch:*");

    emitInventoryUpdate(
      {
        orgId,
        deltas: updates,
        inventory: updated,
      },
      orgId
    );

    res.json({ success: true, inventory: updated });
  } catch (err: any) {
    await session.abortTransaction();
    console.error("updateInventory error:", err);
    res.status(400).json({ success: false, error: err.message });
  } finally {
    session.endSession();
  }
}
