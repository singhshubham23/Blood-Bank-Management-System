import mongoose, { Schema, Model } from "mongoose";
import { ITransaction } from "../types";

const TransactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    orgId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    type: { type: String, enum: ["IN", "OUT"], required: true },
    bloodGroup: { type: String, required: true },
    units: { type: Number, required: true, min: 1 },
    relatedRequest: { type: Schema.Types.ObjectId, ref: "Request" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TransactionSchema.index({ user: 1 });
TransactionSchema.index({ orgId: 1 });

const Transaction: Model<ITransaction> = mongoose.model<ITransaction>("Transaction", TransactionSchema);
export default Transaction;
