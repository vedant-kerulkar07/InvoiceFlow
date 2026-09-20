import Invoice from "../models/Invoice.model.js";
import Client from "../models/Client.model.js";
import { handleError } from "../helpers/handleError.js";
import { generateInvoiceNumber } from "../utils/generateInvoiceNumber.js";
import { updateOverdueInvoices } from "../utils/updateOverdueInvoices.js";

// CREATE INVOICE
export const createInvoice = async (req, res, next) => {
  try {
    const {
      client,
      items,
      issueDate,
      dueDate,
      taxPercentage = 0,
      discount = 0,
      status = "Draft",
    } = req.body;

    if (!client) {
      return next(handleError(400, "Client is required"));
    }

    if (!items || items.length === 0) {
      return next(
        handleError(400, "Invoice must contain at least one item")
      );
    }

    if (taxPercentage < 0) {
      return next(
        handleError(400, "Tax percentage cannot be negative")
      );
    }

    if (discount < 0) {
      return next(
        handleError(400, "Discount cannot be negative")
      );
    }

    // Check whether client belongs to logged-in user
    const existingClient = await Client.findOne({
      _id: client,
      user: req.user._id,
    });

    if (!existingClient) {
      return next(handleError(404, "Client not found"));
    }

    // Validate and calculate invoice items
    const calculatedItems = items.map((item) => {
      const quantity = Number(item.quantity);
      const rate = Number(item.rate);

      if (!item.description) {
        throw handleError(
          400,
          "Item description is required"
        );
      }

      if (!Number.isFinite(quantity) || quantity < 1) {
        throw handleError(
          400,
          "Quantity must be at least 1"
        );
      }

      if (!Number.isFinite(rate) || rate < 0) {
        throw handleError(
          400,
          "Rate cannot be negative"
        );
      }

      const amount = quantity * rate;

      return {
        description: item.description,
        quantity,
        rate,
        amount,
      };
    });

    // Calculate subtotal
    const subtotal = calculatedItems.reduce(
      (total, item) => total + item.amount,
      0
    );

    // Calculate tax
    const taxAmount =
      (subtotal * Number(taxPercentage)) / 100;

    // Calculate grand total
    const grandTotal =
      subtotal + taxAmount - Number(discount);

    if (grandTotal < 0) {
      return next(
        handleError(
          400,
          "Discount cannot be greater than the invoice total"
        )
      );
    }

    // Generate invoice number automatically
    const invoiceNumber = await generateInvoiceNumber();

    // Create invoice
    const invoice = await Invoice.create({
      user: req.user._id,
      client,
      invoiceNumber,
      items: calculatedItems,
      issueDate: issueDate || Date.now(),
      dueDate,
      subtotal,
      taxPercentage: Number(taxPercentage),
      taxAmount,
      discount: Number(discount),
      grandTotal,
      status,
    });

    // Populate client information
    await invoice.populate("client");

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    }

    next(handleError(500, error.message));
  }
};

// GET ALL INVOICES / SEARCH / FILTER
export const getInvoices = async (req, res, next) => {
  try {
    // Update overdue invoices before fetching
    await updateOverdueInvoices(req.user._id);

    const {
      search,
      client,
      status,
      fromDate,
      toDate,
    } = req.query;

    const filter = {
      user: req.user._id,
    };

    // Search by invoice number
    if (search && search.trim()) {
      filter.invoiceNumber = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    // Filter by client
    if (client) {
      filter.client = client;
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by issue date
    if (fromDate || toDate) {
      filter.issueDate = {};

      if (fromDate) {
        filter.issueDate.$gte = new Date(fromDate);
      }

      if (toDate) {
        const endDate = new Date(toDate);

        endDate.setHours(23, 59, 59, 999);

        filter.issueDate.$lte = endDate;
      }
    }

    const invoices = await Invoice.find(filter)
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

// GET SINGLE INVOICE
export const getInvoiceById = async (req, res, next) => {
  try {
    // Update overdue invoices before fetching
    await updateOverdueInvoices(req.user._id);

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("client");

    if (!invoice) {
      return next(
        handleError(404, "Invoice not found")
      );
    }

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

// UPDATE INVOICE
export const updateInvoice = async (req, res, next) => {
  try {
    const {
      client,
      items,
      issueDate,
      dueDate,
      taxPercentage,
      discount,
      status,
    } = req.body;

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!invoice) {
      return next(
        handleError(404, "Invoice not found")
      );
    }

    // Update client
    if (client) {
      const existingClient = await Client.findOne({
        _id: client,
        user: req.user._id,
      });

      if (!existingClient) {
        return next(
          handleError(404, "Client not found")
        );
      }

      invoice.client = client;
    }

    // Invoice number is intentionally NOT updated.
    // It is generated automatically during invoice creation.

    // Recalculate items
    if (items) {
      if (!Array.isArray(items) || items.length === 0) {
        return next(
          handleError(
            400,
            "Invoice must contain at least one item"
          )
        );
      }

      invoice.items = items.map((item) => {
        const quantity = Number(item.quantity);
        const rate = Number(item.rate);

        if (!item.description) {
          throw handleError(
            400,
            "Item description is required"
          );
        }

        if (!Number.isFinite(quantity) || quantity < 1) {
          throw handleError(
            400,
            "Quantity must be at least 1"
          );
        }

        if (!Number.isFinite(rate) || rate < 0) {
          throw handleError(
            400,
            "Rate cannot be negative"
          );
        }

        return {
          description: item.description,
          quantity,
          rate,
          amount: quantity * rate,
        };
      });
    }

    // Update issue date
    if (issueDate !== undefined) {
      invoice.issueDate = issueDate;
    }

    // Update due date
    if (dueDate !== undefined) {
      invoice.dueDate = dueDate;
    }

    // Update status
    if (status !== undefined) {
      invoice.status = status;
    }

    // Update tax percentage
    if (taxPercentage !== undefined) {
      if (Number(taxPercentage) < 0) {
        return next(
          handleError(
            400,
            "Tax percentage cannot be negative"
          )
        );
      }

      invoice.taxPercentage = Number(taxPercentage);
    }

    // Update discount
    if (discount !== undefined) {
      if (Number(discount) < 0) {
        return next(
          handleError(
            400,
            "Discount cannot be negative"
          )
        );
      }

      invoice.discount = Number(discount);
    }

    // ALWAYS recalculate totals
    const subtotal = invoice.items.reduce(
      (total, item) =>
        total + item.quantity * item.rate,
      0
    );

    const taxAmount =
      (subtotal * invoice.taxPercentage) / 100;

    const grandTotal =
      subtotal +
      taxAmount -
      invoice.discount;

    if (grandTotal < 0) {
      return next(
        handleError(
          400,
          "Discount cannot be greater than the invoice total"
        )
      );
    }

    invoice.subtotal = subtotal;
    invoice.taxAmount = taxAmount;
    invoice.grandTotal = grandTotal;

    await invoice.save();

    await invoice.populate("client");

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    }

    next(handleError(500, error.message));
  }
};

// DELETE INVOICE
export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!invoice) {
      return next(
        handleError(404, "Invoice not found")
      );
    }

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};