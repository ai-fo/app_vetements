import { apiClient } from '../../shared/api/client';

export const authAPI = {
  // Login avec email et mot de passe
  login: async (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },

  // Inscription
  register: async (email, password, name) => {
    return apiClient.post('/auth/register', { email, password, name });
  },

  // Récupérer le profil utilisateur
  getProfile: async () => {
    return apiClient.get('/auth/profile');
  },

  // Déconnexion
  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  // Rafraîchir le token
  refreshToken: async (refreshToken) => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },
};