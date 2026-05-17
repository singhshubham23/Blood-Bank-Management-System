import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db";
import initSocket from "./socket";
import { setIo } from "./utils/socket";

import adminRoutes from "./routes/admin";
import organizationRoutes from "./routes/organisation";
import authRoutes from "./routes/auth";
import requestRoutes from "./routes/requests";
import inventoryRoutes from "./routes/inventory";
import transactionRoutes from "./routes/transactions";
import nearbyRoutes from "./routes/nearby";

const app = express();
const server = http.createServer(app);
const io = initSocket(server);
setIo(io);

app.set("io", io);

app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (/\.vercel\.app$/.test(origin)) return callback(null, true);
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

const authLimiter = rateLimit({ windowMs: 60 * 100000, max: 100 });
app.use("/api/auth", authLimiter);

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/organisation", organizationRoutes);
app.use("/api/nearby", nearbyRoutes);

app.get("/", (req, res) => {
  res.json({ ok: true, message: "BloodBank API running" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
