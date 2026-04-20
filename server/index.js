import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/database.js';
import { initSocket } from './config/socket.js';
import authRoutes from './routes/auth.js';
import ownerRoutes from './routes/ownerRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

// ─── Required ENV Validation ──────────────────────────────────────────────────
// Fail fast at startup if critical credentials are missing, rather than
// allowing the server to start in a broken state that silently fails later.
const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_EMAIL',
  'SMTP_PASSWORD',
];

const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`[STARTUP ERROR] Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Server cannot start without these variables. Check your .env file.');
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

// ─── Security Middleware ──────────────────────────────────────────────────────

// Helmet sets secure HTTP headers (X-Frame-Options, HSTS, CSP, etc.)
app.use(helmet());

// CORS — restrict origins in production via environment variable
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
// Must come BEFORE sanitize so req.body is populated when sanitize runs.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize request body/query/params to prevent MongoDB operator injection
// (e.g. { "$gt": "" } becomes { "gt": "" })
// express-mongo-sanitize tries to reassign req.query which is a read-only getter
// in Express 5, so we sanitize body and params through the library and manually
// sanitize query/headers in-place to avoid the TypeError.
app.use((req, res, next) => {
  // Skip sanitizing body for multipart/form-data — multer hasn't parsed it yet at this point.
  // Multer populates req.body AFTER this global middleware runs, so sanitizing here would
  // overwrite the body with an empty object. Multipart body is sanitized in each controller.
  const isMultipart = req.headers['content-type']?.startsWith('multipart/form-data');

  if (!isMultipart && req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);

  // Sanitize query in-place (req.query is a read-only getter in Express 5)
  if (req.query) {
    const sanitized = mongoSanitize.sanitize({ ...req.query });
    Object.keys(req.query).forEach((k) => delete req.query[k]);
    Object.assign(req.query, sanitized);
  }

  next();
});

// ─── Root Route ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ahsaanullah Backend API',
    version: '2.0.0',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);      // signup, login, OTP flows
app.use('/api/owner', ownerRoutes);    // profile, hostels, analytics
app.use('/api', publicRoutes);         // PATCH /api/hostels/:id/view

// ─── Mobile / Generic Rentify Routes ─────────────────────────────────────────
app.use('/api/properties', propertyRoutes); // public list/search + radius
app.use('/api/bookings', bookingRoutes);    // tenant bookings
app.use('/api/payments', paymentRoutes);    // fake payment processing

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  console.log('404 hit:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Receives errors forwarded by next(error) from all controllers and middleware.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);

  // Handle multer errors (file size exceeded, wrong MIME type)
  if (err.name === 'MulterError' || err.message?.includes('Only JPEG')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Handle Mongoose validation / cast errors with descriptive messages
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
  }

  // Duplicate key error (e.g. unique email constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('MongoDB connection failed. Starting server without DB:', error.message);
  }

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
