
const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // actor (donor/receiver)
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // which org inventory changed
  type: { type: String, enum: ["IN", "OUT"], required: true },
  bloodGroup: { type: String, required: true },
  units: { type: Number, required: true, min: 1 },
  relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: "Request" },
  timestamp: { type: Date, default: Date.now },
});

TransactionSchema.index({ user: 1 });
TransactionSchema.index({ orgId: 1 });

module.exports = mongoose.model("Transaction", TransactionSchema);
