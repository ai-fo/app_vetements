import { supabase } from '../../../shared/api/supabase';
import { storageService } from '../../../shared/api/storage';
import { openaiService } from '../../../services/openaiService';

export const outfitAnalysisSupabaseAPI = {
  // Analyser et sauvegarder une image de tenue
  analyzeImage: async (imageUri, userId, itemType = 'outfit') => {
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
          // Ne pas simuler - retourner une erreur
          throw new Error('Le service d\'analyse n\'est pas disponible. Veuillez réessayer plus tard.');
        } else {
          console.log('OpenAI response:', JSON.stringify(openaiData, null, 2));
          
          // Vérifier si OpenAI retourne un format sans pieces ou des pieces vides
          if (openaiData && (!openaiData.pieces || openaiData.pieces.length === 0)) {
            console.log('OpenAI returned no pieces, checking itemType:', itemType);
            
            // Si c'est explicitement une tenue complète (itemType === 'outfit')
            if (itemType === 'outfit') {
              console.log('Item type is outfit, keeping as outfit even without pieces');
              // Garder comme tenue complète même sans pièces détaillées
              aiAnalysis = {
                ...openaiData,
                type: 'outfit',
                pieces: [] // Garder vide, l'interface gèrera l'affichage
              };
            } else {
              // Si c'est une pièce unique, créer une pièce basée sur les données
              console.log('Creating single piece from analysis data');
              const detectedPieces = [];
              
              // Créer une pièce basée sur le type détecté ou le style
              const pieceType = openaiData.type === 'single_piece' ? 'top' : openaiData.type || 'top';
              
              detectedPieces.push({
                type: pieceType,
                name: openaiData.style ? `${openaiData.style} ${pieceType}` : 'Article',
                color: openaiData.colors?.primary?.[0] || 'non défini',
                material: openaiData.material || 'non spécifié',
                brand_estimation: null,
                price_range: openaiData.brand_style === 'luxe' ? '200-500€' : 
                            openaiData.brand_style === 'casual' ? '50-150€' : '100-300€',
                style: openaiData.style || 'non défini',
                fit: 'regular'
              });
              
              aiAnalysis = {
                ...openaiData,
                pieces: detectedPieces
              };
            }
          } else {
            // OpenAI a retourné des pièces
            aiAnalysis = openaiData;
          }
        }
      } catch (error) {
        console.error('Error calling OpenAI:', error);
        // Ne pas simuler - propager l'erreur
        throw new Error('Le service d\'analyse n\'est pas disponible. Veuillez réessayer plus tard.');
      }
      
      // 3. Créer une entrée dans outfit_analyses avec les données OpenAI
      // Déterminer si c'est une pièce unique ou une tenue complète basé sur itemType
      const isSinglePiece = itemType !== 'outfit';
      console.log('Creating analysis entry, isSinglePiece:', isSinglePiece, 'itemType:', itemType);
      
      // Déterminer la catégorie appropriée
      let analysisCategory;
      if (isSinglePiece) {
        analysisCategory = 'piece_unique';
      } else {
        // Pour les tenues complètes, utiliser la catégorie retournée par l'IA ou 'quotidien' par défaut
        analysisCategory = aiAnalysis.category || 'quotidien';
        // S'assurer que la catégorie est bien une catégorie de tenue
        if (analysisCategory === 'piece_unique') {
          analysisCategory = 'quotidien';
        }
      }
      
      const { data: analysis, error: analysisError } = await supabase
        .from('outfit_analyses')
        .insert({
          user_id: userId,
          image_url: publicUrl,
          processing_status: 'completed',
          style: aiAnalysis.style,
          category: analysisCategory,
          formality: Math.round(aiAnalysis.confidence * 10) || 5,
          versatility: 8,
          colors: aiAnalysis.colors,
          seasons: Array.isArray(aiAnalysis.season) ? aiAnalysis.season : [aiAnalysis.season],
          occasions: [aiAnalysis.occasion],
          materials: aiAnalysis.material ? [aiAnalysis.material] : [],
          care_instructions: aiAnalysis.care_instructions ? [aiAnalysis.care_instructions] : [],
          items: aiAnalysis.pieces ? aiAnalysis.pieces.map(piece => ({
            type: piece.type,
            name: piece.name,
            description: `${piece.name} - ${piece.color}`,
            color: piece.color,
            material: piece.material,
            price_range: piece.price_range,
            style: piece.style,
            fit: piece.fit
          })) : [{
            description: `${aiAnalysis.style} - ${analysisCategory}`
          }],
          matching_suggestions: aiAnalysis.recommendations || [],
          analysis_confidence: (aiAnalysis.confidence || 0.8) * 100,
          analyzed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (analysisError) throw analysisError;
      
      // 4. Créer une entrée pour chaque pièce détectée dans outfit_pieces
      console.log('Checking if pieces exist:', aiAnalysis.pieces);
      if (aiAnalysis.pieces && aiAnalysis.pieces.length > 0) {
        try {
          console.log(`Preparing to insert ${aiAnalysis.pieces.length} pieces`);
          const piecesData = aiAnalysis.pieces.map((piece, index) => ({
            outfit_analysis_id: analysis.id,
            user_id: userId,
            type: piece.type,
            name: piece.name,
            description: `${piece.name} - ${piece.color}`,
            color: piece.color,
            material: piece.material || 'non spécifié',
            price_range: piece.price_range,
            style: piece.style,
            fit: piece.fit,
            layer_order: piece.type === 'top' ? index + 1 : 1, // Gérer l'ordre des couches pour les hauts
            confidence: aiAnalysis.confidence || 0.85
          }));
          
          console.log('Pieces data to insert:', JSON.stringify(piecesData, null, 2));
          
          const { data: insertedPieces, error: piecesError } = await supabase
            .from('outfit_pieces')
            .insert(piecesData)
            .select();
            
          if (piecesError) {
            console.error('Error inserting outfit pieces:', piecesError);
            console.error('Error details:', JSON.stringify(piecesError, null, 2));
          } else {
            console.log(`Successfully inserted ${insertedPieces?.length || 0} pieces for outfit analysis ${analysis.id}`);
            console.log('Inserted pieces:', JSON.stringify(insertedPieces, null, 2));
          }
        } catch (error) {
          console.error('Error creating outfit pieces:', error);
          console.error('Error stack:', error.stack);
          // On ne fait pas échouer l'analyse si l'insertion des pièces échoue
        }
      } else {
        console.log('No pieces detected in analysis');
      }
      
      return {
        data: analysis,
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

  // Récupérer les pièces d'une analyse
  getOutfitPieces: async (analysisId) => {
    try {
      const { data, error } = await supabase
        .from('outfit_pieces')
        .select('*')
        .eq('outfit_analysis_id', analysisId)
        .order('layer_order', { ascending: true });

      if (error) throw error;

      return {
        data: data || [],
        error: null
      };
    } catch (error) {
      console.error('Error fetching outfit pieces:', error);
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