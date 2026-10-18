
import mongoose from "mongoose";

import Client from "../models/Client.model.js";
import Invoice from "../models/Invoice.model.js";
import AIConversation from "../models/AIConversation.model.js";
import AIMessage from "../models/AIMessage.model.js";

import { handleError } from "../helpers/handleError.js";
import { updateOverdueInvoices } from "../utils/updateOverdueInvoices.js";
import {
  generateInvoiceAssistantReply,
} from "../services/groq.service.js";

// --------------------------------------------------
// Get invoice and financial context for the AI
// --------------------------------------------------

const getInvoiceContext = async (userId) => {
  // Keep invoice statuses current before calculating summaries.
  await updateOverdueInvoices(userId);

  const [
    totalClients,
    totalInvoices,
    summaryResult,
    outstandingByClient,
    outstandingInvoices,
  ] = await Promise.all([
    Client.countDocuments({ user: userId }),

    Invoice.countDocuments({ user: userId }),

    Invoice.aggregate([
      {
        $match: { user: userId },
      },
      {
        $group: {
          _id: null,

          paidAmount: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Paid"] },
                "$grandTotal",
                0,
              ],
            },
          },

          outstandingAmount: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    ["Unpaid", "Overdue"],
                  ],
                },
                "$grandTotal",
                0,
              ],
            },
          },

          totalBilledAmount: {
            $sum: {
              $cond: [
                { $ne: ["$status", "Draft"] },
                "$grandTotal",
                0,
              ],
            },
          },

          paidInvoices: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Paid"] },
                1,
                0,
              ],
            },
          },

          unpaidInvoices: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Unpaid"] },
                1,
                0,
              ],
            },
          },

          overdueInvoices: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Overdue"] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),

    // Clients with the largest outstanding balances.
    Invoice.aggregate([
      {
        $match: {
          user: userId,
          status: { $in: ["Unpaid", "Overdue"] },
        },
      },
      {
        $group: {
          _id: "$client",
          outstandingAmount: {
            $sum: "$grandTotal",
          },
          invoiceCount: {
            $sum: 1,
          },
        },
      },
      {
        $lookup: {
          from: "clients",
          let: { clientId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$clientId"] },
                    { $eq: ["$user", userId] },
                  ],
                },
              },
            },
            {
              $project: {
                name: 1,
                companyName: 1,
              },
            },
          ],
          as: "client",
        },
      },
      {
        $unwind: "$client",
      },
      {
        $project: {
          _id: 0,
          clientName: {
            $ifNull: [
              "$client.companyName",
              "$client.name",
            ],
          },
          outstandingAmount: 1,
          invoiceCount: 1,
        },
      },
      {
        $sort: { outstandingAmount: -1 },
      },
      {
        $limit: 10,
      },
    ]),

    // Include at most 30 outstanding invoices.
    Invoice.find({
      user: userId,
      status: { $in: ["Unpaid", "Overdue"] },
    })
      .select(
        "invoiceNumber grandTotal dueDate status client"
      )
      .populate("client", "name companyName")
      .sort({ dueDate: 1 })
      .limit(30)
      .lean(),
  ]);

  const summary = summaryResult[0] || {
    paidAmount: 0,
    outstandingAmount: 0,
    totalBilledAmount: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    overdueInvoices: 0,
  };

  return {
    generatedAt: new Date().toISOString(),

    totals: {
      totalClients,
      totalInvoices,
      paidInvoices: summary.paidInvoices,
      unpaidInvoices: summary.unpaidInvoices,
      overdueInvoices: summary.overdueInvoices,
    },

    financialSummary: {
      paidAmount: summary.paidAmount,
      outstandingAmount: summary.outstandingAmount,
      totalBilledAmount: summary.totalBilledAmount,
    },

    topClientsByOutstandingBalance: outstandingByClient,

    outstandingInvoices: outstandingInvoices.map(
      (invoice) => ({
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.grandTotal,
        dueDate: invoice.dueDate,
        status: invoice.status,
        client: invoice.client
          ? {
              name: invoice.client.name,
              companyName:
                invoice.client.companyName || "",
            }
          : null,
      })
    ),

    outstandingInvoiceListLimitedTo: 30,
  };
};

// --------------------------------------------------
// POST /api/ai/chat
// Generate a reply and persist the conversation
// --------------------------------------------------

export const chatWithAssistant = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user._id;
    const { message, conversationId } = req.body;

    // Validate the current message.
    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return next(
        handleError(400, "Please enter a message.")
      );
    }

    const cleanMessage = message.trim();

    if (cleanMessage.length > 1000) {
      return next(
        handleError(
          400,
          "Message cannot exceed 1000 characters."
        )
      );
    }

    // A conversation must be selected before chatting.
    if (
      typeof conversationId !== "string" ||
      !mongoose.Types.ObjectId.isValid(conversationId)
    ) {
      return next(
        handleError(
          400,
          "A valid conversation ID is required."
        )
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return next(
        handleError(
          503,
          "The AI assistant is not configured yet."
        )
      );
    }

    // Ensure this conversation belongs to the logged-in user.
    const conversation = await AIConversation.findOne({
      _id: conversationId,
      user: userId,
    });

    if (!conversation) {
      return next(
        handleError(
          404,
          "Conversation not found."
        )
      );
    }

    // Load conversation history from MongoDB.
    // The database, not the browser, is the source of truth.
    const previousMessages = await AIMessage.find({
      conversation: conversation._id,
      user: userId,
    })
      .sort({ createdAt: -1, _id: -1 })
      .limit(6)
      .lean();

    const history = previousMessages
      .reverse()
      .map((item) => ({
        role: item.role,
        content: item.content,
      }));

    // Fetch current invoice data belonging to this user.
    const context = await getInvoiceContext(userId);

    // Generate the AI response.
    const reply = await generateInvoiceAssistantReply({
      message: cleanMessage,
      context,
      history,
    });

    if (typeof reply !== "string" || !reply.trim()) {
      throw new Error(
        "The AI assistant returned an empty response."
      );
    }

    const cleanReply = reply.trim();
    const now = new Date();

    // Persist the user message and AI reply.
    await AIMessage.create([
      {
        conversation: conversation._id,
        user: userId,
        role: "user",
        content: cleanMessage,
      },
      {
        conversation: conversation._id,
        user: userId,
        role: "assistant",
        content: cleanReply,
      },
    ]);

    // Set the conversation title from its first message.
    if (conversation.title === "New conversation") {
      conversation.title =
        cleanMessage.length > 60
          ? `${cleanMessage.slice(0, 57)}...`
          : cleanMessage;
    }

    conversation.lastMessageAt = now;
    await conversation.save();

    return res.status(200).json({
      success: true,
      conversationId: conversation._id,
      reply: cleanReply,
    });
  } catch (error) {
    console.error("AI assistant request failed:", {
      name: error.name,
      statusCode: error.statusCode,
      status: error.status,
      message: error.message,
      code: error.code,
      providerError: error.error,
    });

    if (error.statusCode === 503) {
      return next(error);
    }

    return next(
      handleError(
        502,
        "The AI assistant could not respond. Please try again."
      )
    );
  }
};
