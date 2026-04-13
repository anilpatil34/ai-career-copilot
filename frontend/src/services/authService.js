/**
 * Authentication API service.
 */
import api from './api';

const authService = {
  register: async (data) => {
    const response = await api.post('/api/auth/register/', data);
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post('/api/auth/login/', { username, password });
    return response.data;
  },

  logout: async (refreshToken) => {
    try {
      await api.post('/api/auth/logout/', { refresh: refreshToken });
    } catch {
      // Silently fail on logout
    }
  },

  getProfile: async () => {
    const response = await api.get('/api/auth/profile/');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/api/auth/profile/', data);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/api/auth/dashboard/');
    return response.data;
  },
};

export default authService;
