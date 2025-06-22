import { supabase } from '../../../shared/api/supabase';

/**
 * Transforme un item de la DB vers le format frontend
 */
const transformClothingItemToFrontend = (dbItem) => ({
  id: dbItem.id,
  userId: dbItem.user_id,
  itemType: 'SINGLE_PIECE',
  category: dbItem.type,
  imageUrl: dbItem.image_url,
  imagePath: dbItem.image_path,
  colors: dbItem.color ? [dbItem.color] : [],
  materials: dbItem.materials || [],
  seasons: dbItem.seasons || ['all_season'],
  brand: dbItem.brand || '',
  name: dbItem.name || '',
  createdAt: dbItem.created_at,
  updatedAt: dbItem.updated_at,
  tags: dbItem.tags || [],
  isFavorite: dbItem.is_favorite || false
});

/**
 * Transforme une analyse d'outfit vers le format frontend
 */
const transformOutfitAnalysisToFrontend = (analysis) => ({
  id: analysis.id,
  userId: analysis.user_id,
  itemType: 'OUTFIT',
  category: 'full_outfit',
  imageUrl: analysis.image_url,
  thumbnailUrl: analysis.thumbnail_url,
  colors: analysis.colors?.primary || [],
  materials: analysis.materials || [],
  seasons: analysis.seasons || ['all_season'],
  brand: analysis.style || 'Tenue complète',
  name: `${analysis.style || 'Tenue'} - ${analysis.category || 'analysée'}`,
  createdAt: analysis.created_at,
  tags: analysis.occasions || [],
  isFavorite: false,
  analysisData: {
    formality: analysis.formality,
    versatility: analysis.versatility,
    comfort: analysis.comfort,
    weather: analysis.weather,
    matchingSuggestions: analysis.matching_suggestions,
    improvements: analysis.improvements
  }
});

/**
 * API Supabase pour la garde-robe virtuelle
 */
export const wardrobeSupabaseAPI = {
  /**
   * Récupère tous les items de la garde-robe d'un utilisateur
   */
  async getItems(userId, filters = {}) {
    try {
      // Maintenant on récupère tout depuis outfit_analyses
      // Les pièces simples auront category != 'full_outfit'
      let query = supabase
        .from('outfit_analyses')
        .select('*')
        .eq('user_id', userId)
        .eq('processing_status', 'completed')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Transformer toutes les analyses en items de garde-robe
      const items = (data || []).map(analysis => {
        // Si c'est explicitement une pièce unique
        if (analysis.category === 'piece_unique') {
          return {
            id: analysis.id,
            userId: analysis.user_id,
            itemType: 'SINGLE_PIECE',
            category: analysis.items?.[0]?.type || 'top',
            imageUrl: analysis.image_url,
            colors: analysis.colors?.primary || [],
            materials: analysis.materials || [],
            seasons: analysis.seasons || ['all_season'],
            brand: analysis.items?.[0]?.brand || analysis.style || '',
            name: analysis.items?.[0]?.name || analysis.style || 'Article',
            createdAt: analysis.created_at,
            tags: analysis.occasions || [],
            isFavorite: false
          };
        } else {
          // Sinon c'est une tenue complète (toutes les autres catégories)
          return transformOutfitAnalysisToFrontend(analysis);
        }
      });

      return {
        data: items,
        error: null
      };
    } catch (error) {
      return {
        data: [],
        error: error.message || 'Erreur lors de la récupération des articles'
      };
    }
  },

  /**
   * Crée un nouvel item dans la garde-robe
   */
  async createItem(itemData) {
    try {
      // Créer dans outfit_analyses au lieu de clothing_items
      const insertData = {
        user_id: itemData.userId,
        image_url: itemData.imageUrl,
        processing_status: 'completed',
        style: itemData.name || itemData.brand || 'Article',
        category: 'piece_unique',
        formality: 5,
        versatility: 7,
        colors: {
          primary: itemData.colors || [],
          secondary: []
        },
        seasons: itemData.seasons || ['all_season'],
        occasions: itemData.tags || [],
        materials: itemData.materials || [],
        items: [{
          type: itemData.category || 'top',
          name: itemData.name || 'Article',
          description: `${itemData.name || 'Article'} - ${itemData.colors?.[0] || 'couleur'}`,
          color: itemData.colors?.[0] || null,
          material: itemData.materials?.[0] || null,
          price_range: null,
          style: itemData.brand || '',
          fit: 'regular'
        }],
        analysis_confidence: 90,
        analyzed_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('outfit_analyses')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          id: data.id,
          userId: data.user_id,
          itemType: 'SINGLE_PIECE',
          category: itemData.category || 'top',
          imageUrl: data.image_url,
          colors: itemData.colors || [],
          materials: itemData.materials || [],
          seasons: itemData.seasons || ['all_season'],
          brand: itemData.brand || '',
          name: itemData.name || 'Article',
          createdAt: data.created_at,
          tags: itemData.tags || [],
          isFavorite: false
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error.message || 'Erreur lors de la création de l\'article'
      };
    }
  },

  /**
   * Met à jour un item existant
   */
  async updateItem(itemId, updates) {
    try {
      // Récupérer l'item actuel
      const { data: currentItem, error: fetchError } = await supabase
        .from('outfit_analyses')
        .select('*')
        .eq('id', itemId)
        .single();

      if (fetchError) throw fetchError;

      const updateData = {
        updated_at: new Date().toISOString()
      };
      
      // Mapper les updates
      if (updates.name !== undefined) {
        updateData.style = updates.name;
        if (currentItem.items?.length > 0) {
          updateData.items = currentItem.items;
          updateData.items[0].name = updates.name;
        }
      }
      if (updates.colors?.length > 0) {
        updateData.colors = {
          primary: updates.colors,
          secondary: currentItem.colors?.secondary || []
        };
        if (currentItem.items?.length > 0) {
          updateData.items = currentItem.items;
          updateData.items[0].color = updates.colors[0];
        }
      }
      if (updates.tags !== undefined) {
        updateData.occasions = updates.tags;
      }
      
      const { data, error } = await supabase
        .from('outfit_analyses')
        .update(updateData)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      // Retourner dans le format attendu
      return {
        data: {
          id: data.id,
          userId: data.user_id,
          itemType: data.category === 'piece_unique' ? 'SINGLE_PIECE' : 'OUTFIT',
          category: data.items?.[0]?.type || 'top',
          imageUrl: data.image_url,
          colors: data.colors?.primary || [],
          materials: data.materials || [],
          seasons: data.seasons || ['all_season'],
          brand: updates.brand || data.style || '',
          name: data.style || 'Article',
          createdAt: data.created_at,
          tags: data.occasions || [],
          isFavorite: false
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error.message || 'Erreur lors de la mise à jour'
      };
    }
  },

  /**
   * Supprime un item de la garde-robe
   */
  async deleteItem(itemId) {
    // Maintenant on utilise deleteOutfitAnalysis pour tout
    return this.deleteOutfitAnalysis(itemId);
  },

  /**
   * Récupère les analyses d'outfit pour un utilisateur
   */
  async getOutfitAnalyses(userId) {
    try {
      const { data, error } = await supabase
        .from('outfit_analyses')
        .select('*')
        .eq('user_id', userId)
        .eq('processing_status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(transformOutfitAnalysisToFrontend);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bascule le statut favori d'un item
   */
  async toggleFavorite(itemId, isFavorite) {
    try {
      // Pour l'instant, on ne gère pas les favoris dans outfit_analyses
      // On pourrait ajouter un champ is_favorite dans outfit_analyses si nécessaire
      return {
        data: { isFavorite },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error.message || 'Erreur lors de la mise à jour du favori'
      };
    }
  },

  /**
   * Supprime une analyse d'outfit
   */
  async deleteOutfitAnalysis(analysisId) {
    try {
      const { data, error } = await supabase
        .from('outfit_analyses')
        .delete()
        .eq('id', analysisId)
        .select();

      if (error) throw error;

      return {
        success: true,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la suppression de l\'analyse'
      };
    }
  }
};