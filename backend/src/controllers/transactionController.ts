import { Request, Response } from "express";
import Transaction from "../models/Transaction";

export async function getUserTransactions(req: Request, res: Response) {
  const userId = req.params.userId;
  try {
    if (String(req.user?._id) !== String(userId) && req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const list = await Transaction.find({ user: userId }).sort({ timestamp: -1 });
    res.json(list);
  } catch (err: any) {
    console.error("getUserTransactions error:", err);
    res.status(500).json({ error: err.message });
  }
}
