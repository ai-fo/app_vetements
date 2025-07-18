import { supabase } from '../../../shared/api/supabase';

class RecommendationHistoryService {
  /**
   * Enregistre une nouvelle recommandation dans l'historique
   */
  async trackRecommendation(userId, recommendation) {
    try {
      // Générer un ID unique pour cette instance de recommandation
      const uniqueRecommendationId = `${recommendation.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Note: on ne vérifie plus les doublons car chaque recommandation a maintenant un ID unique
      
      // Déterminer le type de recommandation
      let recommendationType = 'single_item';
      let itemIds = [];
      
      if (recommendation.isMultiplePieces || recommendation.pieces) {
        recommendationType = 'combination';
        itemIds = recommendation.pieces.map(p => p.id);
      } else if (recommendation.itemType === 'OUTFIT' || recommendation.capture_type === 'complete_look') {
        recommendationType = 'complete_look';
        itemIds = [recommendation.id];
      } else {
        recommendationType = 'single_item';
        itemIds = [recommendation.id];
      }

      // Pour les IDs combo, extraire les UUIDs
      let recommendationId = recommendation.id;
      if (recommendationId && recommendationId.startsWith('combo-')) {
        const comboString = recommendationId.replace('combo-', '');
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
        const ids = comboString.match(uuidRegex) || [];
        if (ids.length > 0 && itemIds.length === 0) {
          itemIds = ids;
        }
      }

      // Normaliser l'ID du combo pour le stockage cohérent
      let normalizedOriginalId = recommendation.id;
      if (recommendation.id && recommendation.id.startsWith('combo-')) {
        const comboString = recommendation.id.replace('combo-', '');
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
        const ids = comboString.match(uuidRegex) || [];
        if (ids.length > 0) {
          normalizedOriginalId = `combo-${ids.sort().join('-')}`;
        }
      }
      
      const record = {
        user_id: userId,
        recommendation_id: uniqueRecommendationId, // Utiliser l'ID unique
        recommendation_type: recommendationType,
        item_ids: itemIds,
        weather_data: recommendation.weatherContext || null,
        reason: recommendation.reason || null,
        original_recommendation_id: normalizedOriginalId // ID normalisé pour comparaison
      };

      const { data, error } = await supabase
        .from('recommendation_tracking')
        .insert(record)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error tracking recommendation:', error);
      return { data: null, error };
    }
  }

  /**
   * Récupère l'historique des recommandations d'un utilisateur
   */
  async getRecentRecommendations(userId, days = 7) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_recommendation_history', {
          p_user_id: userId,
          p_days: days,
          p_limit: 100
        });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching recent recommendations:', error);
      return { data: [], error };
    }
  }

  /**
   * Récupère les recommandations récentes pour éviter les doublons (dernières 3 heures)
   */
  async getTodayRecommendations(userId) {
    try {
      // Récupérer seulement les recommandations des 3 dernières heures
      const threeHoursAgo = new Date();
      threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
      
      const { data, error } = await supabase
        .from('recommendation_tracking')
        .select('original_recommendation_id, item_ids')
        .eq('user_id', userId)
        .gte('recommended_at', threeHoursAgo.toISOString())
        .order('recommended_at', { ascending: false })
        .limit(10); // Limiter pour éviter trop de filtrage

      if (error) throw error;
      
      // Extraire les IDs originaux et les item_ids
      const recommendedToday = {
        originalIds: data.map(r => r.original_recommendation_id).filter(Boolean),
        itemIds: [...new Set(data.flatMap(r => r.item_ids || []))]
      };
      
      return { data: recommendedToday, error: null };
    } catch (error) {
      console.error('Error fetching today recommendations:', error);
      return { data: { originalIds: [], itemIds: [] }, error };
    }
  }

  /**
   * Marque une recommandation comme portée
   */
  async markAsWorn(recommendationId) {
    try {
      const { data, error } = await supabase
        .from('recommendation_tracking')
        .update({
          was_worn: true,
          worn_at: new Date().toISOString()
        })
        .eq('id', recommendationId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error marking recommendation as worn:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtient l'historique détaillé avec métadonnées des items
   */
  async getRecommendationHistory(userId, limit = 30) {
    try {
      // Récupérer l'historique
      const { data: history, error: historyError } = await supabase
        .rpc('get_user_recommendation_history', {
          p_user_id: userId,
          p_days: 30,
          p_limit: limit
        });

      if (historyError) throw historyError;

      // Récupérer les métadonnées des items
      const allItemIds = [...new Set(history.flatMap(h => h.item_ids || []))];
      
      if (allItemIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('clothing_items')
          .select('id, name, piece_type, image_url')
          .in('id', allItemIds);

        if (itemsError) throw itemsError;

        // Enrichir l'historique avec les métadonnées
        const itemsMap = new Map(items.map(item => [item.id, item]));
        
        const enrichedHistory = history.map(rec => {
          const firstItemId = rec.item_ids?.[0];
          const firstItem = firstItemId ? itemsMap.get(firstItemId) : null;
          
          return {
            ...rec,
            item_name: firstItem?.name || 'Recommandation',
            category: firstItem?.piece_type || rec.recommendation_type,
            imageUrl: firstItem?.image_url || null
          };
        });

        return { data: enrichedHistory, error: null };
      }

      return { data: history || [], error: null };
    } catch (error) {
      console.error('Error fetching recommendation history:', error);
      return { data: [], error };
    }
  }

  /**
   * Vérifie quels items ont été récemment recommandés
   */
  async checkRecentlyRecommended(userId, itemIds, days = 3) {
    try {
      if (!itemIds || itemIds.length === 0) return { data: [], error: null };

      const { data, error } = await supabase
        .rpc('check_recent_recommendations', {
          p_user_id: userId,
          p_item_ids: itemIds,
          p_days: days
        });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error checking recent recommendations:', error);
      return { data: [], error };
    }
  }

  /**
   * Obtient les statistiques de recommandations
   */
  async getRecommendationStats(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_recommendation_stats', {
          p_user_id: userId
        });

      if (error) throw error;
      
      // Parser le résultat
      const stats = data?.[0] || {
        total_recommendations: 0,
        total_worn: 0,
        wear_rate: 0,
        recommendations_by_type: {},
        most_recommended_items: []
      };

      return { 
        data: {
          total: stats.total_recommendations,
          worn: stats.total_worn,
          wornRate: stats.wear_rate,
          byType: stats.recommendations_by_type || {},
          mostRecommended: stats.most_recommended_items || []
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching recommendation stats:', error);
      return { data: null, error };
    }
  }

  /**
   * Trouve une recommandation récente par ID
   */
  async findRecommendationById(userId, recommendationId) {
    try {
      // D'abord essayer avec l'ID exact (cas des nouveaux IDs uniques)
      let { data, error } = await supabase
        .from('recommendation_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('recommendation_id', recommendationId)
        .order('recommended_at', { ascending: false })
        .limit(1)
        .single();

      // Si pas trouvé, essayer avec l'ID original (pour la compatibilité)
      if (!data || error?.code === 'PGRST116') {
        const result = await supabase
          .from('recommendation_tracking')
          .select('*')
          .eq('user_id', userId)
          .eq('original_recommendation_id', recommendationId)
          .order('recommended_at', { ascending: false })
          .limit(1)
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return { data, error: null };
    } catch (error) {
      console.error('Error finding recommendation:', error);
      return { data: null, error };
    }
  }
}

export const recommendationHistoryService = new RecommendationHistoryService();