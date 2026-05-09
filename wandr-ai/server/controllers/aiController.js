import * as openaiService from '../services/openaiService.js';
import logger from '../utils/logger.js';

/**
 * Validate itinerary generation input
 */
const validateItineraryInput = (data) => {
  const errors = [];
  
  // Destination validation
  if (!data.destination || typeof data.destination !== 'string') {
    errors.push('Destination is required and must be a string');
  } else if (data.destination.trim().length < 2) {
    errors.push('Destination must be at least 2 characters');
  } else if (data.destination.length > 100) {
    errors.push('Destination must not exceed 100 characters');
  }
  
  // Days validation
  if (data.days === undefined || data.days === null) {
    errors.push('Days is required');
  } else if (!Number.isInteger(Number(data.days))) {
    errors.push('Days must be an integer');
  } else if (Number(data.days) < 1) {
    errors.push('Days must be at least 1');
  } else if (Number(data.days) > 30) {
    errors.push('Days cannot exceed 30');
  }
  
  // Budget validation
  if (!data.budget || typeof data.budget !== 'string') {
    errors.push('Budget is required and must be a string');
  } else if (!['budget', 'mid-range', 'luxury'].includes(data.budget)) {
    errors.push('Budget must be one of: budget, mid-range, luxury');
  }
  
  // Interests validation (optional)
  if (data.interests !== undefined && data.interests !== null) {
    if (!Array.isArray(data.interests)) {
      errors.push('Interests must be an array');
    } else if (data.interests.length > 10) {
      errors.push('Interests cannot exceed 10 items');
    } else if (!data.interests.every(i => typeof i === 'string')) {
      errors.push('All interests must be strings');
    }
  }
  
  // Group size validation (optional)
  if (data.groupSize !== undefined && data.groupSize !== null) {
    if (!Number.isInteger(Number(data.groupSize))) {
      errors.push('Group size must be an integer');
    } else if (Number(data.groupSize) < 1) {
      errors.push('Group size must be at least 1');
    } else if (Number(data.groupSize) > 50) {
      errors.push('Group size cannot exceed 50');
    }
  }
  
  return errors;
};

export const generateItinerary = async (req, res, next) => {
  try {
    const { destination, days, budget, interests, groupSize } = req.body;
    
    // Validate input
    const validationErrors = validateItineraryInput({ destination, days, budget, interests, groupSize });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const itinerary = await openaiService.generateItinerary({
      destination: destination.trim(),
      days: Number(days),
      budget,
      interests: interests && Array.isArray(interests) ? interests : [],
      groupSize: groupSize ? Number(groupSize) : 1
    });

    logger.info('AI itinerary generated', { 
      userId: req.user?._id, 
      destination, 
      days 
    });

    res.status(200).json({
      status: 'success',
      data: { itinerary }
    });
  } catch (error) {
    logger.error(error.message, { stack: error.stack, userId: req.user?._id, route: req.originalUrl });
    next(error);
  }
};

export const suggestTrips = async (req, res, next) => {
  try {
    const { preferences } = req.body;
    
    // Basic validation
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Preferences is required and must be an object'
      });
    }
    
    const suggestions = await openaiService.suggestTrips(preferences);
    
    res.status(200).json({
      status: 'success',
      data: { suggestions }
    });
  } catch (error) {
    next(error);
  }
};

export const chat = async (req, res, next) => {
  try {
    const { messages, context } = req.body;
    
    // Basic validation
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Messages is required and must be an array'
      });
    }
    
    if (messages.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Messages array cannot be empty'
      });
    }
    
    // Set headers for SSE/streaming
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await openaiService.travelChatStream(messages, context, res);
  } catch (error) {
    logger.error(error.message, { stack: error.stack, userId: req.user?._id, route: req.originalUrl });
    if (!res.headersSent) {
      next(error);
    }
  }
};
