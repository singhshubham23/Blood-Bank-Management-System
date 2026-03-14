// routes/inventory.js
const express = require("express");
const router = express.Router();
const { ensureAuth, ensureRole } = require("../middleware/auth");
const inventoryController = require("../controllers/inventoryController");

// only organisations/hospitals can view their inventory
router.get(
  "/",
  ensureAuth,
  ensureRole(["organisation", "hospital"]),
  inventoryController.getInventory
);
router.get(
  "/global",
  ensureAuth,
  ensureRole(["admin"]),
  inventoryController.getGlobalInventory
);

// Only admin or organisation/hospital can update inventory
router.patch(
  "/update",
  ensureAuth,
  ensureRole(["admin", "organisation", "hospital"]),
  inventoryController.updateInventory
);

module.exports = router;
