// routes/admin.js
const express = require("express");
const router = express.Router();
const { ensureAuth, ensureRole } = require("../middleware/auth");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Request = require("../models/Request");
const Transaction = require("../models/Transaction");
const Inventory = require("../models/Inventory");
const generateUniqueId = require("../utils/generateUniqueId");

const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

// ADMIN ONLY
router.use(ensureAuth, ensureRole(["admin"]));

// ============ GET ALL REQUESTS ============
router.get("/requests", async (req, res) => {
  try {
    const list = await Request.find({})
      .populate("requester", "name email phone")
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to load requests" });
  }
});

// ============ GET ALL TRANSACTIONS ============
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

// ============ GET GLOBAL INVENTORY ============
router.get("/inventory", async (req, res) => {
  try {
    const inv = await Inventory.find({})
      .populate("orgId", "name email role")
      .sort({ bloodBankName: 1 });
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: "Failed to load inventory" });
  }
});

// ============ SEARCH INVENTORY BY GROUP ============
router.get("/inventory/search", async (req, res) => {
  try {
    const { bloodGroup, units } = req.query;
    const allowedGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    if (!bloodGroup || !allowedGroups.includes(bloodGroup)) {
      return res.status(400).json({ error: "Invalid bloodGroup" });
    }
    const nUnits = Number(units || 1);
    if (!Number.isInteger(nUnits) || nUnits <= 0) {
      return res.status(400).json({ error: "Units must be a positive integer" });
    }

    const list = await Inventory.find({
      orgId: { $ne: null },
      [`groups.${bloodGroup}`]: { $gte: nUnits },
    })
      .populate("orgId", "name phone email role")
      .sort({ [`groups.${bloodGroup}`]: -1 });

    res.json({
      success: true,
      results: list.map((inv) => ({
        inventoryId: inv._id,
        orgId: inv.orgId?._id,
        instituteName: inv.orgId?.name || inv.bloodBankName || "Unknown",
        institutePhone: inv.orgId?.phone || "Not Provided",
        instituteEmail: inv.orgId?.email || "Not Provided",
        units: inv.groups?.get ? inv.groups.get(bloodGroup) : inv.groups?.[bloodGroup] || 0,
      })),
    });
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ REGISTER FACILITY ============
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
      isVerified: true, // Admin-created facility
      uniqueId,
    });

    await newUser.save();

    res.status(201).json({ success: true, message: "Facility registered successfully", user: newUser });
  } catch (err) {
    console.error("Register facility error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
