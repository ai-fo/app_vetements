import { apiClient } from '../../shared/api/client';

export const outfitAnalysisAPI = {
  // Analyser une image de tenue
  analyzeImage: async (analysisId, imageUrl) => {
    return apiClient.post('/api/outfit-analysis/analyze', {
      analysis_id: analysisId,
      image_url: imageUrl
    });
  },

  // Récupérer l'état d'une analyse
  getAnalysisStatus: async (analysisId) => {
    return apiClient.get(`/api/outfit-analysis/${analysisId}/status`);
  },

  // Récupérer les détails complets d'une analyse
  getAnalysisDetails: async (analysisId) => {
    return apiClient.get(`/api/outfit-analysis/${analysisId}`);
  },

  // Récupérer toutes les analyses d'un utilisateur
  getUserAnalyses: async (userId) => {
    return apiClient.get('/api/outfit-analysis/user', { user_id: userId });
  },

  // Mettre à jour une analyse (corrections manuelles)
  updateAnalysis: async (analysisId, updates) => {
    return apiClient.put(`/api/outfit-analysis/${analysisId}`, updates);
  },

  // Supprimer une analyse
  deleteAnalysis: async (analysisId) => {
    return apiClient.delete(`/api/outfit-analysis/${analysisId}`);
  }
};