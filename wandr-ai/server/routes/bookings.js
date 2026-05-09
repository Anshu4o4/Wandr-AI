import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Stripe Webhook needs raw body, usually handled in server.js before body parsing.
// We'll set it up correctly in server.js, but mapping it here for completeness
// router.post('/webhook', express.raw({ type: 'application/json' }), bookingController.webhookCheckout);

router.use(protect);

router.route('/').post(bookingController.createBooking);
router.route('/my-bookings').get(bookingController.getMyBookings);
router.get('/all', restrictTo('admin'), bookingController.getAllBookings);

router
  .route('/:id')
  .get(bookingController.getBooking);

router.route('/:id/cancel').patch(bookingController.cancelBooking);

export default router;
