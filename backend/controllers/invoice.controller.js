import Invoice from "../models/Invoice.model.js";
import Client from "../models/Client.model.js";
import { handleError } from "../helpers/handleError.js";

// CREATE INVOICE

export const createInvoice = async (req, res, next) => {
  try {
    const {
      client,
      invoiceNumber,
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

    if (!invoiceNumber) {
      return next(handleError(400, "Invoice number is required"));
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

    const existingClient = await Client.findOne({
      _id: client,
      user: req.user._id,
    });

    if (!existingClient) {
      return next(
        handleError(404, "Client not found")
      );
    }

  
    const existingInvoice = await Invoice.findOne({
      invoiceNumber,
    });

    if (existingInvoice) {
      return next(
        handleError(409, "Invoice number already exists")
      );
    }

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

// GET ALL INVOICES

export const getInvoices = async (req, res, next) => {
  try {
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

// GET SINGLE INVOICE

export const getInvoiceById = async (req, res, next) => {
  try {
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
      invoiceNumber,
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

    // Invoice number
    if (invoiceNumber && invoiceNumber !== invoice.invoiceNumber) {
      const existingInvoice = await Invoice.findOne({
        invoiceNumber,
        _id: { $ne: invoice._id },
      });

      if (existingInvoice) {
        return next(
          handleError(409, "Invoice number already exists")
        );
      }

      invoice.invoiceNumber = invoiceNumber;
    }
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

    if (issueDate !== undefined) {
      invoice.issueDate = issueDate;
    }

    if (dueDate !== undefined) {
      invoice.dueDate = dueDate;
    }

    if (status !== undefined) {
      invoice.status = status;
    }

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
      (total, item) => total + item.quantity * item.rate,
      0
    );

    const taxAmount =
      (subtotal * invoice.taxPercentage) / 100;

    const grandTotal =
      subtotal + taxAmount - invoice.discount;

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
