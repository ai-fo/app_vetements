import { apiClient } from '../../shared/api/client';
import { outfitAnalysisSupabaseAPI } from './api/supabaseAnalysis';

export const outfitAnalysisAPI = {
  // Analyser une image de tenue
  analyzeImage: async (imageUri, userId) => {
    // Utiliser Supabase pour sauvegarder directement
    return outfitAnalysisSupabaseAPI.analyzeImage(imageUri, userId);
  },

  // Récupérer toutes les analyses d'un utilisateur
  getUserAnalyses: async (userId) => {
    return outfitAnalysisSupabaseAPI.getUserAnalyses(userId);
  },

  // Récupérer une analyse spécifique
  getAnalysis: async (analysisId) => {
    return outfitAnalysisSupabaseAPI.getAnalysis(analysisId);
  },

  // Supprimer une analyse
  deleteAnalysis: async (analysisId) => {
    return outfitAnalysisSupabaseAPI.deleteAnalysis(analysisId);
  },

  // Ajouter un vêtement à la garde-robe depuis une analyse
  addToWardrobe: async (analysisId, itemData) => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.post(`/outfit-analysis/${analysisId}/add-to-wardrobe`, itemData);
    
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

  // Obtenir des recommandations basées sur les analyses
  getRecommendations: async (userId) => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.get(`/outfit-analysis/recommendations/${userId}`);
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      data: {
        dailyLook: {
          style: 'Casual moderne',
          pieces: ['Jean bleu', 'T-shirt blanc', 'Blazer beige'],
          occasion: 'Journée de travail décontractée',
          weather: 'Ensoleillé, 22°C'
        },
        trendingSuggestions: [
          'Les tons neutres sont parfaits pour cette saison',
          'Essayez d\'ajouter une touche de couleur avec des accessoires'
        ],
        missingPieces: [
          'Une écharpe légère',
          'Des baskets tendance'
        ]
      },
      error: null,
    };
  },
};