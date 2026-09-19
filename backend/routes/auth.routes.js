import express from "express";
import { GetMe, Login, Logout, Register } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const authRoutes = express.Router();

// Public routes
authRoutes.post("/register", Register);
authRoutes.post("/login", Login);
authRoutes.post("/logout", Logout);

// Protected route
authRoutes.get("/me", protect, GetMe);

export default authRoutes;