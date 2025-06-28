/**
 * Hook partagé pour accéder aux données de garde-robe
 * Utilisable par tous les modules sans créer de dépendances croisées
 */
import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

export const useWardrobeData = (userId) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadWardrobe();
  }, [userId]);

  const loadWardrobe = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Charger les pièces individuelles
      const { data: pieces, error: piecesError } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (piecesError) throw piecesError;

      // Charger les tenues complètes
      const { data: looks, error: looksError } = await supabase
        .from('outfit_looks')
        .select(`
          *,
          items:look_items(
            item_id,
            position,
            bounding_box,
            item:clothing_items(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (looksError) throw looksError;

      // Combiner les résultats
      const allItems = [
        ...(pieces || []).map(item => ({
          ...item,
          itemType: 'SINGLE_PIECE',
          imageUrl: item.image_url,
          capture_type: 'single_piece'
        })),
        ...(looks || []).map(look => ({
          ...look,
          id: look.id,
          name: look.name || 'Tenue complète',
          itemType: 'OUTFIT',
          imageUrl: look.image_url,
          capture_type: 'complete_look',
          pieces: look.items?.map(li => li.item).filter(Boolean) || []
        }))
      ];

      setItems(allItems);
    } catch (err) {
      console.error('Erreur lors du chargement de la garde-robe:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    error,
    refresh: loadWardrobe
  };
};