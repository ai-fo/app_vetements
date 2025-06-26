import { supabase } from '../../../shared/api/supabase';
import apiClient from '../../../shared/api/client';

/**
 * Transforme un item de la DB vers le format frontend
 */
const transformClothingItemToFrontend = (dbItem) => {
  // Si les données viennent de l'API backend (avec piece_id au lieu de id)
  const itemId = dbItem.piece_id || dbItem.id;
  
  return {
    id: itemId,
    userId: dbItem.user_id,
    itemType: 'SINGLE_PIECE',
    category: dbItem.piece_type,
    imageUrl: dbItem.image_url,
    imagePath: dbItem.image_path,
    colors: dbItem.colors?.primary || [],
    secondaryColors: dbItem.colors?.secondary || [],
    materials: dbItem.material ? [dbItem.material] : [],
    seasons: dbItem.seasonality || ['all_season'],
    brand: dbItem.brand || '',
    name: dbItem.name || '',
    createdAt: dbItem.created_at,
    updatedAt: dbItem.updated_at,
    tags: dbItem.occasion_tags || [],
    isFavorite: dbItem.is_favorite || false,
    styleTags: dbItem.style_tags || [],
    pattern: dbItem.pattern,
    fit: dbItem.fit,
    details: dbItem.details || [],
    wearCount: dbItem.wear_count || 0,
    // Données brutes pour le nouveau composant de détails
    rawData: {
      piece_type: dbItem.piece_type,
      attributes: {
        colors: dbItem.colors || { primary: [], secondary: [] },
        material: dbItem.material,
        pattern: dbItem.pattern,
        fit: dbItem.fit,
        details: dbItem.details || []
      },
      style_tags: dbItem.style_tags || [],
      occasion_tags: dbItem.occasion_tags || [],
      seasonality: dbItem.seasonality || []
    }
  };
};

/**
 * Transforme un look de la DB vers le format frontend
 */
const transformOutfitLookToFrontend = (look) => {
  console.log('🔄 Transforming outfit look:', {
    id: look.id,
    name: look.name,
    pieces: look.pieces,
    piecesCount: look.pieces?.length || 0,
    pieces_with_images: look.pieces?.map(p => ({
      id: p.id,
      name: p.name,
      image_url: p.image_url,
      bounding_box: p.bounding_box
    })) || []
  });
  
  return {
    id: look.id,
    userId: look.user_id,
    itemType: 'OUTFIT',
    category: 'full_outfit',
    imageUrl: look.image_url,
    thumbnailUrl: look.thumbnail_url,
    colors: look.color_palette?.primary || [],
    materials: [],
    seasons: look.seasonality || ['all_season'],
    brand: look.dominant_style?.[0] || 'Tenue complète',
    name: look.name || 'Look',
    createdAt: look.created_at,
    tags: look.occasion_tags || [],
    isFavorite: look.is_favorite || false,
    styleTags: look.dominant_style || [],
    patternMix: look.pattern_mix || [],
    silhouette: look.silhouette,
    layeringLevel: look.layering_level,
    rating: look.rating,
    wearCount: look.wear_count || 0,
    pieces: (look.pieces || []).map(piece => ({
      ...piece,
      // S'assurer que l'image_url de la pièce est bien incluse
      image_url: piece.image_url || null
    }))
  };
};

/**
 * API Supabase pour la garde-robe virtuelle
 */
export const wardrobeSupabaseAPI = {
  /**
   * Récupère tous les items de la garde-robe d'un utilisateur
   */
  async getItems(userId, filters = {}) {
    try {
      // Utiliser l'API backend Python pour récupérer les données
      const response = await fetch(`${apiClient.baseURL}/wardrobe/${userId}/pieces`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      
      // Transformer les données du backend
      const clothingItems = (data.pieces || []).map(transformClothingItemToFrontend);

      // Récupérer aussi les tenues complètes
      const looksResponse = await fetch(`${apiClient.baseURL}/wardrobe/${userId}/looks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let outfitLooks = [];
      if (looksResponse.ok) {
        const looksData = await looksResponse.json();
        outfitLooks = (looksData.looks || []).map(transformOutfitLookToFrontend);
      }

      // Combiner et trier les données
      const items = [...clothingItems, ...outfitLooks];
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        data: items,
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des items:', error);
      return {
        data: [],
        error: error.message || 'Erreur lors de la récupération des articles'
      };
    }
  },

  /**
   * Crée un nouvel item dans la garde-robe
   * Note: Cette fonction devrait utiliser le backend Python pour l'analyse
   * mais on garde une version basique pour la création manuelle
   */
  async createItem(itemData) {
    try {
      // Créer directement dans clothing_items pour une pièce ajoutée manuellement
      const insertData = {
        user_id: itemData.userId,
        piece_type: itemData.category || 'top',
        name: itemData.name || 'Article',
        colors: {
          primary: itemData.colors || [],
          secondary: []
        },
        material: itemData.materials?.[0] || null,
        pattern: 'uni',
        fit: 'regular',
        details: [],
        style_tags: [],
        occasion_tags: itemData.tags || [],
        seasonality: itemData.seasons || ['all_season'],
        image_url: itemData.imageUrl,
        brand: itemData.brand || null,
        is_active: true
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
      // Préparer les données pour l'API backend
      const updateData = {
        name: updates.name,
        brand: updates.brand,
        colors: {
          primary: updates.colors || [],
          secondary: updates.secondaryColors || []
        },
        material: updates.materials?.[0] || updates.material,
        pattern: updates.pattern,
        fit: updates.fit,
        details: updates.details || [],
        style_tags: updates.styleTags || [],
        occasion_tags: updates.tags || updates.occasion_tags || [],
        seasonality: updates.seasons || updates.seasonality || [],
        is_favorite: updates.isFavorite
      };

      // Nettoyer les undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const response = await fetch(`${apiClient.baseURL}/wardrobe/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        data: transformClothingItemToFrontend(data),
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
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
      console.log('Tentative de suppression de l\'item:', itemId);
      
      // D'abord essayer de supprimer de clothing_items
      const { data: clothingData, error: clothingError, count: clothingCount } = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', itemId)
        .select();

      console.log('Résultat clothing_items:', { data: clothingData, error: clothingError, count: clothingCount });

      if (!clothingError && clothingData && clothingData.length > 0) {
        console.log('✅ Item supprimé de clothing_items');
        return { success: true, error: null };
      }

      // Si pas trouvé, essayer outfit_looks
      const { data: lookData, error: lookError, count: lookCount } = await supabase
        .from('outfit_looks')
        .delete()
        .eq('id', itemId)
        .select();

      console.log('Résultat outfit_looks:', { data: lookData, error: lookError, count: lookCount });

      if (!lookError && lookData && lookData.length > 0) {
        console.log('✅ Look supprimé de outfit_looks');
        return { success: true, error: null };
      }

      console.log('❌ Aucun item trouvé avec cet ID');
      throw new Error('Item non trouvé');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la suppression'
      };
    }
  },

  /**
   * Récupère les tenues complètes pour un utilisateur
   */
  async getOutfitLooks(userId) {
    try {
      const { data, error } = await supabase
        .from('outfit_looks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(transformOutfitLookToFrontend);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bascule le statut favori d'un item
   */
  async toggleFavorite(itemId, isFavorite) {
    try {
      // D'abord essayer clothing_items
      let { data: clothingItem, error: clothingError } = await supabase
        .from('clothing_items')
        .update({ is_favorite: isFavorite })
        .eq('id', itemId)
        .select()
        .single();

      if (!clothingError && clothingItem) {
        return {
          data: { isFavorite: clothingItem.is_favorite },
          error: null
        };
      }

      // Si pas trouvé, essayer outfit_looks
      let { data: outfitLook, error: lookError } = await supabase
        .from('outfit_looks')
        .update({ is_favorite: isFavorite })
        .eq('id', itemId)
        .select()
        .single();

      if (!lookError && outfitLook) {
        return {
          data: { isFavorite: outfitLook.is_favorite },
          error: null
        };
      }

      throw new Error('Item non trouvé');
    } catch (error) {
      return {
        data: null,
        error: error.message || 'Erreur lors de la mise à jour du favori'
      };
    }
  },

};