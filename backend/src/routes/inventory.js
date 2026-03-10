// routes/inventory.js
const express = require("express");
const router = express.Router();
const { ensureAuth, ensureRole } = require("../middleware/auth");
const inventoryController = require("../controllers/inventoryController");

// anyone authenticated can view inventory (but orgs see their org via query)
router.get("/", ensureAuth, inventoryController.getInventory);

// Only admin or organisation/hospital can update inventory
router.patch(
  "/update",
  ensureAuth,
  ensureRole(["admin", "organisation", "hospital"]),
  inventoryController.updateInventory
);

module.exports = router;
