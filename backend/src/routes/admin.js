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
      .sort({ createdAt: -1 });

    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: "Failed to load transactions" });
  }
});

// ============ GET GLOBAL INVENTORY ============
router.get("/inventory", async (req, res) => {
  try {
    const inv = await Inventory.find({});
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: "Failed to load inventory" });
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
