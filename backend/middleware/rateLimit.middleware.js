import { rateLimit, ipKeyGenerator } from "express-rate-limit";

// ---------------- SHARED CONFIGURATION ----------------

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

// Disables all limiters while load testing (LOAD_TEST=true).
// Never active in production, even if the variable is set by mistake.
const skipDuringLoadTest = () =>
  process.env.NODE_ENV !== "production" &&
  process.env.LOAD_TEST === "true";

// Use user ID for authenticated requests and a safely normalized
// IP address as the fallback.
const userOrIpKey = (req) => {
  if (req.user?._id) {
    return `user:${req.user._id.toString()}`;
  }

  return `ip:${ipKeyGenerator(req.ip)}`;
};

const createUserLimiter = ({
  windowMs = FIFTEEN_MINUTES,
  limit,
  message,
}) =>
  rateLimit({
    windowMs,
    limit,
    keyGenerator: userOrIpKey,
    skip: skipDuringLoadTest,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

// ---------------- AUTH LIMITERS ----------------

// Uses the default IP-based key generator.
export const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  skip: skipDuringLoadTest,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

export const registerLimiter = rateLimit({
  windowMs: ONE_HOUR,
  limit: 5,
  skip: skipDuringLoadTest,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many accounts created. Please try again in an hour.",
  },
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 3,
  skip: skipDuringLoadTest,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many password-reset requests. Please try again in 15 minutes.",
  },
});

export const verifyOtpLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skip: skipDuringLoadTest,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many OTP verification attempts. Please try again in 15 minutes.",
  },
});

export const resetPasswordLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  skip: skipDuringLoadTest,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many password-reset attempts. Please try again in 15 minutes.",
  },
});

// Current user (/auth/me): called on every page load, so a generous limit.
// Uses the default IP-based key because it runs before `protect`.
export const meLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 100,
  skip: skipDuringLoadTest,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again in 15 minutes.",
  },
});

// ---------------- CLIENT LIMITERS ----------------

export const clientReadLimiter = createUserLimiter({
  limit: 100,
  message: "Too many requests. Please try again in 15 minutes.",
});

export const clientWriteLimiter = createUserLimiter({
  limit: 30,
  message: "Too many changes. Please try again in 15 minutes.",
});

// ---------------- INVOICE LIMITERS ----------------

export const invoiceReadLimiter = createUserLimiter({
  limit: 100,
  message: "Too many requests. Please try again in 15 minutes.",
});

export const invoiceWriteLimiter = createUserLimiter({
  limit: 30,
  message: "Too many changes. Please try again in 15 minutes.",
});

export const invoiceExportLimiter = createUserLimiter({
  limit: 10,
  message: "Too many export requests. Please try again in 15 minutes.",
});

// ---------------- DASHBOARD LIMITER ----------------

export const dashboardLimiter = createUserLimiter({
  limit: 60,
  message: "Too many requests. Please try again in 15 minutes.",
});

// ---------------- AI LIMITERS ----------------

export const aiChatLimiter = createUserLimiter({
  windowMs: TEN_MINUTES,
  limit: 20,
  message: "You've reached the AI request limit. Please try again later.",
});

export const createConversationLimiter = createUserLimiter({
  limit: 10,
  message: "Too many new conversations. Please try again in 15 minutes.",
});

export const historyReadLimiter = createUserLimiter({
  limit: 100,
  message: "Too many requests. Please try again in 15 minutes.",
});

export const deleteConversationLimiter = createUserLimiter({
  limit: 30,
  message: "Too many delete requests. Please try again in 15 minutes.",
});