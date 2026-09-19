import Client from "../models/Client.model.js";
import { handleError } from "../helpers/handleError.js";

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

    const client = await Client.create({
      user: req.user._id,
      name,
      companyName,
      email: email.toLowerCase(),
      phone,
      billingAddress,
      gstNumber,
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

// GET ALL CLIENTS

export const getClients = async (req, res, next) => {
  try {
    const clients = await Client.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

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

    client.name = name ?? client.name;
    client.companyName = companyName ?? client.companyName;
    client.email = email?.toLowerCase() ?? client.email;
    client.phone = phone ?? client.phone;
    client.billingAddress =
      billingAddress ?? client.billingAddress;
    client.gstNumber = gstNumber ?? client.gstNumber;

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
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!client) {
      return next(handleError(404, "Client not found"));
    }

    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
