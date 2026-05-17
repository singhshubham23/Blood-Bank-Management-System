import express from "express";
import { ensureAuth, ensureRole } from "../middleware/auth";
import * as inventoryController from "../controllers/inventoryController";

const router = express.Router();

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

router.patch(
  "/update",
  ensureAuth,
  ensureRole(["admin", "organisation", "hospital"]),
  inventoryController.updateInventory
);

export default router;
