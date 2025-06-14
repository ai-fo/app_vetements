import { apiClient } from '../../shared/api/client';

export const authAPI = {
  // Login avec email et mot de passe
  login: async (email, password) => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.post('/auth/login', { email, password });
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'test@example.com' && password === 'password') {
      return {
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
          },
          token: 'mock-jwt-token-12345',
        },
        error: null,
      };
    }
    
    return {
      data: null,
      error: 'Email ou mot de passe incorrect',
    };
  },

  // Inscription
  register: async (email, password, name) => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.post('/auth/register', { email, password, name });
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      data: {
        user: {
          id: '2',
          email,
          name,
        },
        token: 'mock-jwt-token-67890',
      },
      error: null,
    };
  },

  // Récupérer le profil utilisateur
  getProfile: async () => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.get('/auth/profile');
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      },
      error: null,
    };
  },

  // Déconnexion
  logout: async () => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.post('/auth/logout');
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: { message: 'Déconnexion réussie' },
      error: null,
    };
  },

  // Rafraîchir le token
  refreshToken: async (refreshToken) => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.post('/auth/refresh', { refreshToken });
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {
        token: 'mock-new-jwt-token-11111',
        refreshToken: 'mock-new-refresh-token-22222',
      },
      error: null,
    };
  },
};