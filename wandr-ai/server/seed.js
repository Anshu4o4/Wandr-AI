import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Trip from './models/Trip.js';
import { calculatePriceRange } from './data/costOfLivingIndex.js';

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@wandr.com',
    password: 'password123',
    role: 'admin',
    isVerified: true
  },
  {
    name: 'Test User',
    email: 'user@wandr.com',
    password: 'password123',
    role: 'user',
    isVerified: true
  }
];

const trips = [
  {
    title: 'Bali Beach Escape',
    description: 'A relaxed week in Bali with beach clubs, temple visits, sunset dinners, and time to slow down in Ubud and Seminyak.',
    destination: 'Bali, Indonesia',
    country: 'Indonesia',
    continent: 'Asia',
    duration: 7,
    budget: 'mid-range',
    category: ['beach', 'cultural'],
    tags: ['Adventure', 'Family'],
    price: 1450,
    priceRange: '$1,200 - $1,800',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    isPublished: true,
    rating: 4.8,
    ratingsCount: 128,
    highlights: [
      'Sunrise at Tegallalang Rice Terraces',
      'Beach club afternoon in Seminyak',
      'Temple visit and coastal sunset in Uluwatu',
    ],
    localTips: [
      'Book key beach clubs and sunset dinners ahead of time.',
      'Use a private driver for easier island transfers.',
      'Carry cash for small local cafés and temples.',
    ],
    packingList: ['Light clothing', 'Sandals', 'Sunscreen', 'Swimwear', 'Reusable water bottle'],
  },
  {
    title: 'Manali Valley Retreat',
    description: 'Fresh mountain air, riverside cafés, and scenic drives through the Himalayas make this a great short escape with a balanced pace.',
    destination: 'Manali, India',
    country: 'India',
    continent: 'Asia',
    duration: 5,
    budget: 'budget',
    category: ['mountain', 'adventure'],
    tags: ['Adventure', 'Budget'],
    price: 780,
    priceRange: '$650 - $950',
    coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop',
    isPublished: true,
    rating: 4.6,
    ratingsCount: 84,
    highlights: [
      'Solang Valley cable car views',
      'Old Manali café crawl',
      'Day trip to Rohtang Pass or Atal Tunnel',
    ],
    localTips: [
      'Pack layers; mountain evenings cool down quickly.',
      'Check road conditions before planning long drives.',
      'Choose accommodations close to Mall Road or Old Manali.',
    ],
    packingList: ['Warm jacket', 'Comfortable boots', 'Power bank', 'Sunglasses', 'Travel meds'],
  },
  {
    title: 'Dubai Skyline & Desert',
    description: 'A polished city break with skyline dining, designer shopping, desert experiences, and effortless luxury from start to finish.',
    destination: 'Dubai, UAE',
    country: 'United Arab Emirates',
    continent: 'Middle East',
    duration: 4,
    budget: 'luxury',
    category: ['city', 'adventure'],
    tags: ['Luxury'],
    price: 2650,
    priceRange: '$2,300 - $3,200',
    coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop',
    isPublished: true,
    rating: 4.7,
    ratingsCount: 111,
    highlights: [
      'Burj Khalifa sunset visit',
      'Private desert safari and dinner',
      'Marina waterfront dining',
    ],
    localTips: [
      'Dress modestly in traditional areas and mosques.',
      'Book skyline restaurants and desert tours early.',
      'Use metro or ride-hailing to avoid parking hassle.',
    ],
    packingList: ['Light layers', 'Evening wear', 'Power adapter', 'Sunglasses', 'Comfortable shoes'],
  },
  {
    title: 'Paris Grand Getaway',
    description: 'A refined Paris stay with iconic landmarks, neighborhood cafés, museum time, and slow evenings along the Seine.',
    destination: 'Paris, France',
    country: 'France',
    continent: 'Europe',
    duration: 6,
    budget: 'mid-range',
    category: ['city', 'cultural'],
    tags: ['Family', 'Luxury'],
    price: 1980,
    priceRange: '$1,700 - $2,500',
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop',
    isPublished: true,
    rating: 4.7,
    ratingsCount: 156,
    highlights: [
      'Eiffel Tower at golden hour',
      'Louvre and Left Bank exploration',
      'Seine cruise with dinner',
    ],
    localTips: [
      'Reserve popular museums and dinner cruises ahead of time.',
      'Use the metro for quick cross-city movement.',
      'Plan one slow café afternoon per day.',
    ],
    packingList: ['Walking shoes', 'Light jacket', 'Portable charger', 'Crossbody bag', 'Chic daywear'],
  },
  {
    title: 'Tokyo City Lights',
    description: 'A fast, stylish city trip blending sushi counters, neon districts, design hotels, and quiet cultural corners in one smooth itinerary.',
    destination: 'Tokyo, Japan',
    country: 'Japan',
    continent: 'Asia',
    duration: 6,
    budget: 'mid-range',
    category: ['city', 'food'],
    tags: ['Adventure', 'Family'],
    price: 2200,
    priceRange: '$1,900 - $2,700',
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
    isPublished: true,
    rating: 4.8,
    ratingsCount: 142,
    highlights: [
      'Shibuya and Shinjuku night walk',
      'Tsukiji market breakfast',
      'Meiji Shrine and Asakusa temple area',
    ],
    localTips: [
      'Carry a transit card for easier metro travel.',
      'Many restaurants prefer cashless payment or IC cards.',
      'Book one traditional ryokan or rooftop stay for contrast.',
    ],
    packingList: ['Comfortable sneakers', 'Transit card', 'Power adapter', 'Camera', 'Compact umbrella'],
  },
  {
    title: 'Santorini Sunset Escape',
    description: 'Whitewashed cliffside stays, sailing trips, and sunset dinners give this Santorini escape an unmistakably premium feel.',
    destination: 'Santorini, Greece',
    country: 'Greece',
    continent: 'Europe',
    duration: 5,
    budget: 'luxury',
    category: ['beach', 'cultural'],
    tags: ['Luxury', 'Family'],
    price: 3080,
    priceRange: '$2,700 - $3,600',
    coverImage: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop',
    isPublished: true,
    rating: 4.8,
    ratingsCount: 97,
    highlights: [
      'Oia sunset viewpoint',
      'Volcanic caldera boat tour',
      'Wine tasting and cliffside dinner',
    ],
    localTips: [
      'Book sunset tables and boat trips well in advance.',
      'Stay in Oia or Imerovigli for the best views.',
      'Bring walking shoes for the cliffside paths.',
    ],
    packingList: ['Resort wear', 'Walking shoes', 'Sunhat', 'Swimwear', 'Camera'],
  },
];

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wandr');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    await User.deleteMany();
    await Trip.deleteMany();

    console.log('Data Destroyed');

    const createdUsers = await User.create(users);
    const adminUserId = createdUsers[0]._id;

    const sampleTrips = trips.map(trip => {
      const tripData = { ...trip, createdBy: adminUserId };
      if (trip.country && trip.duration && trip.budget) {
        tripData.calculatedPrices = calculatePriceRange(trip.country, trip.duration, trip.budget);
      }
      return tripData;
    });

    await Trip.create(sampleTrips);

    console.log('Data Imported');
    process.exit();
  } catch (error) {
    console.error(`Error with seed: ${error}`);
    process.exit(1);
  }
};

seedDB();
