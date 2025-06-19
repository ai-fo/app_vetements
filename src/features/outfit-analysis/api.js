import { apiClient } from '../../shared/api/client';
import { outfitAnalysisSupabaseAPI } from './api/supabaseAnalysis';

export const outfitAnalysisAPI = {
  // Analyser une image de tenue
  analyzeImage: async (imageUri, userId, itemType = 'outfit') => {
    // Utiliser Supabase pour sauvegarder directement
    return outfitAnalysisSupabaseAPI.analyzeImage(imageUri, userId, itemType);
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
    throw new Error('Le service n\'est pas disponible. Veuillez réessayer plus tard.');
  },

  // Obtenir des recommandations basées sur les analyses
  getRecommendations: async (userId) => {
    // TODO: Activer quand le backend est prêt
    throw new Error('Le service de recommandations n\'est pas disponible. Veuillez réessayer plus tard.');
  },
};