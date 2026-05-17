import express from "express";
import { ensureAuth, ensureRole } from "../middleware/auth";
import * as requestController from "../controllers/requestController";

const router = express.Router();

router.post("/", ensureAuth, requestController.createRequest);
router.get("/my", ensureAuth, requestController.getMyRequests);
router.get("/", ensureAuth, ensureRole(["admin", "organisation", "hospital"]), requestController.getAllRequests);
router.patch("/:id/process", ensureAuth, ensureRole(["admin", "organisation", "hospital"]), requestController.processRequest);

export default router;
