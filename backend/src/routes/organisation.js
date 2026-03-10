const express = require("express");
const router = express.Router();
const { ensureAuth, ensureRole } = require("../middleware/auth");
const organisationController = require("../controllers/organisationController");

router.post("/register", organisationController.registerOrganisation);
router.post("/login", organisationController.loginOrganisation);

// Allow only authenticated users with role organisation or hospital to use these endpoints.
// Admins are allowed to access some operations (reads & querying by orgId) via ensureRole below.

router.use(ensureAuth);

// UPDATE ORGANISATION PROFILE
router.patch(
  "/profile",
  ensureRole(["organisation", "hospital", "admin"]),
  organisationController.updateProfile
);

// Inventory endpoints:
// GET /api/organisation/inventory?orgId=...   (admins can pass orgId)
router.get(
  "/inventory",
  ensureRole(["organisation", "hospital", "admin"]),
  organisationController.getInventory
);

// PATCH /api/organisation/inventory
// Only organisation/hospital/admin can update inventory. Admin may update any org by passing orgId in body.
router.patch(
  "/inventory",
  ensureRole(["organisation", "hospital", "admin"]),
  organisationController.updateInventory
);

// Requests management:
// GET /api/organisation/requests  (org/hospital see their requests+global; admin can query via orgId)
router.get(
  "/requests",
  ensureRole(["organisation", "hospital", "admin"]),
  organisationController.getAllRequests
);

// PATCH /api/organisation/requests/:id/process
router.patch(
  "/requests/:id/process",
  ensureRole(["organisation", "hospital", "admin"]),
  organisationController.processRequest
);

// Transactions for this org:
// GET /api/organisation/transactions?orgId=... (admin may pass orgId)
router.get(
  "/transactions",
  ensureRole(["organisation", "hospital", "admin"]),
  organisationController.getTransactions
);

module.exports = router;
