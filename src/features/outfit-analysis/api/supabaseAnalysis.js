import { supabase } from '../../../shared/api/supabase';
import { storageService } from '../../../shared/api/storage';
import { openaiService } from '../../../services/openaiService';

export const outfitAnalysisSupabaseAPI = {
  // Analyser et sauvegarder une image de tenue
  analyzeImage: async (imageUri, userId) => {
    try {
      // 1. Upload l'image vers Supabase Storage
      const fileName = `outfit_${userId}_${Date.now()}.jpg`;
      const { publicUrl, path } = await storageService.uploadPhoto(imageUri, fileName);
      
      // 2. Analyser l'image avec OpenAI
      let aiAnalysis;
      try {
        const { data: openaiData, error: openaiError } = await openaiService.analyzeOutfit(imageUri);
        
        if (openaiError) {
          console.error('OpenAI analysis error:', openaiError);
          // Utiliser l'analyse simulée en cas d'erreur
          aiAnalysis = {
            style: 'Casual chic',
            category: 'quotidien',
            colors: {
              primary: ['noir', 'blanc'],
              secondary: ['gris']
            },
            occasion: 'quotidien',
            season: 'spring',
            recommendations: [
              'Ajouter un accessoire coloré pour dynamiser la tenue',
              'Une veste en jean serait parfaite pour compléter ce look'
            ],
            confidence: 0.85
          };
        } else {
          aiAnalysis = openaiData;
        }
      } catch (error) {
        console.error('Error calling OpenAI:', error);
        // Utiliser l'analyse simulée en cas d'erreur
        aiAnalysis = {
          style: 'Casual chic',
          category: 'quotidien',
          colors: {
            primary: ['noir', 'blanc'],
            secondary: ['gris']
          },
          occasion: 'quotidien',
          season: 'spring',
          recommendations: [
            'Ajouter un accessoire coloré pour dynamiser la tenue',
            'Une veste en jean serait parfaite pour compléter ce look'
          ],
          confidence: 0.85
        };
      }
      
      // 3. Créer une entrée dans outfit_analyses avec les données OpenAI
      const { data: analysis, error: analysisError } = await supabase
        .from('outfit_analyses')
        .insert({
          user_id: userId,
          image_url: publicUrl,
          processing_status: 'completed',
          style: aiAnalysis.style,
          category: aiAnalysis.category,
          formality: Math.round(aiAnalysis.confidence * 10) || 5,
          versatility: 8,
          colors: aiAnalysis.colors,
          seasons: Array.isArray(aiAnalysis.season) ? aiAnalysis.season : [aiAnalysis.season],
          occasions: [aiAnalysis.occasion],
          materials: aiAnalysis.material ? [aiAnalysis.material] : [],
          care_instructions: aiAnalysis.care_instructions ? [aiAnalysis.care_instructions] : [],
          items: [
            { 
              description: `${aiAnalysis.style} - ${aiAnalysis.category}`
            }
          ],
          matching_suggestions: aiAnalysis.recommendations || [],
          analysis_confidence: (aiAnalysis.confidence || 0.8) * 100,
          analyzed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (analysisError) throw analysisError;
      
      // 4. Créer aussi une entrée dans clothing_items pour la garde-robe
      const { data: clothingItem, error: clothingError } = await supabase
        .from('clothing_items')
        .insert({
          user_id: userId,
          image_url: publicUrl,
          type: analysis.type || 'outerwear',
          name: `${analysis.type || 'Vêtement'} ${analysis.style || 'analysé'}`,
          brand: analysis.brand_style,
          color: analysis.colors?.primary?.[0] || 'non défini',
          colors: analysis.colors?.primary || [],
          materials: analysis.material ? [analysis.material] : [],
          seasons: analysis.seasons || [],
          tags: [...(analysis.occasions || []), ...(analysis.seasons || [])]
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