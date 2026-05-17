import express from "express";
import { getNearbyBloodBanks } from "../controllers/nearbyController";

const router = express.Router();

router.get("/bloodbanks", getNearbyBloodBanks);

export default router;
