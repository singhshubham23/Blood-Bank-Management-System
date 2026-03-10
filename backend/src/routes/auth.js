// routes/auth.js
const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

// IMPORTANT: use EXACT filename (authCOntroller.js)
const authController = require("../controllers/authCOntroller");

const { ensureAuth } = require("../middleware/auth");

// ================= REGISTER =================
router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password")
      .isLength({ min: 8 })
      .matches(/[A-Z]/)
      .matches(/[a-z]/)
      .matches(/\d/)
      .matches(/[@$!%*?&#]/),
    body("phone").optional().isLength({ min: 10, max: 10 }),
    body("bloodGroup")
      .optional()
      .isIn(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
    body("address").optional().isLength({ min: 3 }),
  ],
  authController.register
);

// ================= LOGIN ==================
router.post("/login", authController.login);

// ================= CURRENT USER =============
router.get("/me", ensureAuth, authController.me);

// ================= UPDATE PROFILE ===========
router.put("/update", ensureAuth, authController.updateProfile);

module.exports = router;
