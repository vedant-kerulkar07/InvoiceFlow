import Client from "../models/Client.model.js";
import Invoice from "../models/Invoice.model.js";
import { handleError } from "../helpers/handleError.js";
import { updateOverdueInvoices } from "../utils/updateOverdueInvoices.js";

// GET DASHBOARD SUMMARY
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // -----------------------------------------
    // Update overdue invoices first
    // -----------------------------------------
    await updateOverdueInvoices(userId);

    // -----------------------------------------
    // Total clients
    // -----------------------------------------
    const totalClients = await Client.countDocuments({
      user: userId,
    });

    // -----------------------------------------
    // Total invoices
    // -----------------------------------------
    const totalInvoices = await Invoice.countDocuments({
      user: userId,
    });

    // -----------------------------------------
    // Invoice statistics
    // -----------------------------------------
    const invoiceStats = await Invoice.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $group: {
          _id: null,

          // Number of Paid invoices
          paidInvoices: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "Paid"],
                },
                1,
                0,
              ],
            },
          },

          // Number of Unpaid invoices
          unpaidInvoices: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "Unpaid"],
                },
                1,
                0,
              ],
            },
          },

          // Number of Overdue invoices
          overdueInvoices: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "Overdue"],
                },
                1,
                0,
              ],
            },
          },

          // Revenue from Paid invoices
          totalRevenue: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "Paid"],
                },
                "$grandTotal",
                0,
              ],
            },
          },

          // Pending amount from Unpaid + Overdue invoices
          pendingAmount: {
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
        },
      },
    ]);

    // -----------------------------------------
    // Default statistics
    // -----------------------------------------
    const stats = invoiceStats[0] || {
      paidInvoices: 0,
      unpaidInvoices: 0,
      overdueInvoices: 0,
      totalRevenue: 0,
      pendingAmount: 0,
    };

    // -----------------------------------------
    // Recent invoices
    // -----------------------------------------
    const recentInvoices = await Invoice.find({
      user: userId,
    })
      .populate(
        "client",
        "name companyName email"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5);

    // -----------------------------------------
    // Dashboard response
    // -----------------------------------------
    res.status(200).json({
      success: true,

      dashboard: {
        totalClients,
        totalInvoices,

        paidInvoices: stats.paidInvoices,
        unpaidInvoices: stats.unpaidInvoices,
        overdueInvoices: stats.overdueInvoices,

        totalRevenue: stats.totalRevenue,
        pendingAmount: stats.pendingAmount,

        recentInvoices,
      },
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};