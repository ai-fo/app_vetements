import { supabase } from '../../../shared/api/supabase';
import { storageService } from '../../../shared/api/storage';

export const outfitAnalysisSupabaseAPI = {
  // Analyser et sauvegarder une image de tenue
  analyzeImage: async (imageUri, userId) => {
    try {
      // 1. Upload l'image vers Supabase Storage
      const fileName = `outfit_${userId}_${Date.now()}.jpg`;
      const { publicUrl, path } = await storageService.uploadPhoto(imageUri, fileName);
      
      // 2. Créer une entrée dans outfit_analyses
      const { data: analysis, error: analysisError } = await supabase
        .from('outfit_analyses')
        .insert({
          user_id: userId,
          image_url: publicUrl,
          processing_status: 'completed',
          // Analyse IA simulée pour le moment
          style: 'Casual chic',
          category: 'quotidien',
          formality: 5,
          versatility: 8,
          colors: {
            primary: ['noir', 'blanc'],
            secondary: ['gris'],
            accent: []
          },
          seasons: ['spring', 'summer'],
          occasions: ['quotidien', 'sortie décontractée'],
          items: [
            { type: 'haut', description: 'T-shirt blanc basique' },
            { type: 'bas', description: 'Jean noir slim' },
            { type: 'chaussures', description: 'Baskets blanches' }
          ],
          matching_suggestions: [
            'Ajouter un accessoire coloré pour dynamiser la tenue',
            'Une veste en jean serait parfaite pour compléter ce look'
          ],
          analyzed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (analysisError) throw analysisError;
      
      // 3. Créer aussi une entrée dans clothing_items pour la garde-robe
      const { data: clothingItem, error: clothingError } = await supabase
        .from('clothing_items')
        .insert({
          user_id: userId,
          image_url: publicUrl,
          type: 'outerwear', // Tenue complète
          name: `Tenue ${analysis.style || 'analysée'}`,
          tags: analysis.occasions || []
        })
        .select()
        .single();

      if (clothingError) {
        console.error('Error creating clothing item:', clothingError);
      }

      return {
        data: {
          ...analysis,
          clothingItemId: clothingItem?.id
        },
        error: null
      };
    } catch (error) {
      console.error('Error analyzing outfit:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  // Récupérer toutes les analyses d'un utilisateur
  getUserAnalyses: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('outfit_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        error: null
      };
    } catch (error) {
      console.error('Error fetching user analyses:', error);
      return {
        data: [],
        error: error.message
      };
    }
  },

  // Récupérer une analyse spécifique
  getAnalysis: async (analysisId) => {
    try {
      const { data, error } = await supabase
        .from('outfit_analyses')
        .select('*')
        .eq('id', analysisId)
        .single();

      if (error) throw error;

      return {
        data,
        error: null
      };
    } catch (error) {
      console.error('Error fetching analysis:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  // Supprimer une analyse
  deleteAnalysis: async (analysisId) => {
    try {
      // Récupérer l'analyse pour obtenir l'URL de l'image
      const { data: analysis } = await supabase
        .from('outfit_analyses')
        .select('image_url')
        .eq('id', analysisId)
        .single();

      // Supprimer l'analyse
      const { error } = await supabase
        .from('outfit_analyses')
        .delete()
        .eq('id', analysisId);

      if (error) throw error;

      // Supprimer l'image du storage si elle existe
      if (analysis?.image_url) {
        try {
          const path = analysis.image_url.split('/').pop();
          await storageService.deletePhoto(`wardrobe/${path}`);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      return {
        data: { message: 'Analyse supprimée avec succès' },
        error: null
      };
    } catch (error) {
      console.error('Error deleting analysis:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }
};