import express from 'express';
import * as tripController from '../controllers/tripController.js';
import { protect, restrictTo } from '../middleware/auth.js';

// If we need nested route for reviews
import reviewRouter from './reviews.js';

const router = express.Router();

router.use('/:tripId/reviews', reviewRouter);

router.get('/top-rated', tripController.getTopRated);
router.get('/featured', tripController.getFeatured);

router
  .route('/')
  .get(tripController.getAllTrips)
  .post(protect, tripController.createTrip);

router
  .route('/:id')
  .get(tripController.getTrip)
  .patch(protect, restrictTo('admin'), tripController.updateTrip)
  .delete(protect, restrictTo('admin'), tripController.deleteTrip);

export default router;
