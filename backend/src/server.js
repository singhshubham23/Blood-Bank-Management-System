// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./config/db");
const initSocket = require("./socket");
const adminRoutes = require("./routes/admin");
const organizationRoutes = require("./routes/organisation");

// routes
const authRoutes = require("./routes/auth");
const requestRoutes = require("./routes/requests");
const inventoryRoutes = require("./routes/inventory");
const transactionRoutes = require("./routes/transactions");
const { setSocket } = require("./utils/socket");

const app = express();
const server = http.createServer(app);
const io = initSocket(server);
setSocket(io);

// expose io to controllers via app.get('io')
app.set("io", io);

// middlewares
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// rate limiters
const authLimiter = rateLimit({ windowMs: 60 * 100000, max: 100 });
app.use("/api/auth", authLimiter);

// DB
connectDB();

// routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/organisation", organizationRoutes);

app.get("/", (req, res) => res.json({ ok: true, message: "BloodBank API running" }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
