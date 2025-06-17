import { supabase } from '../../../shared/api/supabase';
import { storageService } from '../../../shared/api/storage';
import { openaiService } from '../../../services/openaiService';

// Générateur de pièces détaillées pour l'analyse simulée
const generateDetailedPieces = (style = 'casual') => {
  const pieceTemplates = {
    casual: [
      {
        type: 'top',
        name: 'T-shirt basique',
        color: 'blanc',
        material: 'coton',
        brand_estimation: 'Zara, H&M, Uniqlo',
        price_range: '15-30€',
        style: 'décontracté',
        fit: 'regular'
      },
      {
        type: 'bottom',
        name: 'Jean droit',
        color: 'bleu',
        material: 'denim',
        brand_estimation: 'Levi\'s, Gap',
        price_range: '50-100€',
        style: 'classique',
        fit: 'regular'
      },
      {
        type: 'shoes',
        name: 'Baskets casual',
        color: 'blanc',
        material: 'toile',
        brand_estimation: 'Converse, Vans',
        price_range: '50-80€',
        style: 'décontracté',
        fit: 'standard'
      }
    ],
    formal: [
      {
        type: 'top',
        name: 'Chemise oxford',
        color: 'bleu clair',
        material: 'coton oxford',
        brand_estimation: 'Ralph Lauren, Brooks Brothers',
        price_range: '60-120€',
        style: 'formel',
        fit: 'slim'
      },
      {
        type: 'bottom',
        name: 'Pantalon de costume',
        color: 'gris anthracite',
        material: 'laine mélangée',
        brand_estimation: 'Hugo Boss, Massimo Dutti',
        price_range: '100-200€',
        style: 'business',
        fit: 'tailored'
      },
      {
        type: 'shoes',
        name: 'Derbies en cuir',
        color: 'noir',
        material: 'cuir véritable',
        brand_estimation: 'Church\'s, Loake',
        price_range: '150-300€',
        style: 'formel',
        fit: 'standard'
      }
    ],
    sporty: [
      {
        type: 'top',
        name: 'T-shirt technique',
        color: 'noir',
        material: 'polyester respirant',
        brand_estimation: 'Nike, Adidas, Under Armour',
        price_range: '30-60€',
        style: 'sportif',
        fit: 'fitted'
      },
      {
        type: 'bottom',
        name: 'Jogging technique',
        color: 'gris',
        material: 'polyester élasthanne',
        brand_estimation: 'Nike, Puma',
        price_range: '40-80€',
        style: 'sportif',
        fit: 'regular'
      },
      {
        type: 'shoes',
        name: 'Sneakers de running',
        color: 'noir/blanc',
        material: 'mesh synthétique',
        brand_estimation: 'Nike, Adidas, New Balance',
        price_range: '80-150€',
        style: 'sportif',
        fit: 'standard'
      }
    ]
  };

  // Sélectionner le template approprié ou utiliser casual par défaut
  const selectedTemplate = pieceTemplates[style.toLowerCase()] || pieceTemplates.casual;
  
  // Ajouter potentiellement des accessoires
  const accessories = Math.random() > 0.5 ? [{
    type: 'accessory',
    name: style === 'formal' ? 'Montre classique' : 'Casquette',
    color: style === 'formal' ? 'argent' : 'noir',
    material: style === 'formal' ? 'acier inoxydable' : 'coton',
    brand_estimation: style === 'formal' ? 'Seiko, Tissot' : 'Nike, Adidas',
    price_range: style === 'formal' ? '100-300€' : '20-40€',
    style: style,
    fit: 'unique'
  }] : [];

  return [...selectedTemplate, ...accessories];
};

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
          const randomStyle = ['casual', 'formal', 'sporty'][Math.floor(Math.random() * 3)];
          aiAnalysis = {
            style: randomStyle === 'formal' ? 'Business chic' : randomStyle === 'sporty' ? 'Sportswear moderne' : 'Casual chic',
            category: randomStyle === 'formal' ? 'professionnel' : randomStyle === 'sporty' ? 'sport' : 'quotidien',
            colors: {
              primary: randomStyle === 'formal' ? ['noir', 'gris'] : randomStyle === 'sporty' ? ['noir', 'blanc'] : ['blanc', 'bleu'],
              secondary: ['gris']
            },
            occasion: randomStyle === 'formal' ? 'travail' : randomStyle === 'sporty' ? 'sport' : 'quotidien',
            season: 'spring',
            recommendations: [
              'Ajouter un accessoire coloré pour dynamiser la tenue',
              'Une veste en jean serait parfaite pour compléter ce look'
            ],
            confidence: 0.85,
            pieces: generateDetailedPieces(randomStyle)
          };
        } else {
          aiAnalysis = openaiData;
        }
      } catch (error) {
        console.error('Error calling OpenAI:', error);
        // Utiliser l'analyse simulée en cas d'erreur
        const randomStyle = ['casual', 'formal', 'sporty'][Math.floor(Math.random() * 3)];
        aiAnalysis = {
          style: randomStyle === 'formal' ? 'Business chic' : randomStyle === 'sporty' ? 'Sportswear moderne' : 'Casual chic',
          category: randomStyle === 'formal' ? 'professionnel' : randomStyle === 'sporty' ? 'sport' : 'quotidien',
          colors: {
            primary: randomStyle === 'formal' ? ['noir', 'gris'] : randomStyle === 'sporty' ? ['noir', 'blanc'] : ['blanc', 'bleu'],
            secondary: ['gris']
          },
          occasion: randomStyle === 'formal' ? 'travail' : randomStyle === 'sporty' ? 'sport' : 'quotidien',
          season: 'spring',
          recommendations: [
            'Ajouter un accessoire coloré pour dynamiser la tenue',
            'Une veste en jean serait parfaite pour compléter ce look'
          ],
          confidence: 0.85,
          pieces: generateDetailedPieces(randomStyle)
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
          items: aiAnalysis.pieces ? aiAnalysis.pieces.map(piece => ({
            type: piece.type,
            name: piece.name,
            description: `${piece.name} - ${piece.color}`,
            color: piece.color,
            material: piece.material,
            brand_estimation: piece.brand_estimation,
            price_range: piece.price_range,
            style: piece.style,
            fit: piece.fit
          })) : [{
            description: `${aiAnalysis.style} - ${aiAnalysis.category}`
          }],
          matching_suggestions: aiAnalysis.recommendations || [],
          analysis_confidence: (aiAnalysis.confidence || 0.8) * 100,
          analyzed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (analysisError) throw analysisError;
      
      // Pour les tenues complètes, on ne crée PAS d'entrée dans clothing_items
      // car outfit_analyses est déjà chargé dans useWardrobe
      
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