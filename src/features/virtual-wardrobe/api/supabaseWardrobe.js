import { supabase } from '../../../shared/api/supabase';

export const wardrobeSupabaseAPI = {
  // Récupérer tous les items de la garde-robe
  getItems: async (userId, filters = {}) => {
    try {
      let query = supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Appliquer les filtres
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.itemType) {
        query = query.eq('item_type', filters.itemType);
      }
      if (filters.brand) {
        query = query.eq('brand', filters.brand);
      }
      if (filters.season) {
        query = query.contains('seasons', [filters.season]);
      }
      if (filters.color) {
        query = query.contains('colors', [filters.color]);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        error: null
      };
    } catch (error) {
      console.error('Error fetching wardrobe items:', error);
      return {
        data: [],
        error: error.message
      };
    }
  },

  // Créer un nouvel item
  createItem: async (itemData) => {
    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .insert({
          user_id: itemData.userId,
          image_url: itemData.imageUrl,
          image_path: itemData.imagePath,
          item_type: itemData.itemType,
          category: itemData.category,
          colors: itemData.colors || [],
          brand: itemData.brand || '',
          name: itemData.name || '',
          tags: itemData.tags || [],
          materials: itemData.materials || [],
          seasons: itemData.seasons || [],
          is_favorite: false
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null
      };
    } catch (error) {
      console.error('Error creating wardrobe item:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  // Mettre à jour un item
  updateItem: async (itemId, updates) => {
    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null
      };
    } catch (error) {
      console.error('Error updating wardrobe item:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  // Supprimer un item
  deleteItem: async (itemId) => {
    try {
      // Récupérer l'item pour obtenir le path de l'image
      const { data: item } = await supabase
        .from('clothing_items')
        .select('image_path')
        .eq('id', itemId)
        .single();

      // Supprimer l'item de la base
      const { error } = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Supprimer l'image du storage si elle existe
      if (item?.image_path) {
        try {
          const { storageService } = await import('../../../shared/api/storage');
          await storageService.deletePhoto(item.image_path);
        } catch (error) {
          console.error('Error deleting image from storage:', error);
        }
      }

      return {
        data: { message: 'Item supprimé avec succès' },
        error: null
      };
    } catch (error) {
      console.error('Error deleting wardrobe item:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  // Basculer le statut favori
  toggleFavorite: async (itemId, isFavorite) => {
    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .update({ is_favorite: isFavorite })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null
      };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  // Obtenir les statistiques de garde-robe
  getWardrobeStats: async (userId) => {
    try {
      // Récupérer tous les items pour calculer les stats
      const { data: items, error } = await supabase
        .from('clothing_items')
        .select('category, colors, brand, seasons')
        .eq('user_id', userId);

      if (error) throw error;

      // Calculer les statistiques
      const stats = {
        totalItems: items.length,
        byCategory: {},
        favoriteColors: [],
        favoriteBrands: [],
        seasonalDistribution: {}
      };

      // Compter par catégorie
      const categoryCount = {};
      const colorCount = {};
      const brandCount = {};
      const seasonCount = {};

      items.forEach(item => {
        // Catégories
        if (item.category) {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
        }

        // Couleurs
        if (item.colors && Array.isArray(item.colors)) {
          item.colors.forEach(color => {
            colorCount[color] = (colorCount[color] || 0) + 1;
          });
        }

        // Marques
        if (item.brand) {
          brandCount[item.brand] = (brandCount[item.brand] || 0) + 1;
        }

        // Saisons
        if (item.seasons && Array.isArray(item.seasons)) {
          item.seasons.forEach(season => {
            seasonCount[season] = (seasonCount[season] || 0) + 1;
          });
        }
      });

      stats.byCategory = categoryCount;
      
      // Top 5 couleurs
      stats.favoriteColors = Object.entries(colorCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([color]) => color);

      // Top 5 marques
      stats.favoriteBrands = Object.entries(brandCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([brand]) => brand);

      stats.seasonalDistribution = seasonCount;

      return {
        data: stats,
        error: null
      };
    } catch (error) {
      console.error('Error fetching wardrobe stats:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  // Obtenir les suggestions de tenues (version simplifiée)
  getOutfitSuggestions: async (userId, occasion = null, weather = null) => {
    try {
      // Pour l'instant, on retourne des suggestions basiques basées sur les items existants
      const { data: items } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', userId)
        .limit(20);

      // Logique simple pour créer des suggestions
      const suggestions = [];
      
      // Suggestion 1: Tenue casual
      const casualItems = items.filter(item => 
        item.tags?.includes('casual') || item.category === 'top' || item.category === 'bottom'
      );
      
      if (casualItems.length >= 2) {
        suggestions.push({
          id: '1',
          name: 'Look casual',
          items: casualItems.slice(0, 3).map(item => item.name || item.category),
          occasion: 'quotidien',
          confidence: 0.8
        });
      }

      // Suggestion 2: Tenue formelle
      const formalItems = items.filter(item => 
        item.tags?.includes('formal') || item.category === 'dress' || item.category === 'outerwear'
      );
      
      if (formalItems.length >= 1) {
        suggestions.push({
          id: '2',
          name: 'Look élégant',
          items: formalItems.slice(0, 3).map(item => item.name || item.category),
          occasion: 'soirée',
          confidence: 0.75
        });
      }

      return {
        data: { suggestions },
        error: null
      };
    } catch (error) {
      console.error('Error getting outfit suggestions:', error);
      return {
        data: { suggestions: [] },
        error: error.message
      };
    }
  },

  // Rechercher des items similaires (version simplifiée)
  findSimilarItems: async (itemId) => {
    try {
      // Récupérer l'item de référence
      const { data: referenceItem } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (!referenceItem) {
        throw new Error('Item not found');
      }

      // Rechercher des items similaires basés sur la catégorie et les couleurs
      const { data: similarItems } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', referenceItem.user_id)
        .eq('category', referenceItem.category)
        .neq('id', itemId)
        .limit(5);

      // Calculer un score de similarité simple
      const itemsWithSimilarity = similarItems.map(item => {
        let similarity = 0.5; // Base score pour même catégorie
        
        // Bonus pour couleurs similaires
        if (item.colors && referenceItem.colors) {
          const commonColors = item.colors.filter(color => 
            referenceItem.colors.includes(color)
          );
          similarity += commonColors.length * 0.1;
        }
        
        // Bonus pour même marque
        if (item.brand === referenceItem.brand) {
          similarity += 0.2;
        }

        return {
          id: item.id,
          name: item.name || item.category,
          imageUrl: item.image_url,
          similarity: Math.min(similarity, 1),
          brand: item.brand
        };
      });

      // Trier par similarité décroissante
      itemsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

      return {
        data: itemsWithSimilarity,
        error: null
      };
    } catch (error) {
      console.error('Error finding similar items:', error);
      return {
        data: [],
        error: error.message
      };
    }
  }
};