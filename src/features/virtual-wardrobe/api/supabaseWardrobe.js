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
      let query = supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Appliquer les filtres
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.color) {
        query = query.eq('color', filters.color);
      }
      if (filters.brand) {
        query = query.ilike('brand', `%${filters.brand}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        data: (data || []).map(transformClothingItemToFrontend),
        error: null
      };
    } catch (error) {
      console.error('Error fetching wardrobe items:', error);
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
      const insertData = {
        user_id: itemData.userId,
        image_url: itemData.imageUrl,
        type: itemData.category || 'top',
        color: itemData.colors?.[0] || null,
        brand: itemData.brand || null,
        name: itemData.name || null,
        tags: itemData.tags || null,
        image_path: itemData.imagePath || null
      };
      
      const { data, error } = await supabase
        .from('clothing_items')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      return {
        data: transformClothingItemToFrontend(data),
        error: null
      };
    } catch (error) {
      console.error('Error creating wardrobe item:', error);
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
      const updateData = {
        updated_at: new Date().toISOString()
      };
      
      // Mapper les updates vers les colonnes DB
      if (updates.category !== undefined) updateData.type = updates.category;
      if (updates.colors?.length > 0) updateData.color = updates.colors[0];
      if (updates.brand !== undefined) updateData.brand = updates.brand;
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;
      
      const { data, error } = await supabase
        .from('clothing_items')
        .update(updateData)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      return {
        data: transformClothingItemToFrontend(data),
        error: null
      };
    } catch (error) {
      console.error('Error updating wardrobe item:', error);
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
    try {
      const { error } = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Error deleting wardrobe item:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la suppression'
      };
    }
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
      console.error('Error fetching outfit analyses:', error);
      throw error;
    }
  },

  /**
   * Bascule le statut favori d'un item
   */
  async toggleFavorite(itemId, isFavorite) {
    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .update({ 
          is_favorite: isFavorite,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      return {
        data: transformClothingItemToFrontend(data),
        error: null
      };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return {
        data: null,
        error: error.message || 'Erreur lors de la mise à jour du favori'
      };
    }
  }
};