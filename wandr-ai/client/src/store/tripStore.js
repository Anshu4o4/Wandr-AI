import { create } from 'zustand';
import axios from '../api/axios';
import { FEATURED_TRIPS } from '../data/travelCatalog';

const CACHE_TTL = 5 * 60 * 1000;
const tripCache = new Map();

const sortObject = (value = {}) =>
  Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));

const getCacheKey = (scope, payload = {}) => `${scope}:${JSON.stringify(payload)}`;

const getCachedValue = (key) => {
  const entry = tripCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    tripCache.delete(key);
    return null;
  }
  return entry.value;
};

const setCachedValue = (key, value) => {
  tripCache.set(key, { timestamp: Date.now(), value });
  return value;
};

export const clearTripCache = (predicate = () => true) => {
  for (const key of tripCache.keys()) {
    if (predicate(key)) {
      tripCache.delete(key);
    }
  }
};

export const useTripStore = create((set, get) => ({
  trips: [],
  allTrips: [],
  featuredTrips: [],
  topTrips: [],
  currentTrip: null,
  generatedItinerary: null,
  isGenerating: false,
  isLoading: false,
  error: null,
  filters: {},
  pagination: { page: 1, totalPages: 1 },

  fetchTrips: async (filters = {}, page = 1) => {
    const normalizedFilters = sortObject(filters);
    const cacheKey = getCacheKey('trips', { filters: normalizedFilters, page, limit: 9 });
    const cached = getCachedValue(cacheKey);
    if (cached) {
      set({
        trips: cached.trips,
        pagination: cached.pagination,
        isLoading: false,
        error: null,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams({ ...normalizedFilters, page, limit: 9 }).toString();
      const res = await axios.get(`/trips?${queryParams}`);
      const payload = {
        trips: res.data.data.trips,
        pagination: {
          page: res.data.pagination.page,
          totalPages: res.data.pagination.totalPages,
        },
      };
      set({
        ...payload,
        isLoading: false,
      });
      setCachedValue(cacheKey, payload);
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch trips', isLoading: false });
    }
  },

  fetchAllTrips: async (filters = {}) => {
    const normalizedFilters = sortObject(filters);
    const cacheKey = getCacheKey('all-trips', { filters: normalizedFilters, limit: 100 });
    const cached = getCachedValue(cacheKey);
    if (cached) {
      set({ allTrips: cached, isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams({ ...normalizedFilters, limit: 100 }).toString();
      const res = await axios.get(`/trips?${queryParams}`);
      const trips = res.data.data.trips;
      set({
        allTrips: trips,
        isLoading: false,
      });
      setCachedValue(cacheKey, trips);
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch trips', isLoading: false });
    }
  },

  fetchFeaturedTrips: async () => {
    const cacheKey = 'featured-trips';
    const cached = getCachedValue(cacheKey);
    if (cached) {
      set({ featuredTrips: cached });
      return;
    }

    try {
      const res = await axios.get('/trips/featured');
      const trips = res.data.data.trips;
      set({ featuredTrips: trips });
      setCachedValue(cacheKey, trips);
    } catch (err) {
      console.error('Failed to fetch featured trips', err);
      // Fallback mock data for visual consistency if DB is down
      set({ featuredTrips: FEATURED_TRIPS.slice(0, 3) });
    }
  },

  fetchTopTrips: async () => {
    const cacheKey = 'top-rated-trips';
    const cached = getCachedValue(cacheKey);
    if (cached) {
      set({ topTrips: cached });
      return;
    }

    try {
      const res = await axios.get('/trips/top-rated');
      const trips = res.data.data.trips;
      set({ topTrips: trips });
      setCachedValue(cacheKey, trips);
    } catch (err) {
      console.error('Failed to fetch top trips', err);
    }
  },

  fetchTrip: async (id) => {
    const cacheKey = getCacheKey('trip', { id });
    const cached = getCachedValue(cacheKey);
    if (cached) {
      set({ currentTrip: cached, isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(`/trips/${id}`);
      const trip = res.data.data.trip;
      set({ currentTrip: trip, isLoading: false });
      setCachedValue(cacheKey, trip);
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch trip', isLoading: false });
    }
  },

  generateItinerary: async (params) => {
    set({ isGenerating: true, error: null, generatedItinerary: null });
    try {
      const res = await axios.post('/ai/generate-itinerary', params);
      set({ generatedItinerary: res.data.data.itinerary, isGenerating: false });
      return res.data.data.itinerary;
    } catch (err) {
      set({ error: err.response?.data?.message || 'AI generation failed', isGenerating: false });
      return null;
    }
  },

  saveItinerary: async () => {
    // For saving AI generated itinerary as a real trip
  },

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
    get().fetchTrips({ ...get().filters, ...newFilters }, 1);
  },

  clearGenerated: () => set({ generatedItinerary: null }),
  clearError: () => set({ error: null })
}));
