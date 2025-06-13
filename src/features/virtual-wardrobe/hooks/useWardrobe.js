import { useState, useEffect } from 'react';
import { ItemType } from '../types';

export function useWardrobe(userId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    itemType: null,
    category: null,
    season: null,
    color: null,
    brand: null
  });

  useEffect(() => {
    if (userId) {
      loadWardrobeItems();
    }
  }, [userId, filters]);

  const loadWardrobeItems = async () => {
    setLoading(true);
    try {
      // TODO: Activer quand le backend est prêt
      // const response = await wardrobeAPI.getItems(userId, filters);
      
      // Simulation temporaire avec données mockées
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockItems = [
        {
          id: '1',
          userId,
          itemType: ItemType.OUTFIT,
          category: 'full_outfit',
          imageUrl: 'https://via.placeholder.com/400x600',
          colors: ['noir', 'blanc'],
          materials: ['cotton', 'denim'],
          seasons: ['fall', 'winter'],
          brand: 'Zara',
          name: 'Tenue décontractée',
          createdAt: new Date().toISOString(),
          tags: ['casual', 'work']
        },
        {
          id: '2',
          userId,
          itemType: ItemType.SINGLE_PIECE,
          category: 'top',
          imageUrl: 'https://via.placeholder.com/400x600',
          colors: ['bleu'],
          materials: ['cotton'],
          seasons: ['spring', 'summer'],
          brand: 'H&M',
          name: 'T-shirt basique',
          createdAt: new Date().toISOString(),
          tags: ['basic', 'casual']
        }
      ];

      setItems(mockItems);
    } catch (error) {
      console.error('Error loading wardrobe items:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId, updates) => {
    try {
      // TODO: Activer quand le backend est prêt
      // const response = await wardrobeAPI.updateItem(itemId, updates);
      
      // Simulation temporaire
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      // TODO: Activer quand le backend est prêt
      // await wardrobeAPI.deleteItem(itemId);
      
      // Simulation temporaire
      await new Promise(resolve => setTimeout(resolve, 500));
      
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

  const getFilteredItems = () => {
    return items.filter(item => {
      if (filters.itemType && item.itemType !== filters.itemType) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.season && !item.seasons.includes(filters.season)) return false;
      if (filters.color && !item.colors.includes(filters.color)) return false;
      if (filters.brand && item.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
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
    refreshWardrobe: loadWardrobeItems
  };
}