import express from 'express';
import * as aiController from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { generateItineraryLimiter, suggestTripsLimiter, chatLimiter } from '../middleware/aiRateLimit.js';

const router = express.Router();

// Public chat endpoint for homepage assistant with rate limiting
router.post('/chat', chatLimiter, aiController.chat);

// Keep planning endpoints protected for authenticated users with rate limiting
router.post('/generate-itinerary', generateItineraryLimiter, protect, aiController.generateItinerary);
router.post('/suggest-trips', suggestTripsLimiter, protect, aiController.suggestTrips);

export default router;
