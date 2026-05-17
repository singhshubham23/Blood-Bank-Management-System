import express from "express";
import bcrypt from "bcrypt";
import { ensureAuth, ensureRole } from "../middleware/auth";
import User from "../models/User";
import RequestModel from "../models/Request";
import Transaction from "../models/Transaction";
import Inventory from "../models/Inventory";
import generateUniqueId from "../utils/generateUniqueId";
import { getCache, setCache } from "../config/redis";

const router = express.Router();
const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

router.use(ensureAuth, ensureRole(["admin"]));

router.get("/requests", async (req, res) => {
  try {
    const list = await RequestModel.find({})
      .populate("requester", "name email phone")
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to load requests" });
  }
});

router.get("/transactions", async (req, res) => {
  try {
    const tx = await Transaction.find({})
      .populate("user", "name email phone")
      .sort({ timestamp: -1, createdAt: -1 });

    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: "Failed to load transactions" });
  }
});

router.get("/inventory", async (req, res) => {
  try {
    const cached = await getCache("cache:adminInventory");
    if (cached) return res.json(cached);

    const inv = await Inventory.find({})
      .populate("orgId", "name email role")
      .sort({ bloodBankName: 1 });

    await setCache("cache:adminInventory", inv, 30);

    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: "Failed to load inventory" });
  }
});

router.get("/inventory/search", async (req, res) => {
  try {
    const bloodGroup = req.query.bloodGroup as string;
    const units = req.query.units as string;
    const allowedGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    if (!bloodGroup || !allowedGroups.includes(bloodGroup)) {
      return res.status(400).json({ error: "Invalid bloodGroup" });
    }
    const nUnits = Number(units || 1);
    if (!Number.isInteger(nUnits) || nUnits <= 0) {
      return res.status(400).json({ error: "Units must be a positive integer" });
    }

    const cacheKey = `cache:invSearch:${bloodGroup}:${nUnits}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const list = await Inventory.find({
      orgId: { $ne: null },
      [`groups.${bloodGroup}`]: { $gte: nUnits },
    })
      .populate("orgId", "name phone email role")
      .sort({ [`groups.${bloodGroup}`]: -1 });

    const result = {
      success: true,
      results: list.map((inv: any) => ({
        inventoryId: inv._id,
        orgId: inv.orgId?._id,
        instituteName: inv.orgId?.name || inv.bloodBankName || "Unknown",
        institutePhone: inv.orgId?.phone || "Not Provided",
        instituteEmail: inv.orgId?.email || "Not Provided",
        units: inv.groups?.get ? inv.groups.get(bloodGroup) : inv.groups?.[bloodGroup] || 0,
      })),
    };

    await setCache(cacheKey, result, 15);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to search inventory" });
  }
});

router.patch("/make-organisation/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role: "organisation" },
      { new: true }
    );
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/register-facility", async (req, res) => {
  try {
    const { name, email, password, phone, location, role } = req.body;

    if (!["organisation", "hospital"].includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid role for facility" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }

    const uniqueId = await generateUniqueId();
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new User({
      name,
      email,
      password: hashed,
      phone,
      location,
      role,
      isVerified: true,
      uniqueId,
    });

    await newUser.save();

    res.status(201).json({ success: true, message: "Facility registered successfully", user: newUser });
  } catch (err) {
    console.error("Register facility error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/analytics/donation-trends", async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await Transaction.aggregate([
      {
        $match: {
          type: "IN",
          timestamp: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
          },
          totalUnits: { $sum: "$units" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const result = trends.map((t) => ({
      month: `${months[t._id.month - 1]} ${t._id.year}`,
      donations: t.totalUnits,
      count: t.count,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Analytics donation-trends error:", err);
    res.status(500).json({ error: "Failed to load donation trends" });
  }
});

router.get("/analytics/request-stats", async (req, res) => {
  try {
    const [byGroup, byStatus, byPriority] = await Promise.all([
      RequestModel.aggregate([
        { $group: { _id: "$bloodGroup", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      RequestModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      RequestModel.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        byGroup: byGroup.map((g) => ({ bloodGroup: g._id, count: g.count })),
        byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
        byPriority: byPriority.map((p) => ({ priority: p._id || "normal", count: p.count })),
      },
    });
  } catch (err) {
    console.error("Analytics request-stats error:", err);
    res.status(500).json({ error: "Failed to load request stats" });
  }
});

router.get("/analytics/inventory-summary", async (req, res) => {
  try {
    const inventories = await Inventory.find({});
    const groups: { [key: string]: number } = {
      "A+": 0, "A-": 0, "B+": 0, "B-": 0,
      "O+": 0, "O-": 0, "AB+": 0, "AB-": 0,
    };

    inventories.forEach((inv) => {
      const g = inv.groups || {};
      Object.keys(groups).forEach((key) => {
        const val = (g as any).get ? (g as any).get(key) : (g as any)[key];
        groups[key] += Number(val || 0);
      });
    });

    res.json({
      success: true,
      data: Object.entries(groups).map(([group, units]) => ({ group, units })),
      totalOrganisations: inventories.filter((i) => i.orgId).length,
    });
  } catch (err) {
    console.error("Analytics inventory-summary error:", err);
    res.status(500).json({ error: "Failed to load inventory summary" });
  }
});

router.get("/analytics/transaction-volume", async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const volume = await Transaction.aggregate([
      { $match: { timestamp: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            type: "$type",
          },
          totalUnits: { $sum: "$units" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const monthMap: { [key: string]: any } = {};
    volume.forEach((v) => {
      const key = `${months[v._id.month - 1]} ${v._id.year}`;
      if (!monthMap[key]) monthMap[key] = { month: key, IN: 0, OUT: 0 };
      monthMap[key][v._id.type] = v.totalUnits;
    });

    res.json({ success: true, data: Object.values(monthMap) });
  } catch (err) {
    console.error("Analytics transaction-volume error:", err);
    res.status(500).json({ error: "Failed to load transaction volume" });
  }
});

router.get("/analytics/summary", async (req, res) => {
  try {
    const [totalUsers, totalOrgs, totalDonations, pendingRequests, totalRequests] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: { $in: ["organisation", "hospital"] } }),
      Transaction.aggregate([
        { $match: { type: "IN" } },
        { $group: { _id: null, total: { $sum: "$units" } } },
      ]),
      RequestModel.countDocuments({ status: "PENDING" }),
      RequestModel.countDocuments({}),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrganisations: totalOrgs,
        totalDonations: totalDonations[0]?.total || 0,
        pendingRequests,
        totalRequests,
      },
    });
  } catch (err) {
    console.error("Analytics summary error:", err);
    res.status(500).json({ error: "Failed to load summary" });
  }
});

export default router;
