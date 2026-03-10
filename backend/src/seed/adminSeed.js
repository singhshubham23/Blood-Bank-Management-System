// seed/adminSeed.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { connectDB } = require("../config/db");
const User = require("../models/User");
const generateUniqueId = require("../utils/generateUniqueId");

async function run() {
  await connectDB();
  const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const hashed = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || "Admin@123", 10);
  const admin = new User({
    name: "Admin",
    email,
    password: hashed,
    role: "admin",
    uniqueId: await generateUniqueId(),
    isVerified: true,
  });
  await admin.save();
  console.log("Admin created:", email);
  process.exit(0);
}
run().catch((err) => {
  console.error(err);
  process.exit(1);
});
