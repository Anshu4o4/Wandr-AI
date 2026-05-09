import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import logger from '../utils/logger.js';

export const getTripReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ trip: req.params.tripId });
    res.status(200).json({ status: 'success', results: reviews.length, data: { reviews } });
  } catch (error) {
    logger.error(error.message, { stack: error.stack, route: req.originalUrl });
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const tripId = req.params.tripId;
    const userId = req.user.id;
    
    // Check if user actually booked this trip and completed it (or just confirmed for now)
    const activeBooking = await Booking.findOne({
      user: userId,
      trip: tripId,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (!activeBooking) {
      return res.status(403).json({ status: 'error', message: 'You can only review trips you have booked' });
    }

    const review = await Review.create({
      trip: tripId,
      user: userId,
      rating: req.body.rating,
      review: req.body.review
    });

    res.status(201).json({ status: 'success', data: { review } });
  } catch (error) {
    logger.error(error.message, { stack: error.stack, userId: req.user?._id, route: req.originalUrl });
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ status: 'error', message: 'Review not found' });
    }

    if (review.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to delete this review' });
    }

    await review.deleteOne();
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    logger.error(error.message, { stack: error.stack, userId: req.user?._id, route: req.originalUrl });
    next(error);
  }
};
