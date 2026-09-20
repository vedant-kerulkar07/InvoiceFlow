import Invoice from "../models/Invoice.model.js";
import { handleError } from "../helpers/handleError.js";
import { updateOverdueInvoices } from "../utils/updateOverdueInvoices.js";

// GET INVOICES FOR EXPORT
export const getInvoicesForExport = async (req, res, next) => {
  try {
    // Update overdue invoices before fetching
    await updateOverdueInvoices(req.user._id);

    const invoices = await Invoice.find({
      user: req.user._id,
    })
      .populate("client", "name companyName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invoices,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};