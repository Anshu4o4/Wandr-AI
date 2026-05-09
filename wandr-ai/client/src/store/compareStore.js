import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

const MAX_COMPARE_TRIPS = 3;

const pickTripFields = (trip) => ({
  _id: trip._id,
  title: trip.title,
  destination: trip.destination,
  duration: trip.duration,
  price: trip.price,
  priceRange: trip.priceRange,
  rating: trip.rating,
  budget: trip.budget,
  category: trip.category || [],
  tags: trip.tags || [],
  highlights: trip.highlights || [],
  coverImage: trip.coverImage,
  description: trip.description,
});

export const useCompareStore = create(
  persist(
    (set, get) => ({
      comparedTrips: [],

      toggleCompareTrip: (trip) => {
        const currentTrips = get().comparedTrips;
        const exists = currentTrips.some((item) => item._id === trip._id);

        if (exists) {
          set({ comparedTrips: currentTrips.filter((item) => item._id !== trip._id) });
          toast.success('Removed from comparison');
          return true;
        }

        if (currentTrips.length >= MAX_COMPARE_TRIPS) {
          toast.error('You can compare up to 3 trips');
          return false;
        }

        set({ comparedTrips: [...currentTrips, pickTripFields(trip)] });
        toast.success('Added to comparison');
        return true;
      },

      removeCompareTrip: (tripId) => {
        set({ comparedTrips: get().comparedTrips.filter((trip) => trip._id !== tripId) });
      },

      clearCompareTrips: () => set({ comparedTrips: [] }),
    }),
    {
      name: 'wandr-compare-trips',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
