import express from "express";

import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} from "../controllers/client.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const clientRoutes = express.Router();

clientRoutes.use(protect);

clientRoutes.post("/", createClient);
clientRoutes.get("/", getClients);
clientRoutes.get("/:id", getClientById);
clientRoutes.put("/:id", updateClient);
clientRoutes.delete("/:id", deleteClient);

export default clientRoutes;