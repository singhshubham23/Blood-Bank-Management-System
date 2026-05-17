import mongoose, { Schema, Model } from "mongoose";
import { IRequest } from "../types";

const RequestSchema = new Schema<IRequest>({
  requester: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  requestToOrg: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  requestType: { type: String, enum: ["DONATE", "RECEIVE", "ADMIN_SUPPLY"], required: true },
  bloodGroup: { type: String, required: true },
  units: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"],
    default: "PENDING",
  },
  notes: { type: String },
  priority: {
    type: String,
    enum: ["normal", "emergency"],
    default: "normal",
  },
  createdAt: { type: Date, default: Date.now },
  processedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

const Request: Model<IRequest> = mongoose.model<IRequest>("Request", RequestSchema);
export default Request;
