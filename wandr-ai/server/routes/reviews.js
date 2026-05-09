import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true }); // Merge params to get tripId from trips route

router
  .route('/')
  .get(reviewController.getTripReviews)
  .post(protect, reviewController.createReview);

router
  .route('/:reviewId')
  .delete(protect, reviewController.deleteReview);

export default router;
