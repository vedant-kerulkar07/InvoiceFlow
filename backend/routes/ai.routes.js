
import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { chatWithAssistant } from "../controllers/ai.controller.js";

import {
  getConversations,
  createConversation,
  getConversationMessages,
  deleteConversation,
} from "../controllers/aiConversation.controller.js";
import { aiChatLimiter, createConversationLimiter, deleteConversationLimiter, historyReadLimiter } from "../middleware/rateLimit.middleware.js";


const aiRoutes = express.Router();

// ---------------- ROUTES ----------------

// All AI endpoints require authentication.
aiRoutes.use(protect);

// Conversation history endpoints.
aiRoutes.get(
  "/conversations",
  historyReadLimiter,
  getConversations
);

aiRoutes.post(
  "/conversations",
  createConversationLimiter,
  createConversation
);

aiRoutes.get(
  "/conversations/:conversationId/messages",
  historyReadLimiter,
  getConversationMessages
);

aiRoutes.delete(
  "/conversations/:conversationId",
  deleteConversationLimiter,
  deleteConversation
);

// Chat endpoint.
aiRoutes.post(
  "/chat",
  aiChatLimiter,
  chatWithAssistant
);

export default aiRoutes;
