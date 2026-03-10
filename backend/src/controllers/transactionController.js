// controllers/transactionController.js
const Transaction = require("../models/Transaction");

async function getUserTransactions(req, res) {
  const userId = req.params.userId;
  try {
    if (String(req.user._id) !== String(userId) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const list = await Transaction.find({ user: userId }).sort({ timestamp: -1 });
    res.json(list);
  } catch (err) {
    console.error("getUserTransactions error:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getUserTransactions };
