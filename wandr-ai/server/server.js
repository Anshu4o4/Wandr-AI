import * as Sentry from '@sentry/node';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import requestLogger from './middleware/requestLogger.js';

// Load env vars
dotenv.config();

// Sentry initialization
Sentry.init({
  dsn: process.env.SENTRY_DSN_BACKEND,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Validation function for required env vars
const validateEnv = () => {
  const required = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'CLIENT_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`ERROR: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  // Security checks for production
  if (process.env.NODE_ENV === 'production') {
    const weakSecrets = ['secret', 'your_jwt_secret', 'your_jwt_access_secret_key_here', 'your_jwt_refresh_secret_key_here'];
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (accessSecret.length < 32 || weakSecrets.includes(accessSecret)) {
      console.error('ERROR: JWT_ACCESS_SECRET is too weak for production (minimum 32 characters, no common values).');
      process.exit(1);
    }
    if (refreshSecret.length < 32 || weakSecrets.includes(refreshSecret)) {
      console.error('ERROR: JWT_REFRESH_SECRET is too weak for production (minimum 32 characters, no common values).');
      process.exit(1);
    }
    
    if (!process.env.CLIENT_URL || process.env.CLIENT_URL === 'http://localhost:5173') {
      console.error('ERROR: Undefined or insecure CLIENT_URL in production.');
      process.exit(1);
    }
  }
};

validateEnv();

// Connect to database
connectDB();

const app = express();

// Set security HTTP headers
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

// Logging middleware
app.use(requestLogger);

// Enable CORS
const allowedOrigins = new Set([process.env.CLIENT_URL].filter(Boolean));

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const isAllowedLocalOrigin =
      process.env.NODE_ENV !== 'production' &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

    if (allowedOrigins.has(origin) || isAllowedLocalOrigin) {
      callback(null, true);
      return;
    }

    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Route Imports
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import bookingRoutes from './routes/bookings.js';
import aiRoutes from './routes/ai.js';
import reviewRoutes from './routes/reviews.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import { webhookCheckout } from './controllers/bookingController.js';
import { getHealth } from './controllers/healthController.js';

// We need raw body for Stripe webhook BEFORE body-parser
app.post('/api/v1/bookings/webhook', express.raw({ type: 'application/json' }), webhookCheckout);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS and parameter pollution
app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes!',
});

const aiLimiter = rateLimit({
  max: 20,
  windowMs: 60 * 60 * 1000, // 20 requests per hour
  message: 'AI request limit reached for this hour. Please try again later.',
});

if (process.env.NODE_ENV === 'production') {
  app.use('/api', limiter);
}
app.use('/api/v1/ai', aiLimiter);

// API Routes
app.get('/api/v1/health', getHealth);

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);

// Sentry error handler (must be after all routes but before any other error middleware)
Sentry.setupExpressErrorHandler(app);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
