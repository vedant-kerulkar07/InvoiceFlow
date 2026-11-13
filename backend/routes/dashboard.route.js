import express from "express";
import rateLimit from "express-rate-limit";

import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { dashboardLimiter } from "../middleware/rateLimit.middleware.js";

const dashboardRoutes = express.Router();

// ---------------- ROUTES ----------------

dashboardRoutes.get("/", protect, dashboardLimiter, getDashboardStats);

export default dashboardRoutes;