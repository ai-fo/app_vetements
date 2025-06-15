import { useState, useEffect } from 'react';
import { ItemType } from '../types';
import { storageService } from '../../../shared/api/storage';
import { wardrobeSupabaseAPI } from '../api/supabaseWardrobe';

export function useWardrobe(userId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    itemType: null,
    category: null,
    season: null,
    color: null,
    brand: null,
    isFavorite: false
  });

  useEffect(() => {
    if (userId) {
      loadWardrobeItems();
    }
  }, [userId, filters]);

  const loadWardrobeItems = async () => {
    setLoading(true);
    try {
      // Récupérer les vêtements depuis Supabase
      const { data, error } = await wardrobeSupabaseAPI.getItems(userId, filters);
      
      if (error) {
        throw new Error(error);
      }
      
      // Adapter les données pour le format attendu par le composant
      const formattedItems = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        itemType: item.item_type || ItemType.SINGLE_PIECE,
        category: item.category,
        imageUrl: item.image_url,
        imagePath: item.image_path,
        colors: item.colors || [],
        materials: item.materials || [],
        seasons: item.seasons || [],
        brand: item.brand || '',
        name: item.name || '',
        createdAt: item.created_at,
        tags: item.tags || [],
        isFavorite: item.is_favorite || false
      }));
      
      setItems(formattedItems);
    } catch (error) {
      console.error('Error loading wardrobe items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId, updates) => {
    try {
      await wardrobeSupabaseAPI.updateItem(itemId, updates);
      
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error updating item:', error);
      return false;
    }
  };

  const deleteItem = async (itemId) => {
    try {
      // Trouver l'item pour récupérer l'imagePath
      const item = items.find(i => i.id === itemId);
      
      await wardrobeSupabaseAPI.deleteItem(itemId);
      
      // Supprimer l'image de Supabase Storage si elle existe
      if (item?.imagePath) {
        try {
          await storageService.deletePhoto(item.imagePath);
        } catch (error) {
          console.error('Error deleting photo from storage:', error);
          // Continue même si la suppression de l'image échoue
        }
      }
      
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const toggleFavorite = async (itemId) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;
      
      const newFavoriteStatus = !item.isFavorite;
      
      const { error } = await wardrobeSupabaseAPI.toggleFavorite(itemId, newFavoriteStatus);
      
      if (error) {
        throw new Error(error);
      }
      
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, isFavorite: newFavoriteStatus } : item
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };

  const getFilteredItems = () => {
    return items.filter(item => {
      if (filters.itemType && item.itemType !== filters.itemType) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.season && !item.seasons.includes(filters.season)) return false;
      if (filters.color && !item.colors.includes(filters.color)) return false;
      if (filters.brand && item.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
      if (filters.isFavorite && !item.isFavorite) return false;
      return true;
    });
  };

  return {
    items: getFilteredItems(),
    loading,
    filters,
    applyFilters,
    updateItem,
    deleteItem,
    toggleFavorite,
    refreshWardrobe: loadWardrobeItems
  };
}