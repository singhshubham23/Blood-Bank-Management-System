const mongoose = require("mongoose");
const Inventory = require("../models/Inventory");
const { emitInventoryUpdate } = require("../utils/socket");

// Helper to safely parse orgId
function parseOrgId(id) {
  if (!id) return null;
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return mongoose.Types.ObjectId(id);
}

// GET inventory
async function getInventory(req, res) {
  try {
    const orgId = parseOrgId(req.query.orgId);
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
  } catch (err) {
    console.error("getInventory error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// PATCH inventory
async function updateInventory(req, res) {
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
      inv = new Inventory({ orgId: filter.orgId, groups: {} });
      await inv.save({ session });
    }

    const allowedGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    for (const [group, delta] of Object.entries(updates)) {
      if (!allowedGroups.includes(group))
        throw new Error(`Invalid blood group: ${group}`);

      const current = inv.groups.get
        ? inv.groups.get(group) || 0
        : inv.groups[group] || 0;

      const newVal = current + Number(delta);
      if (newVal < 0)
        throw new Error(`Insufficient units: ${group} would become negative`);
    }

    const $inc = {};
    Object.keys(updates).forEach(
      (k) => ($inc[`groups.${k}`] = Number(updates[k]))
    );

    const updated = await Inventory.findOneAndUpdate(
      filter,
      { $inc, $set: { lastUpdated: new Date() } },
      { new: true, session, upsert: true }
    );

    await session.commitTransaction();

    // 🔥 Real-time update emit
    emitInventoryUpdate(
      {
        orgId,
        deltas: updates,
        inventory: updated,
      },
      orgId
    );

    res.json({ success: true, inventory: updated });
  } catch (err) {
    await session.abortTransaction();
    console.error("updateInventory error:", err);
    res.status(400).json({ success: false, error: err.message });
  } finally {
    session.endSession();
  }
}

module.exports = { getInventory, updateInventory };
