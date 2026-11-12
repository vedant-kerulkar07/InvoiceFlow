
import express from "express";

import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} from "../controllers/client.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import {
  clientReadLimiter,
  clientWriteLimiter,
} from "../middleware/rateLimit.middleware.js";

const clientRoutes = express.Router();

// ---------------- ROUTES ----------------

// All client endpoints require authentication.
clientRoutes.use(protect);

// Create client.
clientRoutes.post("/", clientWriteLimiter, createClient);

// Read clients.
clientRoutes.get("/", clientReadLimiter, getClients);
clientRoutes.get("/:id", clientReadLimiter, getClientById);

// Update client.
clientRoutes.put("/:id", clientWriteLimiter, updateClient);

// Delete client.
clientRoutes.delete("/:id", clientWriteLimiter, deleteClient);

export default clientRoutes;
