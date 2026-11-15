import express from "express";
import rateLimit from "express-rate-limit";

import { getInvoicesForExport } from "../controllers/invoiceExport.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { invoiceExportLimiter } from "../middleware/rateLimit.middleware.js";

const invoiceExportRoutes = express.Router();

// ---------------- ROUTES ----------------

invoiceExportRoutes.use(protect);

invoiceExportRoutes.get("/", invoiceExportLimiter, getInvoicesForExport);

export default invoiceExportRoutes;