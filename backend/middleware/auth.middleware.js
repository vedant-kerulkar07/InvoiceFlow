import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { handleError } from "../helpers/handleError.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return next(
        handleError(401, "Authentication required")
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded._id
    ).select("-password");

    if (!user) {
      return next(
        handleError(401, "User not found")
      );
    }

    req.user = user;

    next();
  } catch (error) {
    return next(
      handleError(
        401,
        "Invalid or expired token"
      )
    );
  }
};