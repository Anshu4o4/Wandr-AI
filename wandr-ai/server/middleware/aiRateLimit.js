import rateLimit from 'express-rate-limit';

/**
 * Rate limiters for AI endpoints to prevent abuse
 * Each AI operation has different limits based on API cost and performance impact
 */

// Generate Itinerary: 10 requests per hour (most expensive operation)
export const generateItineraryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many itinerary requests. You can generate up to 10 itineraries per hour. Please wait before trying again.'
  },
  statusCode: 429,
  skip: (req) => {
    // Admin users bypass rate limits
    return req.user?.role === 'admin';
  }
});

// Suggest Trips: 20 requests per hour (moderate cost)
export const suggestTripsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many trip suggestion requests. You can make up to 20 suggestions per hour. Please wait before trying again.'
  },
  statusCode: 429,
  skip: (req) => {
    return req.user?.role === 'admin';
  }
});

// Chat: 30 requests per hour (fastest, least expensive)
export const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many chat requests. You can send up to 30 messages per hour. Please wait before trying again.'
  },
  statusCode: 429,
  skip: (req) => {
    // Allow unlimited chat for admin
    return req.user?.role === 'admin';
  }
});
