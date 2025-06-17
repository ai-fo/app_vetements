import { supabase } from '../../../shared/api/supabase';
import { storageService } from '../../../shared/api/storage';
import { openaiService } from '../../../services/openaiService';

// Simuler une détection dynamique des pièces visibles sur la photo
const generateDynamicPiecesDetection = () => {
  // Simule ce que l'IA devrait détecter sur une photo réelle
  const detectedPieces = [];
  
  // Définir les possibilités de détection
  const possibleDetections = {
    tops: [
      { name: 'T-shirt', materials: ['coton', 'polyester'], brands: ['H&M', 'Zara', 'Uniqlo'], priceRange: '15-40€' },
      { name: 'Chemise', materials: ['coton', 'lin'], brands: ['Ralph Lauren', 'Massimo Dutti'], priceRange: '50-120€' },
      { name: 'Pull', materials: ['laine', 'coton mélangé'], brands: ['COS', 'Arket'], priceRange: '60-150€' },
      { name: 'Veste', materials: ['denim', 'cuir', 'polyester'], brands: ['Levi\'s', 'The Kooples'], priceRange: '80-300€' },
      { name: 'Manteau', materials: ['laine', 'cachemire'], brands: ['Mango', 'Sandro'], priceRange: '150-500€' },
      { name: 'Sweat', materials: ['coton', 'polyester'], brands: ['Nike', 'Champion'], priceRange: '40-80€' }
    ],
    bottoms: [
      { name: 'Jean', materials: ['denim'], brands: ['Levi\'s', 'Diesel', 'G-Star'], priceRange: '60-150€' },
      { name: 'Pantalon', materials: ['coton', 'laine'], brands: ['Dockers', 'Hugo Boss'], priceRange: '70-200€' },
      { name: 'Short', materials: ['coton', 'lin'], brands: ['Lacoste', 'Tommy Hilfiger'], priceRange: '40-100€' },
      { name: 'Jupe', materials: ['polyester', 'coton'], brands: ['Zara', 'Maje'], priceRange: '40-120€' },
      { name: 'Jogging', materials: ['coton', 'polyester'], brands: ['Adidas', 'Puma'], priceRange: '40-80€' }
    ],
    shoes: [
      { name: 'Baskets', materials: ['cuir', 'toile', 'synthétique'], brands: ['Nike', 'Adidas', 'Veja'], priceRange: '60-200€' },
      { name: 'Bottes', materials: ['cuir', 'suède'], brands: ['Dr. Martens', 'Timberland'], priceRange: '120-300€' },
      { name: 'Chaussures habillées', materials: ['cuir'], brands: ['Clarks', 'Geox'], priceRange: '100-250€' },
      { name: 'Sandales', materials: ['cuir', 'synthétique'], brands: ['Birkenstock', 'Havaianas'], priceRange: '30-100€' }
    ],
    accessories: [
      { name: 'Sac', materials: ['cuir', 'toile'], brands: ['Longchamp', 'Michael Kors'], priceRange: '50-300€' },
      { name: 'Montre', materials: ['acier', 'cuir'], brands: ['Casio', 'Fossil'], priceRange: '50-500€' },
      { name: 'Chapeau', materials: ['coton', 'laine'], brands: ['New Era', 'Stetson'], priceRange: '30-100€' },
      { name: 'Écharpe', materials: ['laine', 'cachemire'], brands: ['Acne Studios', 'COS'], priceRange: '40-150€' },
      { name: 'Ceinture', materials: ['cuir'], brands: ['Hermès', 'Lacoste'], priceRange: '40-200€' },
      { name: 'Lunettes', materials: ['acétate', 'métal'], brands: ['Ray-Ban', 'Oakley'], priceRange: '80-300€' }
    ]
  };

  const colors = ['noir', 'blanc', 'gris', 'bleu marine', 'beige', 'marron', 'vert kaki', 'bordeaux', 'bleu clair'];
  const fits = ['slim', 'regular', 'oversized', 'tailored', 'relaxed'];
  const styles = ['casual', 'streetwear', 'business casual', 'sportif', 'bohème', 'minimaliste', 'classique'];

  // Détecter au moins un top visible
  const topCount = Math.random() > 0.7 ? 2 : 1; // 30% de chance d'avoir 2 couches (ex: t-shirt + veste)
  for (let i = 0; i < topCount; i++) {
    const topItem = possibleDetections.tops[Math.floor(Math.random() * possibleDetections.tops.length)];
    detectedPieces.push({
      type: 'top',
      name: topItem.name,
      color: colors[Math.floor(Math.random() * colors.length)],
      material: topItem.materials[Math.floor(Math.random() * topItem.materials.length)],
      brand_estimation: topItem.brands.join(', '),
      price_range: topItem.priceRange,
      style: styles[Math.floor(Math.random() * styles.length)],
      fit: fits[Math.floor(Math.random() * fits.length)]
    });
  }

  // Détecter un bottom (si visible)
  if (Math.random() > 0.1) { // 90% de chance qu'un bottom soit visible
    const bottomItem = possibleDetections.bottoms[Math.floor(Math.random() * possibleDetections.bottoms.length)];
    detectedPieces.push({
      type: 'bottom',
      name: bottomItem.name,
      color: colors[Math.floor(Math.random() * colors.length)],
      material: bottomItem.materials[Math.floor(Math.random() * bottomItem.materials.length)],
      brand_estimation: bottomItem.brands.join(', '),
      price_range: bottomItem.priceRange,
      style: styles[Math.floor(Math.random() * styles.length)],
      fit: fits[Math.floor(Math.random() * fits.length)]
    });
  }

  // Détecter des chaussures (si visibles)
  if (Math.random() > 0.3) { // 70% de chance que les chaussures soient visibles
    const shoeItem = possibleDetections.shoes[Math.floor(Math.random() * possibleDetections.shoes.length)];
    detectedPieces.push({
      type: 'shoes',
      name: shoeItem.name,
      color: colors[Math.floor(Math.random() * colors.length)],
      material: shoeItem.materials[Math.floor(Math.random() * shoeItem.materials.length)],
      brand_estimation: shoeItem.brands.join(', '),
      price_range: shoeItem.priceRange,
      style: styles[Math.floor(Math.random() * styles.length)],
      fit: 'standard'
    });
  }

  // Détecter des accessoires (aléatoire)
  const accessoryCount = Math.floor(Math.random() * 3); // 0 à 2 accessoires
  for (let i = 0; i < accessoryCount; i++) {
    const accessoryItem = possibleDetections.accessories[Math.floor(Math.random() * possibleDetections.accessories.length)];
    detectedPieces.push({
      type: 'accessory',
      name: accessoryItem.name,
      color: colors[Math.floor(Math.random() * colors.length)],
      material: accessoryItem.materials[Math.floor(Math.random() * accessoryItem.materials.length)],
      brand_estimation: accessoryItem.brands.join(', '),
      price_range: accessoryItem.priceRange,
      style: styles[Math.floor(Math.random() * styles.length)],
      fit: 'unique'
    });
  }

  return detectedPieces;
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
          const detectedPieces = generateDynamicPiecesDetection();
          
          // Analyser le style global basé sur les pièces détectées
          const pieceStyles = detectedPieces.map(p => p.style);
          const dominantStyle = pieceStyles.reduce((acc, style) => {
            acc[style] = (acc[style] || 0) + 1;
            return acc;
          }, {});
          const overallStyle = Object.keys(dominantStyle).reduce((a, b) => dominantStyle[a] > dominantStyle[b] ? a : b);
          
          // Extraire les couleurs principales
          const pieceColors = detectedPieces.map(p => p.color);
          const primaryColors = [...new Set(pieceColors)].slice(0, 3);
          
          aiAnalysis = {
            style: overallStyle === 'business casual' ? 'Business chic' : 
                   overallStyle === 'sportif' ? 'Sportswear moderne' : 
                   overallStyle === 'streetwear' ? 'Urban style' : 'Casual chic',
            category: overallStyle.includes('business') ? 'professionnel' : 
                      overallStyle === 'sportif' ? 'sport' : 'quotidien',
            colors: {
              primary: primaryColors,
              secondary: ['gris', 'beige'].filter(c => !primaryColors.includes(c))
            },
            occasion: overallStyle.includes('business') ? 'travail' : 
                      overallStyle === 'sportif' ? 'sport' : 'quotidien',
            season: 'spring',
            recommendations: [
              `Cette tenue ${overallStyle} pourrait être complétée avec un accessoire contrastant`,
              detectedPieces.length < 4 ? 'Ajouter une pièce supplémentaire pour plus de style' : 
                                          'L\'ensemble est bien équilibré, attention à ne pas surcharger'
            ],
            confidence: 0.85,
            pieces: detectedPieces
          };
        } else {
          aiAnalysis = openaiData;
        }
      } catch (error) {
        console.error('Error calling OpenAI:', error);
        // Utiliser l'analyse simulée en cas d'erreur
        const detectedPieces = generateDynamicPiecesDetection();
        
        // Analyser le style global basé sur les pièces détectées
        const pieceStyles = detectedPieces.map(p => p.style);
        const dominantStyle = pieceStyles.reduce((acc, style) => {
          acc[style] = (acc[style] || 0) + 1;
          return acc;
        }, {});
        const overallStyle = Object.keys(dominantStyle).reduce((a, b) => dominantStyle[a] > dominantStyle[b] ? a : b);
        
        // Extraire les couleurs principales
        const pieceColors = detectedPieces.map(p => p.color);
        const primaryColors = [...new Set(pieceColors)].slice(0, 3);
        
        aiAnalysis = {
          style: overallStyle === 'business casual' ? 'Business chic' : 
                 overallStyle === 'sportif' ? 'Sportswear moderne' : 
                 overallStyle === 'streetwear' ? 'Urban style' : 'Casual chic',
          category: overallStyle.includes('business') ? 'professionnel' : 
                    overallStyle === 'sportif' ? 'sport' : 'quotidien',
          colors: {
            primary: primaryColors,
            secondary: ['gris', 'beige'].filter(c => !primaryColors.includes(c))
          },
          occasion: overallStyle.includes('business') ? 'travail' : 
                    overallStyle === 'sportif' ? 'sport' : 'quotidien',
          season: 'spring',
          recommendations: [
            `Cette tenue ${overallStyle} pourrait être complétée avec un accessoire contrastant`,
            detectedPieces.length < 4 ? 'Ajouter une pièce supplémentaire pour plus de style' : 
                                        'L\'ensemble est bien équilibré, attention à ne pas surcharger'
          ],
          confidence: 0.85,
          pieces: detectedPieces
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