import { createServer } from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/database.js";
import { initSocket } from "./config/socket.js";
import authRoutes from "./routes/auth.js";
import landlordDashboardRoutes from "./routes/landlordDashboardRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

// ─── Required ENV Validation ──────────────────────────────────────────────────
const REQUIRED_ENV_VARS = [
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "SMTP_EMAIL",
  "SMTP_PASSWORD",
];

const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(
    `[STARTUP ERROR] Missing required environment variables: ${missingVars.join(", ")}`,
  );
  console.error(
    "Server cannot start without these variables. Check your .env file.",
  );
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Sanitize body/params (skip multipart — multer hasn't parsed it yet)
app.use((req, res, next) => {
  const isMultipart = req.headers["content-type"]?.startsWith(
    "multipart/form-data",
  );

  if (!isMultipart && req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);

  if (req.query) {
    const sanitized = mongoSanitize.sanitize({ ...req.query });
    Object.keys(req.query).forEach((k) => delete req.query[k]);
    Object.assign(req.query, sanitized);
  }

  next();
});

// ─── Root Route ───────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Rentify Backend API",
    version: "2.0.0",
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);              // user/landlord/admin auth + OTP flows
app.use("/api/landlord", landlordDashboardRoutes); // landlord profile, properties, analytics
app.use("/api/properties", propertyRoutes);    // public property list/search/view
app.use("/api/bookings", bookingRoutes);       // tenant bookings
app.use("/api/payments", paymentRoutes);       // payment processing

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  console.log("404 hit:", req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);

  if (err.name === "MulterError" || err.message?.includes("Only JPEG")) {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res
      .status(400)
      .json({ success: false, message: messages.join(". ") });
  }

  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid resource ID format" });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res
      .status(400)
      .json({ success: false, message: `${field} already exists` });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(
      "MongoDB connection failed. Starting server without DB:",
      error.message,
    );
  }

  httpServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n❌ Port ${PORT} is already in use by another process.`);
      console.error(`   Find it:  netstat -ano | findstr :${PORT}`);
      console.error(`   Kill it:  taskkill /PID <PID> /F\n`);
    } else {
      console.error("Server error:", err.message);
    }
    process.exit(1);
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`\n✅ Server running on http://0.0.0.0:${PORT}`);
    console.log(`   Local:    http://localhost:${PORT}`);
    console.log(`   Network:  http://<your-wifi-ip>:${PORT}\n`);
  });
};

startServer();
