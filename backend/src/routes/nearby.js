const express = require("express");
const router = express.Router();
const { getNearbyBloodBanks } = require("../controllers/nearbyController");

// Public route - no authentication required (emergency access)
router.get("/bloodbanks", getNearbyBloodBanks);

module.exports = router;
