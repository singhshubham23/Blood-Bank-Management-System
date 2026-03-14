// controllers/requestController.js
const mongoose = require("mongoose");
const Request = require("../models/Request");
const Inventory = require("../models/Inventory");
const Transaction = require("../models/Transaction");

// canonical groups object used when creating inventories
const DEFAULT_GROUPS = {
  "A+": 0,
  "A-": 0,
  "B+": 0,
  "B-": 0,
  "O+": 0,
  "O-": 0,
  "AB+": 0,
  "AB-": 0,
};
const ALLOWED_GROUPS = Object.keys(DEFAULT_GROUPS);

/*
 Create Request
 Body: { bloodGroup, units, requestType: 'DONATE'|'RECEIVE', requestToOrg (optional orgId), notes }
*/
const createRequest = async (req, res) => {
  try {
    const { bloodGroup, units, requestType, requestToOrg, notes } = req.body;

    // basic presence checks
    if (!bloodGroup || units == null || !requestType)
      return res.status(400).json({ error: "Missing required fields" });

    // validate bloodGroup
    if (!ALLOWED_GROUPS.includes(bloodGroup))
      return res.status(400).json({ error: "Invalid bloodGroup" });

    // validate requestType
    if (!["DONATE", "RECEIVE", "ADMIN_SUPPLY"].includes(requestType))
      return res.status(400).json({ error: "Invalid requestType" });

    if (requestType === "ADMIN_SUPPLY") {
      if (!["organisation", "hospital"].includes(req.user.role)) {
        return res.status(403).json({ error: "Only institutes can request admin supply" });
      }
    }

    // validate units
    const nUnits = Number(units);
    if (!Number.isInteger(nUnits) || nUnits <= 0)
      return res.status(400).json({ error: "Units must be a positive integer" });

    const newReq = await Request.create({
      requester: req.user._id,
      requestToOrg: requestType === "ADMIN_SUPPLY" ? null : requestToOrg || null,
      requestType,
      bloodGroup,
      units: nUnits,
      notes,
    });

    res.status(201).json(newReq);
  } catch (err) {
    console.error("createRequest error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user._id })
      .populate("processedBy", "name email")
      .populate("requester", "name email")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error("getMyRequests error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getAllRequests = async (req, res) => {
  try {
    // Admin & organisation/hospital should call this; for org users, filter to org's requests if necessary
    let filter = {};
    if (req.user.role === "organisation" || req.user.role === "hospital") {
      // orgs see requests targeted to them or global
      filter = { $or: [{ requestToOrg: req.user._id }, { requestToOrg: null }] };
    }
    const requests = await Request.find(filter)
      .populate("requester", "name email")
      .populate("processedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("getAllRequests error:", err);
    res.status(500).json({ error: err.message });
  }
};

/*
 processRequest: approve/reject/complete
 PATCH /:id/process
 Body: { action: 'APPROVE'|'REJECT'|'COMPLETE', orgId (optional for where inventory changes) }
*/
const processRequest = async (req, res) => {
  const { id } = req.params;
  const { action, orgId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const request = await Request.findById(id).session(session);
    if (!request) throw new Error("Request not found");

    if (!["APPROVE", "REJECT", "COMPLETE"].includes(action)) throw new Error("Invalid action");

    // REJECT
    if (action === "REJECT") {
      request.status = "REJECTED";
      request.processedBy = req.user._id;
      await request.save({ session });
      await session.commitTransaction();
      return res.json(request);
    }

    // APPROVE
    if (action === "APPROVE") {
      if (request.status !== "PENDING") throw new Error("Only pending requests can be approved");

      if (request.requestType === "ADMIN_SUPPLY") {
        if (req.user.role !== "admin") throw new Error("Only admin can approve supply requests");
        if (!orgId || !mongoose.Types.ObjectId.isValid(orgId))
          throw new Error("orgId (source institute) is required");

        const sourceOrgId = mongoose.Types.ObjectId(orgId);
        const sourceFilter = { orgId: sourceOrgId };
        const destFilter = { orgId: request.requester };

        let sourceInv = await Inventory.findOne(sourceFilter).session(session);
        if (!sourceInv) throw new Error("Source institute inventory not found");

        let destInv = await Inventory.findOne(destFilter).session(session);
        if (!destInv) {
          const created = await Inventory.create(
            [
              {
                orgId: request.requester,
                bloodBankName: undefined,
                groups: { ...DEFAULT_GROUPS },
              },
            ],
            { session }
          );
          destInv = created[0];
        }

        const groupKey = request.bloodGroup;
        const units = Number(request.units);
        const sourceCurrent = getCurrent(sourceInv, groupKey);
        if (sourceCurrent < units) throw new Error("Insufficient units in source inventory");

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

        await Transaction.create(
          [
            {
              user: req.user._id,
              orgId: sourceOrgId,
              type: "OUT",
              bloodGroup: groupKey,
              units,
              relatedRequest: request._id,
            },
            {
              user: request.requester,
              orgId: request.requester,
              type: "IN",
              bloodGroup: groupKey,
              units,
              relatedRequest: request._id,
            },
          ],
          { session }
        );

        request.status = "APPROVED";
        request.processedBy = req.user._id;
        await request.save({ session });

        await session.commitTransaction();

        return res.json(request);
      }

      // Decide which inventory doc to operate on:
      // prefer request.requestToOrg -> orgId param -> central (null)
      const targetOrgId = request.requestToOrg || orgId || null;
      const invFilter = targetOrgId ? { orgId: targetOrgId } : { orgId: null };

      // Try to get inventory; if not present, create with DEFAULT_GROUPS
      let inv = await Inventory.findOne(invFilter).session(session);
      if (!inv) {
        const created = await Inventory.create(
          [
            {
              orgId: invFilter.orgId,
              bloodBankName: targetOrgId ? undefined : "Central Blood Bank",
              groups: { ...DEFAULT_GROUPS },
            },
          ],
          { session }
        );
        inv = created[0];
      }

      const groupKey = request.bloodGroup;
      const units = Number(request.units);

      // helper to read current safely (works if groups is Map or object)
      const getCurrent = (invDoc, key) => {
        if (!invDoc || !invDoc.groups) return 0;
        // Map (Mongoose Map) supports .get
        if (typeof invDoc.groups.get === "function") {
          const v = invDoc.groups.get(key);
          return Number(v || 0);
        }
        // plain object
        return Number(invDoc.groups[key] || 0);
      };

      if (request.requestType === "RECEIVE") {
        // Receiving blood → subtract from inventory
        const current = getCurrent(inv, groupKey);
        if (current < units) throw new Error("Insufficient units in inventory");

        // update inventory
        await Inventory.updateOne(
          invFilter,
          {
            $inc: { [`groups.${groupKey}`]: -units },
            $set: { lastUpdated: new Date() },
          },
          { session }
        );

        await Transaction.create(
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
          { session }
        );
      }

      if (request.requestType === "DONATE") {
        // Donation → add to inventory
        await Inventory.updateOne(
          invFilter,
          {
            $inc: { [`groups.${groupKey}`]: units },
            $set: { lastUpdated: new Date() },
          },
          { session }
        );

        await Transaction.create(
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
          { session }
        );
      }

      request.status = "APPROVED";
      request.processedBy = req.user._id;
      await request.save({ session });

      await session.commitTransaction();

      // Emit socket update
      const io = req.app.get("io");
      const deltaObj = { [groupKey]: request.requestType === "DONATE" ? units : -units };
      if (io) {
        io.to(inv.orgId ? `inventory_${inv.orgId}` : "inventory_global").emit("inventory:update", {
          orgId: inv.orgId || null,
          deltas: deltaObj,
          updated: null, // frontend can call to fetch full inventory if needed
        });
      }
      return res.json(request);
    }

    // COMPLETE
    if (action === "COMPLETE") {
      request.status = "COMPLETED";
      request.processedBy = req.user._id;
      await request.save({ session });
      await session.commitTransaction();
      return res.json(request);
    }

    throw new Error("Unhandled action");
  } catch (err) {
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

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  processRequest,
};
