import express from "express";

import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoice.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const invoiceRoutes = express.Router();

invoiceRoutes.use(protect);

invoiceRoutes.post("/", createInvoice);
invoiceRoutes.get("/", getInvoices);
invoiceRoutes.get("/:id", getInvoiceById);
invoiceRoutes.put("/:id", updateInvoice);
invoiceRoutes.delete("/:id", deleteInvoice);

export default invoiceRoutes;