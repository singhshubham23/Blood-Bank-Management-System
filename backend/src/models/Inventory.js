// models/Inventory.js
const mongoose = require("mongoose");

const GroupsSchema = {
  "A+": { type: Number, default: 0, min: 0 },
  "A-": { type: Number, default: 0, min: 0 },
  "B+": { type: Number, default: 0, min: 0 },
  "B-": { type: Number, default: 0, min: 0 },
  "O+": { type: Number, default: 0, min: 0 },
  "O-": { type: Number, default: 0, min: 0 },
  "AB+": { type: Number, default: 0, min: 0 },
  "AB-": { type: Number, default: 0, min: 0 },
};

function defaultGroups() {
  return {
    "A+": 0,
    "A-": 0,
    "B+": 0,
    "B-": 0,
    "O+": 0,
    "O-": 0,
    "AB+": 0,
    "AB-": 0,
  };
}

const InventorySchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    index: true,
  },
  bloodBankName: { type: String, default: "Central Blood Bank" },
  groups: {
    type: Object,
    default: defaultGroups,
  },
  // using Map gives convenience, but object is fine too
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Inventory", InventorySchema);
