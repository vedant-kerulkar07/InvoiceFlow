
import mongoose from "mongoose";
import AIConversation from "../models/AIConversation.model.js";
import AIMessage from "../models/AIMessage.model.js";
import { handleError } from "../helpers/handleError.js";

// GET /api/ai/conversations
// Return only conversations belonging to the logged-in user.
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await AIConversation.find({
      user: req.user._id,
    })
      .sort({ updatedAt: -1 })
      .select("title createdAt updatedAt lastMessageAt")
      .limit(100)
      .lean();

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/conversations
// Create a new conversation.
export const createConversation = async (req, res, next) => {
  try {
    const conversation = await AIConversation.create({
      user: req.user._id,
      title: "New conversation",
      lastMessageAt: new Date(),
    });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/ai/conversations/:conversationId/messages
// Load the most recent 100 messages, in chronological order.
export const getConversationMessages = async (
  req,
  res,
  next
) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.isValidObjectId(conversationId)) {
      return next(handleError(400, "Invalid conversation ID."));
    }

    const conversation = await AIConversation.findOne({
      _id: conversationId,
      user: req.user._id,
    }).select("_id");

    if (!conversation) {
      return next(handleError(404, "Conversation not found."));
    }

    const messages = await AIMessage.find({
      conversation: conversation._id,
      user: req.user._id,
    })
      .sort({ createdAt: -1, _id: -1 })
      .limit(100)
      .lean();

    messages.reverse();

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/ai/conversations/:conversationId
// Delete a conversation and its messages.
export const deleteConversation = async (
  req,
  res,
  next
) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.isValidObjectId(conversationId)) {
      return next(handleError(400, "Invalid conversation ID."));
    }

    const conversation = await AIConversation.findOneAndDelete({
      _id: conversationId,
      user: req.user._id,
    });

    if (!conversation) {
      return next(handleError(404, "Conversation not found."));
    }

    await AIMessage.deleteMany({
      conversation: conversation._id,
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
