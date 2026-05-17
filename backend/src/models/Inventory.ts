import mongoose, { Schema, Model } from "mongoose";
import { IInventory } from "../types";

function defaultGroups() {
  return {
    "A+": 0, "A-": 0, "B+": 0, "B-": 0,
    "O+": 0, "O-": 0, "AB+": 0, "AB-": 0,
  };
}

const InventorySchema = new Schema<IInventory>({
  orgId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
    index: true,
  },
  bloodBankName: { type: String, default: "Central Blood Bank" },
  groups: {
    type: Object,
    default: defaultGroups,
  },
  lastUpdated: { type: Date, default: Date.now },
});

const Inventory: Model<IInventory> = mongoose.model<IInventory>("Inventory", InventorySchema);
export default Inventory;
