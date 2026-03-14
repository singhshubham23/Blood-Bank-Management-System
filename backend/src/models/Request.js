const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  requestToOrg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  }, // optional org this request is for
  requestType: { type: String, enum: ["DONATE", "RECEIVE", "ADMIN_SUPPLY"], required: true },
  bloodGroup: { type: String, required: true },
  units: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"],
    default: "PENDING",
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Request", RequestSchema);
