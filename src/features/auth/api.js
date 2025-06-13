import { apiClient } from '../../shared/api/client';

export const authAPI = {
  // Login with email and password
  login: async (email, password) => {
    return apiClient.post('/api/auth/login', { email, password });
  },

  // Register new user
  register: async (email, password, fullName) => {
    return apiClient.post('/api/auth/register', {
      email,
      password,
      full_name: fullName,
    });
  },

  // Logout
  logout: async () => {
    return apiClient.post('/api/auth/logout');
  },

  // Get current user
  getCurrentUser: async () => {
    return apiClient.get('/api/auth/me');
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    return apiClient.post('/api/auth/refresh', { refresh_token: refreshToken });
  },
};