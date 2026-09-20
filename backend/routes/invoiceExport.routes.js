import express from "express";

import { getInvoicesForExport } from "../controllers/invoiceExport.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const invoiceExportRoutes = express.Router();

invoiceExportRoutes.use(protect);

invoiceExportRoutes.get("/", getInvoicesForExport);

export default invoiceExportRoutes;