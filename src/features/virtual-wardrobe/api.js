import { apiClient } from '../../shared/api/client';
import { wardrobeSupabaseAPI } from './api/supabaseWardrobe';

// Utiliser l'API Supabase directement
export const wardrobeAPI = wardrobeSupabaseAPI;

// Version avec mocks (conservée pour référence)
export const wardrobeAPIMock = {
  // Récupérer tous les items de la garde-robe
  getItems: async (userId, filters = {}) => {
    // TODO: Activer quand le backend est prêt
    // const queryParams = new URLSearchParams(filters).toString();
    // return apiClient.get(`/wardrobe/user/${userId}${queryParams ? `?${queryParams}` : ''}`);
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: [
        {
          id: '1',
          userId,
          itemType: 'outfit',
          category: 'full_outfit',
          imageUrl: 'https://via.placeholder.com/400x600',
          colors: ['noir', 'blanc'],
          materials: ['cotton', 'denim'],
          seasons: ['fall', 'winter'],
          brand: 'Zara',
          name: 'Tenue décontractée',
          createdAt: new Date().toISOString(),
          tags: ['casual', 'work'],
          isFavorite: true
        },
        {
          id: '2',
          userId,
          itemType: 'single_piece',
          category: 'top',
          imageUrl: 'https://via.placeholder.com/400x600',
          colors: ['bleu'],
          materials: ['cotton'],
          seasons: ['spring', 'summer'],
          brand: 'H&M',
          name: 'T-shirt basique',
          createdAt: new Date().toISOString(),
          tags: ['basic', 'casual'],
          isFavorite: false
        }
      ],
      error: null,
    };
  },

  // Créer un nouvel item
  createItem: async (itemData) => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.post('/wardrobe/items', itemData);
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      data: {
        id: Math.random().toString(36).substr(2, 9),
        ...itemData,
        createdAt: new Date().toISOString(),
      },
      error: null,
    };
  },

  // Mettre à jour un item
  updateItem: async (itemId, updates) => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.put(`/wardrobe/items/${itemId}`, updates);
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {
        id: itemId,
        ...updates,
        updatedAt: new Date().toISOString(),
      },
      error: null,
    };
  },

  // Supprimer un item
  deleteItem: async (itemId) => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.delete(`/wardrobe/items/${itemId}`);
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: { message: 'Item supprimé avec succès' },
      error: null,
    };
  },

  // Obtenir les suggestions de tenues
  getOutfitSuggestions: async (userId, occasion = null, weather = null) => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.get('/wardrobe/suggestions', { userId, occasion, weather });
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      data: {
        suggestions: [
          {
            id: '1',
            name: 'Look professionnel',
            items: ['Chemise blanche', 'Pantalon noir', 'Blazer gris'],
            occasion: 'travail',
            confidence: 0.92
          },
          {
            id: '2',
            name: 'Tenue casual chic',
            items: ['T-shirt rayé', 'Jean slim', 'Veste en cuir'],
            occasion: 'sortie',
            confidence: 0.87
          }
        ]
      },
      error: null,
    };
  },

  // Rechercher des items similaires
  findSimilarItems: async (itemId) => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.get(`/wardrobe/items/${itemId}/similar`);
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: [
        {
          id: '3',
          name: 'T-shirt similaire',
          imageUrl: 'https://via.placeholder.com/400x600',
          similarity: 0.85,
          brand: 'Uniqlo'
        },
        {
          id: '4',
          name: 'Alternative colorée',
          imageUrl: 'https://via.placeholder.com/400x600',
          similarity: 0.78,
          brand: 'Gap'
        }
      ],
      error: null,
    };
  },

  // Générer des statistiques de garde-robe
  getWardrobeStats: async (userId) => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.get(`/wardrobe/stats/${userId}`);
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      data: {
        totalItems: 45,
        byCategory: {
          'top': 15,
          'bottom': 10,
          'dress': 5,
          'outerwear': 8,
          'shoes': 7
        },
        favoriteColors: ['noir', 'blanc', 'bleu'],
        favoriteBrands: ['Zara', 'H&M', 'Uniqlo'],
        seasonalDistribution: {
          'spring': 12,
          'summer': 15,
          'fall': 10,
          'winter': 8
        }
      },
      error: null,
    };
  },
};