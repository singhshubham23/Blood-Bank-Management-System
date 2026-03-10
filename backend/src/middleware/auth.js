// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function ensureAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalid or expired" });
  }
}

function ensureRole(roles) {
  // roles can be string or array
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!allowed.includes(req.user.role))
      return res.status(403).json({ error: "Forbidden: Insufficient role" });
    next();
  };
}

module.exports = { ensureAuth, ensureRole };
