import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User";
import generateUniqueId from "../utils/generateUniqueId";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary";

const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

export const register = async (req: Request, res: Response) => {
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
        profilePicture: newUser.profilePicture,
      },
    });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
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

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, {
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
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const updates: any = {};

    ["name", "phone", "bloodGroup", "location"].forEach((key) => {
      if (key === "location") {
        updates[key] = req.body.address || req.body.location || undefined;
      } else if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    if (req.file) {
      try {
        const currentUser = await User.findById(userId);
        if (currentUser?.profilePicture?.publicId) {
          await deleteFromCloudinary(currentUser.profilePicture.publicId);
        }

        const result = await uploadToCloudinary(req.file.buffer, "bloodbank/profiles");
        updates.profilePicture = {
          url: result.url,
          publicId: result.publicId,
        };
        console.log(`[Cloudinary] Profile picture uploaded for user ${userId}`);
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
        return res.status(500).json({ success: false, error: "Failed to upload profile picture" });
      }
    }

    const updated = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");

    res.json({ success: true, message: "Profile updated successfully", user: updated });
  } catch (err: any) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, user });
  } catch (err: any) {
    console.error("Fetch me error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
