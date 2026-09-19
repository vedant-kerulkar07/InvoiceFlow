import jwt from "jsonwebtoken";
import { handleError } from "../helpers/handleError.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return next(handleError(401, "Authentication required"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return next(handleError(401, "Invalid or expired token"));
  }
};