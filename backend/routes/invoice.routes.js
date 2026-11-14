
import express from "express";

import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoice.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import {
  invoiceReadLimiter,
  invoiceWriteLimiter,
} from "../middleware/rateLimit.middleware.js";

const invoiceRoutes = express.Router();

// ---------------- ROUTES ----------------

// All invoice endpoints require authentication.
invoiceRoutes.use(protect);

// Create invoice.
invoiceRoutes.post("/", invoiceWriteLimiter, createInvoice);

// Read invoices.
invoiceRoutes.get("/", invoiceReadLimiter, getInvoices);
invoiceRoutes.get("/:id", invoiceReadLimiter, getInvoiceById);

// Update invoice.
invoiceRoutes.put("/:id", invoiceWriteLimiter, updateInvoice);

// Delete invoice.
invoiceRoutes.delete("/:id", invoiceWriteLimiter, deleteInvoice);

export default invoiceRoutes;
