import { useState, useEffect, useCallback } from 'react';
import { ItemType } from '../types';
import { storageService } from '../../../shared/api/storage';
import { wardrobeSupabaseAPI } from '../api/supabaseWardrobe';

/**
 * Hook personnalisé pour gérer la garde-robe
 * @param {string} userId - ID de l'utilisateur
 */
export function useWardrobe(userId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    itemType: null,
    category: null,
    season: null,
    color: null,
    brand: null,
    isFavorite: false
  });

  // Charger les items au montage
  useEffect(() => {
    if (userId) {
      loadWardrobeItems();
    }
  }, [userId]);

  /**
   * Charge tous les items de la garde-robe
   */
  const loadWardrobeItems = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Charger en parallèle pour de meilleures performances
      const [clothingResponse, outfitAnalyses] = await Promise.all([
        wardrobeSupabaseAPI.getItems(userId, filters),
        wardrobeSupabaseAPI.getOutfitAnalyses(userId)
      ]);
      
      // Combiner les résultats
      const allItems = [
        ...(clothingResponse.data || []),
        ...(outfitAnalyses || [])
      ];
      
      setItems(allItems);
    } catch (error) {
      console.error('Error loading wardrobe items:', error);
      setError('Impossible de charger votre garde-robe');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  /**
   * Met à jour un item existant
   */
  const updateItem = async (itemId, updates) => {
    try {
      const response = await wardrobeSupabaseAPI.updateItem(itemId, updates);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Mettre à jour l'état local
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, ...response.data } : item
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error updating item:', error);
      setError('Impossible de mettre à jour l\'article');
      return false;
    }
  };

  /**
   * Supprime un item de la garde-robe
   */
  const deleteItem = async (itemId) => {
    try {
      // Trouver l'item pour récupérer l'imagePath
      const item = items.find(i => i.id === itemId);
      
      const response = await wardrobeSupabaseAPI.deleteItem(itemId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Supprimer l'image du storage si elle existe
      if (item?.imagePath) {
        try {
          await storageService.deletePhoto(item.imagePath);
        } catch (error) {
          console.error('Error deleting photo from storage:', error);
          // Continue même si la suppression de l'image échoue
        }
      }
      
      // Mettre à jour l'état local
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Impossible de supprimer l\'article');
      return false;
    }
  };

  /**
   * Applique les nouveaux filtres
   */
  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  /**
   * Bascule le statut favori d'un item
   */
  const toggleFavorite = async (itemId) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return false;
      
      const newFavoriteStatus = !item.isFavorite;
      
      const response = await wardrobeSupabaseAPI.toggleFavorite(itemId, newFavoriteStatus);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Mettre à jour l'état local
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, isFavorite: newFavoriteStatus } : item
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Impossible de mettre à jour le favori');
      return false;
    }
  };

  /**
   * Filtre les items selon les critères
   */
  const getFilteredItems = useCallback(() => {
    return items.filter(item => {
      if (filters.itemType && item.itemType !== filters.itemType) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.season && !item.seasons.includes(filters.season)) return false;
      if (filters.color && !item.colors.includes(filters.color)) return false;
      if (filters.brand && item.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
      if (filters.isFavorite && !item.isFavorite) return false;
      return true;
    });
  }, [items, filters]);

  return {
    items: getFilteredItems(),
    loading,
    error,
    filters,
    applyFilters,
    updateItem,
    deleteItem,
    toggleFavorite,
    refreshWardrobe: loadWardrobeItems
  };
}