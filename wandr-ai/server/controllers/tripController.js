import Trip from '../models/Trip.js';
import logger from '../utils/logger.js';
import { calculatePriceRange } from '../data/costOfLivingIndex.js';

export const getAllTrips = async (req, res, next) => {
  try {
    const { category, budget, destination, country, sort, page = 1, limit = 10 } = req.query;
    
    // Filtering
    const queryObj = { isPublished: true };
    if (category) queryObj.category = { $in: category.split(',') };
    if (budget) queryObj.budget = budget;
    if (country) queryObj.country = new RegExp(country, 'i');
    
    // Use text search index for destination instead of regex (much faster)
    if (destination) {
      queryObj.$text = { $search: destination };
    }

    let query = Trip.find(queryObj);

    // Sorting - if text search is used, sort by relevance score
    if (destination) {
      query = query.sort({ score: { $meta: 'textScore' } });
    } else if (sort) {
      const sortBy = sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(Number(limit));

    const trips = await query;
    const total = await Trip.countDocuments(queryObj);

    res.status(200).json({
      status: 'success',
      results: trips.length,
      data: { trips },
      pagination: { 
        total, 
        page: Number(page), 
        totalPages: Math.ceil(total / limit) 
      }
    });
  } catch (error) {
    logger.error(error.message, { stack: error.stack, route: req.originalUrl });
    next(error);
  }
};

export const getTrip = async (req, res, next) => {
  try {
    // We would populate reviews here if we had a virtual populate setup
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ status: 'error', message: 'No trip found with that ID' });
    }
    
    // Fetch reviews separately or use virtual populate
    res.status(200).json({ status: 'success', data: { trip } });
  } catch (error) {
    logger.error(error.message, { stack: error.stack, route: req.originalUrl });
    next(error);
  }
};

export const createTrip = async (req, res, next) => {
  try {
    const tripData = { ...req.body, createdBy: req.user.id };
    
    // Calculate prices based on country and budget
    if (tripData.country && tripData.duration && tripData.budget) {
      tripData.calculatedPrices = calculatePriceRange(
        tripData.country,
        tripData.duration,
        tripData.budget
      );
    }
    
    const newTrip = await Trip.create(tripData);
    res.status(201).json({ status: 'success', data: { trip: newTrip } });
  } catch (error) {
    logger.error(error.message, { stack: error.stack, userId: req.user?._id, route: req.originalUrl });
    next(error);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const tripData = req.body;
    
    // Recalculate prices if country, duration, or budget changed
    const trip = await Trip.findById(req.params.id);
    if (trip && (tripData.country || tripData.duration || tripData.budget)) {
      const country = tripData.country || trip.country;
      const duration = tripData.duration || trip.duration;
      const budget = tripData.budget || trip.budget;
      
      if (country && duration && budget) {
        tripData.calculatedPrices = calculatePriceRange(country, duration, budget);
      }
    }
    
    const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, tripData, {
      new: true,
      runValidators: true,
    });
    
    if (!updatedTrip) {
      return res.status(404).json({ status: 'error', message: 'No trip found with that ID' });
    }
    
    res.status(200).json({ status: 'success', data: { trip: updatedTrip } });
  } catch (error) {
    logger.error(error.message, { stack: error.stack, userId: req.user?._id, route: req.originalUrl });
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) {
      return res.status(404).json({ status: 'error', message: 'No trip found with that ID' });
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const getTopRated = async (req, res, next) => {
  try {
    const trips = await Trip.find({ isPublished: true }).sort('-rating').limit(5);
    res.status(200).json({ status: 'success', results: trips.length, data: { trips } });
  } catch (error) {
    next(error);
  }
};

export const getFeatured = async (req, res, next) => {
  try {
    // Just using highly rated or random. For now top 6 latest highly rated
    const trips = await Trip.find({ isPublished: true, rating: { $gte: 4.5 } }).limit(6).sort('-createdAt');
    res.status(200).json({ status: 'success', results: trips.length, data: { trips } });
  } catch (error) {
    next(error);
  }
};
