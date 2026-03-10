// routes/transactions.js
const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const transactionController = require("../controllers/transactionController");

router.get("/user/:userId", ensureAuth, transactionController.getUserTransactions);

module.exports = router;
