import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Trip must have a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Trip must have a description'],
      trim: true,
    },
    coverImage: {
      type: String,
    },
    destination: {
      type: String,
      required: [true, 'Trip must have a destination'],
      trim: true,
    },
    country: { type: String, trim: true },
    continent: { type: String, trim: true },
    duration: {
      type: Number,
      required: [true, 'Trip must have a duration (days)'],
    },
    budget: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury'],
      default: 'mid-range',
    },
    category: [
      {
        type: String,
        enum: ['beach', 'mountain', 'city', 'cultural', 'adventure', 'food'],
      },
    ],
    itinerary: [
      {
        day: Number,
        title: String,
        theme: String,
        activities: [
          {
            time: String,
            activity: String,
            location: String,
            activityType: String,
            estimatedCost: String,
            tips: String,
          },
        ],
        accommodation: {
          name: String,
          accommodationType: String,
          pricePerNight: String,
        },
        meals: [
          {
            time: String,
            name: String,
            cuisine: String,
            priceRange: String,
          },
        ],
      },
    ],
    price: {
      type: Number,
      required: [true, 'Trip must have a price'],
    },
    priceRange: {
      type: String,
      trim: true,
    },
    calculatedPrices: {
      minPrice: Number,
      maxPrice: Number,
      averagePrice: Number,
      dailyMin: Number,
      dailyMax: Number,
      dailyAverage: Number,
    },
    maxGroupSize: {
      type: Number,
      default: 10,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be above 0'],
      max: [5, 'Rating must be below or equal 5'],
      set: val => Math.round(val * 10) / 10,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    highlights: [String],
    localTips: [String],
    packingList: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tripSchema.virtual('averageRating').get(function () {
  return this.rating; // For now. In a real app we'd compute this from reviews dynamically or update on review creation
});

// Indexes for performance optimization
// Text search index for destination, title, and description
tripSchema.index({ destination: 'text', title: 'text', description: 'text' });

// Compound index for the most common list query (filter + sort + paginate)
tripSchema.index({ isPublished: 1, category: 1, budget: 1, rating: -1 });

// Single field indexes for common sorts and filters
tripSchema.index({ createdAt: -1 }); // For "newest first" sort
tripSchema.index({ rating: -1 }); // For top-rated queries
tripSchema.index({ createdBy: 1 }); // For admin "trips by user" queries

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
