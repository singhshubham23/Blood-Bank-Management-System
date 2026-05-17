import express from "express";
import { ensureAuth, ensureRole } from "../middleware/auth";
import * as organisationController from "../controllers/organisationController";

const router = express.Router();

router.post("/register", organisationController.registerOrganisation);
router.post("/login", organisationController.loginOrganisation);

router.use(ensureAuth);

router.patch(
  "/profile",
  ensureRole(["organisation", "hospital", "admin"]),
  organisationController.updateProfile
);

router.get(
  "/inventory",
  ensureRole(["organisation", "hospital", "admin"]),
  organisationController.getInventory
);

router.patch(
  "/inventory",
  ensureRole(["organisation", "hospital", "admin"]),
  organisationController.updateInventory
);

router.get(
  "/requests",
  ensureRole(["organisation", "hospital", "admin"]),
  organisationController.getAllRequests
);

router.patch(
  "/requests/:id/process",
  ensureRole(["organisation", "hospital", "admin"]),
  organisationController.processRequest
);

router.get(
  "/transactions",
  ensureRole(["organisation", "hospital", "admin"]),
  organisationController.getTransactions
);

export default router;
