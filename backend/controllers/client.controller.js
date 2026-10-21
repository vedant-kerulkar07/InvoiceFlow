import Client from "../models/Client.model.js";
import Invoice from "../models/Invoice.model.js";
import { handleError } from "../helpers/handleError.js";
import { validateGST } from "../helpers/validateGST.js";

// CREATE CLIENT
export const createClient = async (req, res, next) => {
  try {
    const {
      name,
      companyName,
      email,
      phone,
      billingAddress,
      gstNumber,
    } = req.body;

    if (!name || !email) {
      return next(
        handleError(400, "Client name and email are required")
      );
    }

    // Validate GST number
    const gstValidation = validateGST(gstNumber);

    if (!gstValidation.valid) {
      return next(handleError(400, gstValidation.message));
    }

    const client = await Client.create({
      user: req.user._id,
      name,
      companyName,
      email: email.toLowerCase(),
      phone,
      billingAddress,
      gstNumber: gstValidation.value,
    });

    res.status(201).json({
      success: true,
      message: "Client created successfully",
      client,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

// GET ALL CLIENTS / SEARCH CLIENTS
export const getClients = async (req, res, next) => {
  try {
    const { search } = req.query;

    const filter = {
      user: req.user._id,
    };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      filter.$or = [
        { name: searchRegex },
        { companyName: searchRegex },
        { email: searchRegex },
      ];
    }

    const clients = await Client.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      clients,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

// GET SINGLE CLIENT
export const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!client) {
      return next(handleError(404, "Client not found"));
    }

    res.status(200).json({
      success: true,
      client,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

// UPDATE CLIENT
export const updateClient = async (req, res, next) => {
  try {
    const {
      name,
      companyName,
      email,
      phone,
      billingAddress,
      gstNumber,
    } = req.body;

    const client = await Client.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!client) {
      return next(handleError(404, "Client not found"));
    }

    // Validate GST only when provided
    if (gstNumber !== undefined && gstNumber !== null) {
      const gstValidation = validateGST(gstNumber);

      if (!gstValidation.valid) {
        return next(handleError(400, gstValidation.message));
      }

      client.gstNumber = gstValidation.value;
    }

    client.name = name ?? client.name;
    client.companyName = companyName ?? client.companyName;
    client.email = email?.toLowerCase() ?? client.email;
    client.phone = phone ?? client.phone;
    client.billingAddress =
      billingAddress ?? client.billingAddress;

    await client.save();

    res.status(200).json({
      success: true,
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

// DELETE CLIENT
export const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!client) {
      return next(handleError(404, "Client not found"));
    }

    const invoiceExists = await Invoice.exists({
      client: req.params.id,
      user: req.user._id,
    });

    if (invoiceExists) {
      return next(
        handleError(
          409,
          "Client cannot be deleted because invoices exist for this client"
        )
      );
    }

    await Client.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
