import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Review must belong to a trip'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      required: [true, 'Review must have a rating'],
    },
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
      maxlength: [500, 'Review cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews: One review per user per trip
reviewSchema.index({ trip: 1, user: 1 }, { unique: true });

// Additional indexes for performance optimization
reviewSchema.index({ trip: 1, createdAt: -1 }); // For "reviews for this trip" query
reviewSchema.index({ user: 1 }); // For "my reviews" dashboard tab

// Auto populate user on queries
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name avatar',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
