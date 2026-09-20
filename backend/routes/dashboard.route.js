import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const dashboardRoutes = express.Router();

dashboardRoutes.get("/", protect, getDashboardStats);

export default dashboardRoutes;