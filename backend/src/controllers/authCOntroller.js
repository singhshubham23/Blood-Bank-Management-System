const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const generateUniqueId = require("../utils/generateUniqueId");

const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

/* ============================
   REGISTER
=============================== */
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password, phone, bloodGroup, address, location } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, error: "Email already registered" });

    const uniqueId = await generateUniqueId();
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new User({
      name,
      email,
      password: hashed,
      phone,
      bloodGroup,
      location: address || location || "", // normalize
      uniqueId,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        uniqueId: newUser.uniqueId,
        bloodGroup: newUser.bloodGroup,
        phone: newUser.phone,
        location: newUser.location,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ============================
   LOGIN
=============================== */
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        uniqueId: user.uniqueId,
        bloodGroup: user.bloodGroup,
        phone: user.phone,
        location: user.location,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ============================
   UPDATE PROFILE
=============================== */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = {};

    ["name", "phone", "bloodGroup", "location"].forEach((key) => {
      if (key === "location") {
        updates[key] = req.body.address || req.body.location || undefined;
      } else if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    const updated = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");

    res.json({ success: true, message: "Profile updated successfully", user: updated });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ============================
   GET CURRENT USER
=============================== */
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.error("Fetch me error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
