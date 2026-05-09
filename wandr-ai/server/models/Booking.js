import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a User'],
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Booking must belong to a Trip'],
    },
    startDate: {
      type: Date,
      required: [true, 'Booking must have a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Booking must have an end date'],
    },
    groupSize: {
      type: Number,
      required: [true, 'Booking must have a group size'],
      min: [1, 'Group size must be at least 1'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Booking must have a total price'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    stripePaymentIntentId: {
      type: String,
      select: false,
    },
    isMockPayment: {
      type: Boolean,
      default: false,
    },
    specialRequests: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Populate user and trip details automatically when querying bookings
bookingSchema.pre(/^find/, function (next) {
  this.populate('user', 'name email avatar').populate('trip', 'title destination coverImage price rating');
  next();
});

// Indexes for performance optimization
bookingSchema.index({ user: 1, createdAt: -1 }); // For "my bookings" query (most common)
bookingSchema.index({ trip: 1 }); // For "bookings per trip" admin query
bookingSchema.index({ status: 1, paymentStatus: 1 }); // For filtering by status
bookingSchema.index({ stripePaymentIntentId: 1 }); // For webhook lookup (prevents full collection scan)

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
