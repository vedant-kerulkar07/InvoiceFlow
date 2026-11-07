
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // --------------------- USER DETAILS ---------------------
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    // --------------------- FORGOT PASSWORD OTP ---------------------
    resetOtp: {
      type: String,
      default: null,
      select: false,
    },

    resetOtpExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    resetOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    // --------------------- VERIFIED RESET TOKEN ---------------------
    resetVerifiedTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    resetVerifiedTokenExpiry: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
