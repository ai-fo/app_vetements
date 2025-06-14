import { apiClient } from '../../shared/api/client';

export const outfitAnalysisAPI = {
  // Analyser une image de tenue
  analyzeImage: async (imageUri, userId) => {
    // TODO: Activer quand le backend est prêt
    // const formData = new FormData();
    // formData.append('image', {
    //   uri: imageUri,
    //   type: 'image/jpeg',
    //   name: 'outfit.jpg',
    // });
    // formData.append('userId', userId);
    // return apiClient.uploadFile('/outfit-analysis/analyze', { uri: imageUri }, { userId });
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      data: {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        imageUrl: imageUri,
        processingStatus: 'completed',
        analysis: {
          style: 'Casual chic',
          category: 'Tenue décontractée',
          occasion: ['quotidien', 'sortie décontractée'],
          season: ['printemps', 'été'],
          colors: {
            primary: ['noir', 'blanc'],
            secondary: ['gris'],
            accents: []
          },
          pieces: [
            { type: 'haut', description: 'T-shirt blanc basique' },
            { type: 'bas', description: 'Jean noir slim' },
            { type: 'chaussures', description: 'Baskets blanches' }
          ],
          recommendations: [
            'Ajouter un accessoire coloré pour dynamiser la tenue',
            'Une veste en jean serait parfaite pour compléter ce look'
          ],
          rating: 8.5
        }
      },
      error: null,
    };
  },

  // Récupérer toutes les analyses d'un utilisateur
  getUserAnalyses: async (userId) => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.get(`/outfit-analysis/user/${userId}`);
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: [
        {
          id: '1',
          userId,
          imageUrl: 'https://via.placeholder.com/400x600',
          processingStatus: 'completed',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          userId,
          imageUrl: 'https://via.placeholder.com/400x600',
          processingStatus: 'completed',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        }
      ],
      error: null,
    };
  },

  // Récupérer une analyse spécifique
  getAnalysis: async (analysisId) => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.get(`/outfit-analysis/${analysisId}`);
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {
        id: analysisId,
        imageUrl: 'https://via.placeholder.com/400x600',
        processingStatus: 'completed',
        analysis: {
          style: 'Élégant moderne',
          category: 'Tenue de soirée',
          occasion: ['soirée', 'événement'],
          season: ['automne', 'hiver'],
          colors: {
            primary: ['noir'],
            secondary: ['or'],
            accents: ['rouge']
          },
          pieces: [
            { type: 'robe', description: 'Robe noire élégante' },
            { type: 'accessoires', description: 'Bijoux dorés' },
            { type: 'chaussures', description: 'Escarpins noirs' }
          ],
          recommendations: [
            'Un châle ou une étole ajouterait de l\'élégance',
            'Un sac clutch doré complèterait parfaitement'
          ],
          rating: 9.2
        },
        createdAt: new Date().toISOString(),
      },
      error: null,
    };
  },

  // Supprimer une analyse
  deleteAnalysis: async (analysisId) => {
    // TODO: Activer quand le backend est prêt
    // return apiClient.delete(`/outfit-analysis/${analysisId}`);
    
    // Mock temporaire
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: { message: 'Analyse supprimée avec succès' },
      error: null,
    };
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