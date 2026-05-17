import express from "express";
import { ensureAuth } from "../middleware/auth";
import * as transactionController from "../controllers/transactionController";

const router = express.Router();

router.get("/user/:userId", ensureAuth, transactionController.getUserTransactions);

export default router;
