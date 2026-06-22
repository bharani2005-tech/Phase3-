import express from "express";
import {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resendOTP,
  sendResetOtp,
  getMe, // ✅ Add this import
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js"; // ✅ Import middleware

const router = express.Router();

// 🧩 Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/send-reset-otp", sendResetOtp);

// ✅ Add route for fetching current user
router.get("/me", protect, getMe);

export default router;
