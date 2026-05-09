import Booking from '../models/Booking.js';
import Trip from '../models/Trip.js';
import * as stripeService from '../services/stripeService.js';
import logger from '../utils/logger.js';

export const createBooking = async (req, res, next) => {
  try {
    const { tripId, startDate, endDate, groupSize, specialRequests } = req.body;
    
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ status: 'error', message: 'Trip not found' });
    }

    const totalPrice = trip.price * groupSize;

    // Create a payment intent using stripe
    const paymentIntent = await stripeService.createPaymentIntent(totalPrice, {
      userId: req.user.id,
      tripId,
    });

    const isMock = paymentIntent.id.startsWith('mock_');

    const booking = await Booking.create({
      user: req.user.id,
      trip: tripId,
      startDate,
      endDate,
      groupSize,
      totalPrice,
      specialRequests,
      stripePaymentIntentId: paymentIntent.id,
      isMockPayment: isMock,
      // If mock payment succeeded immediately, confirm the booking
      status: (isMock && paymentIntent.status === 'succeeded') ? 'confirmed' : 'pending',
      paymentStatus: (isMock && paymentIntent.status === 'succeeded') ? 'paid' : 'unpaid'
    });

    logger.info('Booking created', { 
      bookingId: booking._id, 
      userId: req.user.id, 
      tripId, 
      amount: totalPrice 
    });

    res.status(201).json({
      status: 'success',
      data: {
        booking,
        clientSecret: paymentIntent.client_secret
      }
    });

  } catch (error) {
    logger.error(error.message, { stack: error.stack, userId: req.user?._id, route: req.originalUrl });
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id });
    res.status(200).json({ status: 'success', results: bookings.length, data: { bookings } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings (Admin only)
 * @route   GET /api/v1/bookings/all
 * @access  Private/Admin
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const total = await Booking.countDocuments();

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }
    
    // Check if user owns booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'You do not have permission' });
    }

    res.status(200).json({ status: 'success', data: { booking } });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }

    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'You do not have permission' });
    }

    // Only allow cancelling if 'pending' or 'confirmed'
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ status: 'error', message: 'Booking cannot be cancelled' });
    }

    // Process refund if paid
    if (booking.paymentStatus === 'paid' && booking.stripePaymentIntentId) {
      await stripeService.refundPayment(booking.stripePaymentIntentId);
      booking.paymentStatus = 'refunded';
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({ status: 'success', data: { booking } });
  } catch (error) {
    next(error);
  }
};

export const webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripeService.verifyWebhook(req.body, signature);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Find booking
    const booking = await Booking.findOne({ stripePaymentIntentId: paymentIntent.id });
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();
      logger.info('Payment confirmed', { bookingId: booking._id, amount: booking.totalPrice });
    }
  }

  res.status(200).json({ 
    status: 'success',
    data: { received: true } 
  });
};
