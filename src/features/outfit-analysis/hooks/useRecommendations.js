import { useState, useEffect } from 'react';
import { useWardrobe } from '../../virtual-wardrobe';
import { ItemType, ClothingCategory } from '../../virtual-wardrobe';
import { dailyRecommendationService } from '../services/dailyRecommendationService';
import { recommendationHistoryService } from '../services/recommendationHistoryService';
import * as Location from 'expo-location';

export const useRecommendations = (userId) => {
  const { items = [], loading: wardrobeLoading } = useWardrobe(userId);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('Paris');
  const [recentRecommendations, setRecentRecommendations] = useState([]);

  // Obtenir la saison actuelle
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };

  // Obtenir la localisation de l'utilisateur
  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return 'Paris'; // Valeur par défaut
      }

      let location = await Location.getCurrentPositionAsync({});
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const city = reverseGeocode[0].city || reverseGeocode[0].subregion || 'Paris';
        setCity(city);
        return city;
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
    return 'Paris';
  };

  // Charger les recommandations récentes depuis Supabase
  const loadRecentRecommendations = async () => {
    if (!userId) return [];
    
    const { data, error } = await recommendationHistoryService.getRecentRecommendations(userId, 3);
    if (!error && data) {
      setRecentRecommendations(data);
      return data;
    }
    return [];
  };

  // Générer des recommandations via l'API
  const generateRecommendations = async () => {
    setLoading(true);
    
    try {
      if (!items || items.length === 0) {
        setRecommendations([]);
        setWeather(null);
        return;
      }

      // Obtenir la ville de l'utilisateur
      const userCity = await getUserLocation();
      const currentSeason = getCurrentSeason();
      
      // Charger les recommandations récentes
      const recent = await loadRecentRecommendations();
      const recentIds = recent.flatMap(r => r.item_ids || []);
      
      // Préparer les données de la garde-robe enrichies pour l'API
      const wardrobeData = items.map(item => ({
        id: item.id,
        name: item.name || '',
        brand: item.brand || '',
        category: item.category || item.piece_type || '',
        itemType: item.itemType || (item.capture_type === 'complete_look' ? ItemType.OUTFIT : ItemType.SINGLE_PIECE),
        colors: item.colors || [],
        secondaryColors: item.secondaryColors || [],
        materials: item.materials || [],
        pattern: item.pattern || 'uni',
        fit: item.fit || 'regular',
        details: item.details || [],
        styleTags: item.styleTags || item.style_tags || [],
        occasionTags: item.occasionTags || item.occasion_tags || item.tags || [],
        seasons: item.seasons || item.seasonality || [],
        imageUrl: item.imageUrl || item.image_url,
        isFavorite: item.isFavorite || item.is_favorite || false,
        wearCount: item.wearCount || item.wear_count || 0,
        lastWorn: item.lastWorn || item.last_worn || null,
        // Nouvelles données de l'analyse
        silhouette: item.silhouette || null,
        layeringLevel: item.layeringLevel || item.layering_level || 1,
        patternMix: item.patternMix || item.pattern_mix || [],
        colorPalette: item.colorPalette || item.color_palette || null,
        weatherSuitable: item.weatherSuitable || item.weather_suitable || null,
        dominantStyle: item.dominantStyle || item.dominant_style || [],
        // Méta-données de l'analyse
        createdAt: item.createdAt || item.created_at,
        isLook: item.capture_type === 'complete_look' || !!item.pieces
      }));

      // Appeler l'API pour obtenir les recommandations
      console.log('Sending wardrobe data to API:', {
        itemCount: wardrobeData.length,
        recentlyRecommendedCount: recentIds.length,
        city: userCity,
        season: currentSeason
      });
      
      const { data, error } = await dailyRecommendationService.getDailyRecommendations({
        city: userCity,
        wardrobeItems: wardrobeData,
        currentSeason: currentSeason,
        recentlyRecommendedIds: recentIds, // Envoyer les IDs récents à l'API
        includeRecommendationHistory: true  // Demander à l'IA d'inclure l'info de récence
      });

      if (error) {
        console.error('API Error:', error);
        // Fallback basique si l'API ne répond pas
        setWeather({
          temp: 20,
          condition: 'nuageux',
          description: 'Partiellement nuageux',
          icon: 'partly-sunny',
          humidity: 50,
          wind: 10
        });
        
        // Retourner quelques items aléatoires
        const shuffled = [...items].sort(() => 0.5 - Math.random());
        const fallbackRecs = shuffled.slice(0, 3);
        setRecommendations(fallbackRecs);
        return;
      }

      if (data) {
        // Mettre à jour la météo
        setWeather(data.weather);
        
        // Traiter les recommandations de l'IA sans filtrage
        const processedRecommendations = [];
        
        for (const rec of data.recommendations) {
          if (rec.id.startsWith('combo-')) {
            // C'est une combinaison de pièces
            const comboString = rec.id.replace('combo-', '');
            const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
            const ids = comboString.match(uuidRegex) || [];
            
            const pieces = ids.map(id => items.find(item => item.id === id)).filter(Boolean);
            
            if (pieces.length > 0) {
              const recommendation = {
                id: rec.id,
                name: rec.name || 'Tenue recommandée',
                pieces: pieces,
                isMultiplePieces: true,
                reason: rec.reason,
                weatherAdaptation: rec.weather_adaptation,
                styleTips: rec.style_tips,
                // Nouvelle info de l'IA
                wasRecentlyRecommended: rec.was_recently_recommended || false,
                lastRecommendedDays: rec.last_recommended_days || null,
                weatherContext: data.weather
              };
              
              processedRecommendations.push(recommendation);
            }
          } else {
            // C'est un item unique ou une tenue complète
            const item = items.find(i => i.id === rec.id);
            if (item) {
              const recommendation = {
                ...item,
                reason: rec.reason,
                weatherAdaptation: rec.weather_adaptation,
                styleTips: rec.style_tips,
                // Nouvelle info de l'IA
                wasRecentlyRecommended: rec.was_recently_recommended || false,
                lastRecommendedDays: rec.last_recommended_days || null,
                weatherContext: data.weather
              };
              
              processedRecommendations.push(recommendation);
            }
          }
        }
        
        // Prendre toutes les recommandations de l'IA (pas de limite arbitraire)
        setRecommendations(processedRecommendations);
        
        // Tracker SEULEMENT la première recommandation affichée (pas toutes)
        if (userId && processedRecommendations.length > 0) {
          recommendationHistoryService.trackRecommendation(userId, processedRecommendations[0]);
        }
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendations([]);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Marquer une tenue comme portée
  const markAsWorn = async (recommendationId) => {
    if (!userId) return;
    
    // Trouver la recommandation par son recommendation_id
    const { data: rec } = await recommendationHistoryService.findRecommendationById(userId, recommendationId);
    
    if (rec) {
      await recommendationHistoryService.markAsWorn(rec.id);
    }
  };

  // Rafraîchir les recommandations
  const refreshRecommendations = async () => {
    await generateRecommendations();
  };

  // Générer des recommandations basées sur les besoins utilisateur
  const generateNeedsBasedRecommendation = async (userNeeds) => {
    setLoading(true);
    
    try {
      if (!items || items.length === 0) {
        setRecommendations([]);
        return null;
      }

      // Obtenir la ville de l'utilisateur
      const userCity = await getUserLocation();
      const currentSeason = getCurrentSeason();
      
      // Préparer les données enrichies de la garde-robe
      const wardrobeData = items.map(item => ({
        id: item.id,
        name: item.name || '',
        brand: item.brand || '',
        category: item.category || item.piece_type || '',
        itemType: item.itemType || (item.capture_type === 'complete_look' ? ItemType.OUTFIT : ItemType.SINGLE_PIECE),
        colors: item.colors || [],
        secondaryColors: item.secondaryColors || [],
        materials: item.materials || [],
        pattern: item.pattern || 'uni',
        fit: item.fit || 'regular',
        details: item.details || [],
        styleTags: item.styleTags || item.style_tags || [],
        occasionTags: item.occasionTags || item.occasion_tags || item.tags || [],
        seasons: item.seasons || item.seasonality || [],
        imageUrl: item.imageUrl || item.image_url,
        isFavorite: item.isFavorite || item.is_favorite || false,
        wearCount: item.wearCount || item.wear_count || 0,
        lastWorn: item.lastWorn || item.last_worn || null,
        silhouette: item.silhouette || null,
        layeringLevel: item.layeringLevel || item.layering_level || 1,
        patternMix: item.patternMix || item.pattern_mix || [],
        colorPalette: item.colorPalette || item.color_palette || null,
        weatherSuitable: item.weatherSuitable || item.weather_suitable || null,
        dominantStyle: item.dominantStyle || item.dominant_style || [],
        isLook: item.capture_type === 'complete_look' || !!item.pieces
      }));
      
      // Appeler l'API avec les besoins spécifiques
      const { data, error } = await dailyRecommendationService.getDailyRecommendations({
        city: userCity,
        wardrobeItems: wardrobeData,
        currentSeason: currentSeason,
        userNeeds: userNeeds,
        includeRecommendationHistory: true
      });

      if (error) {
        return null;
      }

      if (data && data.recommendations.length > 0) {
        // Mettre à jour la météo
        setWeather(data.weather);
        
        // Traiter la première recommandation
        const rec = data.recommendations[0];
        let bestRecommendation;
        
        if (rec.id.startsWith('combo-')) {
          // C'est une combinaison de pièces
          const comboString = rec.id.replace('combo-', '');
          const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
          const ids = comboString.match(uuidRegex) || [];
          const pieces = ids.map(id => items.find(item => item.id === id)).filter(Boolean);
          
          if (pieces.length > 0) {
            bestRecommendation = {
              id: rec.id,
              name: rec.name || 'Tenue recommandée pour vos besoins',
              pieces: pieces,
              isMultiplePieces: true,
              score: rec.score,
              reason: rec.reason,
              weatherAdaptation: rec.weather_adaptation,
              styleTips: rec.style_tips,
              userNeeds: userNeeds,
              wasRecentlyRecommended: rec.was_recently_recommended || false,
              lastRecommendedDays: rec.last_recommended_days || null,
              weatherContext: data.weather
            };
          }
        } else {
          // C'est un item unique
          const item = items.find(i => i.id === rec.id);
          if (item) {
            bestRecommendation = {
              ...item,
              score: rec.score,
              reason: rec.reason,
              weatherAdaptation: rec.weather_adaptation,
              styleTips: rec.style_tips,
              userNeeds: userNeeds,
              wasRecentlyRecommended: rec.was_recently_recommended || false,
              lastRecommendedDays: rec.last_recommended_days || null,
              weatherContext: data.weather
            };
          }
        }
        
        if (bestRecommendation) {
          setRecommendations([bestRecommendation]);
          
          // Tracker la recommandation
          if (userId) {
            recommendationHistoryService.trackRecommendation(userId, bestRecommendation);
          }
          
          return bestRecommendation;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error generating needs-based recommendation:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les statistiques de recommandations
  const getRecommendationStats = async () => {
    if (!userId) return null;
    
    const { data, error } = await recommendationHistoryService.getRecommendationStats(userId);
    return data;
  };

  useEffect(() => {
    if (!wardrobeLoading && items && items.length > 0 && userId) {
      generateRecommendations();
    }
  }, [wardrobeLoading, userId]);

  return {
    recommendations,
    weather,
    loading: loading || wardrobeLoading,
    markAsWorn,
    refreshRecommendations,
    generateNeedsBasedRecommendation,
    getRecommendationStats,
    recentRecommendations
  };
};