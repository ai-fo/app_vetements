import { supabase } from '../../../shared/api/supabase';
import { storageService } from '../../../shared/api/storage';
import { openaiService } from '../services/openaiService';
import apiClient from '../../../shared/api/client';

export const clothingAnalysisAPI = {
  // Analyser une image avec la nouvelle structure
  analyzeClothing: async (imageUri, userId, itemType = 'outfit') => {
    try {
      // 1. Upload l'image vers Supabase Storage
      const fileName = `outfit_${userId}_${Date.now()}.jpg`;
      const { publicUrl } = await storageService.uploadPhoto(imageUri, fileName);
      
      // 2. Analyser l'image avec la nouvelle API
      const { data: analysisResult } = await openaiService.analyzeOutfit(imageUri, itemType);
      
      if (!analysisResult) {
        throw new Error('Échec de l\'analyse de l\'image');
      }
      
      // 3. Adapter la réponse selon le type
      if (analysisResult.capture_type === 'single_piece') {
        return {
          data: {
            ...analysisResult,
            image_url: publicUrl,
            user_id: userId
          },
          error: null
        };
      } else if (analysisResult.capture_type === 'complete_look') {
        return {
          data: {
            ...analysisResult,
            image_url: publicUrl,
            user_id: userId
          },
          error: null
        };
      }
      
      throw new Error('Format de réponse non reconnu');
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  // Sauvegarder l'analyse dans la nouvelle structure
  saveAnalysis: async (userId, analysisResult, imageUrl) => {
    try {
      const response = await apiClient.post('/save-clothing', {
        user_id: userId,
        analysis_result: analysisResult,
        image_urls: [imageUrl]
      });
      
      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  // Récupérer les pièces de vêtements d'un utilisateur
  getUserPieces: async (userId, pieceType = null) => {
    try {
      const url = `/wardrobe/${userId}/pieces${pieceType ? `?piece_type=${pieceType}` : ''}`;
      const response = await apiClient.get(url);
      
      return {
        data: response.data.pieces || [],
        error: null
      };
    } catch (error) {
      return {
        data: [],
        error: error.message
      };
    }
  },

  // Récupérer les tenues complètes d'un utilisateur
  getUserLooks: async (userId) => {
    try {
      const response = await apiClient.get(`/wardrobe/${userId}/looks`);
      
      return {
        data: response.data.looks || [],
        error: null
      };
    } catch (error) {
      return {
        data: [],
        error: error.message
      };
    }
  },

  // Transformer les données pour l'affichage dans l'ancienne interface
  transformForDisplay: (analysisResult) => {
    if (analysisResult.capture_type === 'single_piece') {
      const piece = analysisResult.pieces[0];
      return {
        type: 'single_piece',
        style: piece.style_tags[0] || 'casual',
        category: 'piece_unique',
        colors: {
          primary: piece.attributes.colors.primary,
          secondary: piece.attributes.colors.secondary || []
        },
        material: piece.attributes.material,
        pattern: piece.attributes.pattern,
        occasion: piece.occasion_tags[0] || 'quotidien',
        season: piece.seasonality,
        items: [{
          type: piece.piece_type,
          name: `${piece.piece_type} ${piece.attributes.colors.primary[0]}`,
          color: piece.attributes.colors.primary[0],
          material: piece.attributes.material,
          style: piece.style_tags[0],
          fit: piece.attributes.fit
        }]
      };
    } else {
      // Tenue complète
      const lookMeta = analysisResult.look_meta;
      return {
        type: 'outfit',
        style: lookMeta.dominant_style[0] || 'casual',
        category: lookMeta.occasion_tags[0] || 'quotidien',
        colors: {
          primary: lookMeta.color_palette_global.primary,
          secondary: lookMeta.color_palette_global.accent || []
        },
        pattern: lookMeta.pattern_mix[0] || 'uni',
        occasion: lookMeta.occasion_tags[0] || 'quotidien',
        season: lookMeta.seasonality,
        silhouette: lookMeta.silhouette,
        layering: lookMeta.layering_level,
        items: analysisResult.pieces.map(piece => ({
          type: piece.piece_type,
          name: `${piece.piece_type} ${piece.attributes.colors.primary[0]}`,
          color: piece.attributes.colors.primary[0],
          material: piece.attributes.material,
          style: piece.style_tags[0],
          fit: piece.attributes.fit
        }))
      };
    }
  }
};