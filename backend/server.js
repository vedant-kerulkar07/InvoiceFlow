import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import clientRoutes from "./routes/client.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import invoiceExportRoutes from "./routes/invoiceExport.routes.js";
import aiRoutes from "./routes/ai.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- CORS CONFIGURATION --------------------

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  throw new Error(
    "CLIENT_URL is missing. Configure your frontend origin in backend/.env."
  );
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. some server-to-server requests).
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.warn(`Blocked CORS request from: ${origin}`);

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

// -------------------- MIDDLEWARE --------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -------------------- HEALTH CHECK --------------------

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "InvoiceFlow API is running",
  });
});

// -------------------- API ROUTES --------------------

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/invoice-export", invoiceExportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);

// -------------------- GLOBAL ERROR HANDLER --------------------

app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Handle rejected CORS origins without exposing internal details.
  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal Server Error"
        : err.message || "Request failed",
  });
});

// -------------------- START SERVER --------------------

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`InvoiceFlow API is running on port ${PORT}`);
      console.log("Allowed frontend origins:", allowedOrigins);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
