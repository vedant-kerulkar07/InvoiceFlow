import User from "../models/User.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { handleError } from "../helpers/handleError.js";
import { sendResetOtpEmail } from "../helpers/sendResetOtpEmail.js";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;

// --------------------- HELPERS ---------------------

const normalizeEmail = (email = "") =>
  String(email).trim().toLowerCase();

const hashValue = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const safeCompare = (first, second) => {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  return (
    firstBuffer.length === secondBuffer.length &&
    crypto.timingSafeEqual(firstBuffer, secondBuffer)
  );
};

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const setAuthCookie = (res, token) => {
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
};

const clearResetFields = (user) => {
  user.resetOtp = null;
  user.resetOtpExpiry = null;
  user.resetOtpAttempts = 0;
  user.resetVerifiedTokenHash = null;
  user.resetVerifiedTokenExpiry = null;
};

// --------------------- REGISTER ---------------------

export const Register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return next(
        handleError(400, "Name, email and password are required")
      );
    }

    if (password.length < 6 || password.length > 128) {
      return next(
        handleError(
          400,
          "Password must be between 6 and 128 characters"
        )
      );
    }

    const normalizedEmail = normalizeEmail(email);

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return next(handleError(409, "User already registered"));
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user);
    setAuthCookie(res, token);

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      success: true,
      user: userData,
      message: "Registration successful",
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(handleError(409, "User already registered"));
    }

    next(handleError(500, "Registration failed"));
  }
};

// --------------------- LOGIN ---------------------

export const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return next(
        handleError(400, "Email and password are required")
      );
    }

    const user = await User.findOne({
      email: normalizeEmail(email),
    });

    if (!user) {
      return next(handleError(401, "Invalid email or password"));
    }

    const isMatch = await bcryptjs.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return next(handleError(401, "Invalid email or password"));
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      user: userData,
      message: "Login successful",
    });
  } catch (error) {
    next(handleError(500, "Login failed"));
  }
};

// --------------------- LOGOUT ---------------------

export const Logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(handleError(500, "Logout failed"));
  }
};

// --------------------- GET CURRENT USER ---------------------

export const GetMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password"
    );

    if (!user) {
      return next(handleError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(handleError(500, "Failed to fetch current user"));
  }
};

// --------------------- FORGOT PASSWORD ---------------------

export const ForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return next(handleError(400, "Email is required"));
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+resetOtp +resetOtpExpiry +resetOtpAttempts " +
        "+resetVerifiedTokenHash +resetVerifiedTokenExpiry"
    );

    // Use the same response whether or not the email exists.
    // This helps prevent account/email enumeration.
    const genericResponse = {
      success: true,
      message:
        "If an account exists for this email, a password reset OTP will be sent.",
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    user.resetOtp = hashValue(otp);
    user.resetOtpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
    user.resetOtpAttempts = 0;

    // Invalidate any previous verified reset token.
    user.resetVerifiedTokenHash = null;
    user.resetVerifiedTokenExpiry = null;

    await user.save();

    try {
      await sendResetOtpEmail(user.email, user.name, otp);
    } catch (emailError) {
      // Invalidate the OTP if email delivery fails.
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      user.resetOtpAttempts = 0;
      await user.save();

      return next(
        handleError(500, "Unable to send OTP email. Please try again.")
      );
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    next(handleError(500, "Failed to process password reset request"));
  }
};

// --------------------- VERIFY OTP ---------------------

export const VerifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return next(
        handleError(400, "A valid email and 6-digit OTP are required")
      );
    }

    const user = await User.findOne({
      email: normalizeEmail(email),
    }).select(
      "+resetOtp +resetOtpExpiry +resetOtpAttempts " +
        "+resetVerifiedTokenHash +resetVerifiedTokenExpiry"
    );

    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return next(handleError(400, "Invalid or expired OTP"));
    }

    if (user.resetOtpExpiry.getTime() <= Date.now()) {
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      user.resetOtpAttempts = 0;
      await user.save();

      return next(handleError(400, "OTP has expired. Request a new one."));
    }

    if (user.resetOtpAttempts >= MAX_OTP_ATTEMPTS) {
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      user.resetOtpAttempts = 0;
      await user.save();

      return next(
        handleError(429, "Too many incorrect attempts. Request a new OTP.")
      );
    }

    const submittedOtpHash = hashValue(otp);

    if (!safeCompare(submittedOtpHash, user.resetOtp)) {
      user.resetOtpAttempts += 1;

      if (user.resetOtpAttempts >= MAX_OTP_ATTEMPTS) {
        user.resetOtp = null;
        user.resetOtpExpiry = null;
        user.resetOtpAttempts = 0;
      }

      await user.save();

      return next(handleError(400, "Invalid or expired OTP"));
    }

    // OTP is valid. Generate a temporary, one-time reset token.
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetOtp = null;
    user.resetOtpExpiry = null;
    user.resetOtpAttempts = 0;
    user.resetVerifiedTokenHash = hashValue(resetToken);
    user.resetVerifiedTokenExpiry = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MS
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
      expiresIn: RESET_TOKEN_EXPIRY_MS / 1000,
    });
  } catch (error) {
    next(handleError(500, "Failed to verify OTP"));
  }
};

// --------------------- RESET PASSWORD ---------------------

export const ResetPassword = async (req, res, next) => {
  try {
    const { resetToken, password, confirmPassword } = req.body;

    if (
      typeof resetToken !== "string" ||
      !resetToken.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return next(
        handleError(400, "Reset token and new password are required")
      );
    }

    if (password.length < 6 || password.length > 128) {
      return next(
        handleError(
          400,
          "Password must be between 6 and 128 characters"
        )
      );
    }

    // If the frontend sends confirmPassword, validate it too.
    if (
      confirmPassword !== undefined &&
      confirmPassword !== password
    ) {
      return next(handleError(400, "Passwords do not match"));
    }

    const user = await User.findOne({
      resetVerifiedTokenHash: hashValue(resetToken),
      resetVerifiedTokenExpiry: { $gt: new Date() },
    }).select(
      "+resetOtp +resetOtpExpiry +resetOtpAttempts " +
        "+resetVerifiedTokenHash +resetVerifiedTokenExpiry"
    );

    if (!user) {
      return next(
        handleError(400, "Invalid or expired reset token. Verify your OTP again.")
      );
    }

    user.password = await bcryptjs.hash(password, 10);

    // A reset token must only work once.
    clearResetFields(user);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    next(handleError(500, "Failed to reset password"));
  }
};