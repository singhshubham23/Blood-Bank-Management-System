import mongoose, { Schema, Model } from "mongoose";
import { IUser, BLOOD_GROUPS } from "../types";

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, trim: true },
  location: { type: String, trim: true },
  bloodGroup: {
    type: String,
    enum: [...BLOOD_GROUPS],
  },
  role: {
    type: String,
    enum: ["admin", "user", "organisation", "hospital"],
    default: "user",
  },
  uniqueId: { type: String, unique: true },
  isVerified: { type: Boolean, default: false },
  profilePicture: {
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
  },
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
