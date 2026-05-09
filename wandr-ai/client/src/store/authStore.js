import { create } from 'zustand';
import axios from '../api/axios';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  isCheckingAuth: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post('/auth/login', { email, password });
      set({ 
        user: res.data.data.user, 
        accessToken: res.data.data.accessToken, 
        isLoading: false 
      });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post('/auth/register', { name, email, password });
      set({ 
        user: res.data.data.user, 
        accessToken: res.data.data.accessToken, 
        isLoading: false 
      });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
      return false;
    }
  },

  loginWithGoogle: async (credential) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post('/auth/google', { credential });
      set({ 
        user: res.data.data.user, 
        accessToken: res.data.data.accessToken, 
        isLoading: false 
      });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Google authentication failed', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await axios.post('/auth/logout');
      set({ user: null, accessToken: null, isLoading: false, error: null });
    } catch (err) {
      set({ user: null, accessToken: null, isLoading: false, error: null }); // logout anyway client side
    }
  },

  refreshToken: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axios.post('/auth/refresh-token');
      set({ accessToken: res.data.data.accessToken });
      
      // Also fetch user data since app mounted
      const userRes = await axios.get('/auth/me');
       set({ user: userRes.data.data.user, isCheckingAuth: false });
       
       return true;
     } catch (err) {
       set({ user: null, accessToken: null, isCheckingAuth: false });
       return false;
       // We don't set error here because this runs silently on mount
     }
   },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.patch('/auth/update-me', data);
      set({ user: res.data.data.user, isLoading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Update failed', isLoading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
