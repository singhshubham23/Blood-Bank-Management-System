import express from "express";
import { body } from "express-validator";
import * as authController from "../controllers/authController";
import { ensureAuth } from "../middleware/auth";
import upload from "../middleware/upload";

const router = express.Router();

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

router.post("/login", authController.login);
router.get("/me", ensureAuth, authController.me);
router.put("/update", ensureAuth, upload.single("profilePicture"), authController.updateProfile);

export default router;
