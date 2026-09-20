import Client from "../models/Client.model.js";
import Invoice from "../models/Invoice.model.js";
import { handleError } from "../helpers/handleError.js";
import { updateOverdueInvoices } from "../utils/updateOverdueInvoices.js";

// GET DASHBOARD SUMMARY
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Update overdue invoices first
    await updateOverdueInvoices(userId);

    // Total clients
    const totalClients = await Client.countDocuments({
      user: userId,
    });

    // Total invoices
    const totalInvoices = await Invoice.countDocuments({
      user: userId,
    });

    // Invoice counts by status
    const paidInvoices = await Invoice.countDocuments({
      user: userId,
      status: "Paid",
    });

    const unpaidInvoices = await Invoice.countDocuments({
      user: userId,
      status: "Unpaid",
    });

    const overdueInvoices = await Invoice.countDocuments({
      user: userId,
      status: "Overdue",
    });

    // Total revenue from paid invoices
    const paidRevenueResult = await Invoice.aggregate([
      {
        $match: {
          user: userId,
          status: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$grandTotal",
          },
        },
      },
    ]);

    const totalRevenue =
      paidRevenueResult.length > 0
        ? paidRevenueResult[0].total
        : 0;

    // Pending amount from unpaid + overdue invoices
    const pendingAmountResult = await Invoice.aggregate([
      {
        $match: {
          user: userId,
          status: {
            $in: ["Unpaid", "Overdue"],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$grandTotal",
          },
        },
      },
    ]);

    const pendingAmount =
      pendingAmountResult.length > 0
        ? pendingAmountResult[0].total
        : 0;

    // Recent invoices
    const recentInvoices = await Invoice.find({
      user: userId,
    })
      .populate("client", "name companyName email")
      .sort({
        createdAt: -1,
      })
      .limit(5);

    res.status(200).json({
      success: true,
      dashboard: {
        totalClients,
        totalInvoices,
        paidInvoices,
        unpaidInvoices,
        overdueInvoices,
        totalRevenue,
        pendingAmount,
        recentInvoices,
      },
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};