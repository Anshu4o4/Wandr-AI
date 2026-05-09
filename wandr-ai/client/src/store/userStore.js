import { create } from 'zustand';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

export const useUserStore = create((set, get) => ({
  savedTrips: [],
  savedItineraries: [],
  isLoading: false,
  error: null,

  fetchSavedTrips: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get('/users/saved-trips');
      set({ savedTrips: res.data.data.trips, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch saved trips', isLoading: false });
    }
  },

  fetchSavedItineraries: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get('/users/my-itineraries');
      set({ savedItineraries: res.data.data.itineraries, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch saved itineraries', isLoading: false });
    }
  },

  toggleSaveTrip: async (tripId, tripData = null) => {
    try {
      const res = await axios.post('/users/toggle-save-trip', { tripId });
      const { isSaved } = res.data.data;
      const currentSaved = get().savedTrips;
      if (isSaved) {
        if (tripData && !currentSaved.some(t => (t._id || t) === tripId)) {
          set({ savedTrips: [tripData, ...currentSaved] });
        }
        toast.success('Added to wishlist');
      } else {
        set({ savedTrips: currentSaved.filter(t => t._id !== tripId) });
        toast.success('Removed from wishlist');
      }
      return isSaved;
    } catch (err) {
      toast.error('Failed to update wishlist');
      return null;
    }
  }
}));
