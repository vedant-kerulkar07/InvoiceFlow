import express from "express";

import {
  GetMe,
  Login,
  Logout,
  Register,
  ForgotPassword,
  VerifyOtp,
  ResetPassword,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { forgotPasswordLimiter, loginLimiter, registerLimiter, resetPasswordLimiter, verifyOtpLimiter } from "../middleware/rateLimit.middleware.js";

const authRoutes = express.Router();

// ---------------- PUBLIC AUTH ROUTES ----------------

authRoutes.post("/register", registerLimiter, Register);
authRoutes.post("/login", loginLimiter, Login);
authRoutes.post("/logout", Logout);

// ---------------- PASSWORD RESET ROUTES ----------------

authRoutes.post(
  "/forgot-password",
  forgotPasswordLimiter,
  ForgotPassword
);

authRoutes.post(
  "/verify-reset-otp",
  verifyOtpLimiter,
  VerifyOtp
);

authRoutes.post(
  "/reset-password",
  resetPasswordLimiter,
  ResetPassword
);

// ---------------- PROTECTED ROUTES ----------------

authRoutes.get("/me", protect, GetMe);

export default authRoutes;