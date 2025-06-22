import { useState, useEffect } from 'react';
import { useWardrobe } from '../../virtual-wardrobe/hooks/useWardrobe';
import { ItemType } from '../../virtual-wardrobe/types';
import { dailyRecommendationService } from '../../../services/dailyRecommendationService';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useRecommendations = (userId) => {
  const { items = [], loading: wardrobeLoading } = useWardrobe(userId);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('Paris');
  const [preferenceHistory, setPreferenceHistory] = useState([]);

  // Charger l'historique des vêtements portés
  const loadWearHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(`wear_history_${userId}`);
      if (history) {
        const parsed = JSON.parse(history);
        // Garder seulement les 30 derniers jours
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const recentHistory = parsed.filter(item => item.timestamp > thirtyDaysAgo);
        setPreferenceHistory(recentHistory);
        return recentHistory;
      }
    } catch (error) {
      console.error('Error loading wear history:', error);
    }
    return [];
  };

  // Sauvegarder l'historique
  const saveWearHistory = async (newHistory) => {
    try {
      await AsyncStorage.setItem(`wear_history_${userId}`, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving wear history:', error);
    }
  };

  // Obtenir les IDs récemment portés (derniers 7 jours)
  const getRecentlyWornIds = (history) => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return history
      .filter(item => item.timestamp > sevenDaysAgo)
      .map(item => item.itemId);
  };

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
      
      // Charger l'historique et obtenir les IDs récemment portés
      const history = await loadWearHistory();
      const recentlyWornIds = getRecentlyWornIds(history);
      
      console.log('Recently worn IDs:', recentlyWornIds);
      console.log('Total wardrobe items:', items.length);
      
      // Préparer les données de la garde-robe pour l'API
      const wardrobeData = items.map(item => ({
        id: item.id,
        name: item.name || '',
        brand: item.brand || '',
        category: item.category || '',
        itemType: item.itemType,
        colors: item.colors || [],
        materials: item.materials || [],
        seasons: item.seasons || [],
        tags: item.tags || [],
        imageUrl: item.imageUrl,
        isFavorite: item.isFavorite || false,
        style: item.style || '',
        description: item.description || ''
      }));

      // Appeler l'API pour obtenir les recommandations
      const { data, error } = await dailyRecommendationService.getDailyRecommendations({
        city: userCity,
        wardrobeItems: wardrobeData,
        currentSeason: currentSeason,
        recentlyWornIds: recentlyWornIds
      });

      if (error) {
        console.error('API Error:', error);
        // Fallback sur des recommandations basiques
        setWeather({
          temp: 20,
          condition: 'nuageux',
          description: 'Partiellement nuageux',
          icon: 'partly-sunny',
          humidity: 50,
          wind: 10
        });
        
        // Recommander les 3 premiers items
        const basicRecs = items.slice(0, 3);
        setRecommendations(basicRecs);
        return;
      }

      if (data) {
        // Mettre à jour la météo
        setWeather(data.weather);
        
        // Traiter les recommandations
        const processedRecommendations = [];
        
        for (const rec of data.recommendations) {
          if (rec.id.startsWith('combo-')) {
            // C'est une combinaison de pièces
            const ids = rec.id.replace('combo-', '').split('-');
            const pieces = ids.map(id => items.find(item => item.id === id)).filter(Boolean);
            
            if (pieces.length > 0) {
              processedRecommendations.push({
                id: rec.id,
                name: 'Ensemble recommandé',
                pieces: pieces,
                isMultiplePieces: true,
                score: rec.score,
                reason: rec.reason,
                weatherAdaptation: rec.weather_adaptation,
                styleTips: rec.style_tips
              });
            }
          } else {
            // C'est un item unique
            const item = items.find(i => i.id === rec.id);
            if (item) {
              processedRecommendations.push({
                ...item,
                score: rec.score,
                reason: rec.reason,
                weatherAdaptation: rec.weather_adaptation,
                styleTips: rec.style_tips
              });
            }
          }
        }
        
        setRecommendations(processedRecommendations);
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
  const markAsWorn = async (itemId) => {
    console.log('Marking as worn:', itemId);
    
    const newHistoryItem = {
      itemId: itemId,
      timestamp: Date.now()
    };
    
    let updatedHistory = [...preferenceHistory, newHistoryItem];
    
    // Si c'est une combinaison, marquer aussi les pièces individuelles
    if (itemId.startsWith('combo-')) {
      const ids = itemId.replace('combo-', '').split('-');
      for (const id of ids) {
        const pieceHistoryItem = {
          itemId: id,
          timestamp: Date.now()
        };
        updatedHistory.push(pieceHistoryItem);
        console.log('Also marking piece as worn:', id);
      }
    }
    
    // Nettoyer l'historique - garder seulement les 30 derniers jours
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    updatedHistory = updatedHistory.filter(item => item.timestamp > thirtyDaysAgo);
    
    setPreferenceHistory(updatedHistory);
    
    // Sauvegarder dans AsyncStorage
    await saveWearHistory(updatedHistory);
    
    console.log('Wear history updated, total items:', updatedHistory.length);
    console.log('Recently worn IDs:', getRecentlyWornIds(updatedHistory));
  };

  // Rafraîchir les recommandations
  const refreshRecommendations = () => {
    generateRecommendations();
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
      
      // Préparer les données de la garde-robe pour l'API
      const wardrobeData = items.map(item => ({
        id: item.id,
        name: item.name || '',
        brand: item.brand || '',
        category: item.category || '',
        itemType: item.itemType,
        colors: item.colors || [],
        materials: item.materials || [],
        seasons: item.seasons || [],
        tags: item.tags || [],
        imageUrl: item.imageUrl,
        isFavorite: item.isFavorite || false,
        style: item.style || '',
        description: item.description || ''
      }));

      // Charger l'historique et obtenir les IDs récemment portés
      const history = await loadWearHistory();
      const recentlyWornIds = getRecentlyWornIds(history);
      
      // Appeler l'API avec les besoins spécifiques
      const { data, error } = await dailyRecommendationService.getDailyRecommendations({
        city: userCity,
        wardrobeItems: wardrobeData,
        currentSeason: currentSeason,
        userNeeds: userNeeds,
        recentlyWornIds: recentlyWornIds
      });

      if (error) {
        console.error('API Error:', error);
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
          const ids = rec.id.replace('combo-', '').split('-');
          const pieces = ids.map(id => items.find(item => item.id === id)).filter(Boolean);
          
          if (pieces.length > 0) {
            bestRecommendation = {
              id: rec.id,
              name: 'Tenue recommandée pour vos besoins',
              pieces: pieces,
              isMultiplePieces: true,
              score: rec.score,
              reason: rec.reason,
              weatherAdaptation: rec.weather_adaptation,
              styleTips: rec.style_tips,
              userNeeds: userNeeds
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
              userNeeds: userNeeds
            };
          }
        }
        
        if (bestRecommendation) {
          setRecommendations([bestRecommendation]);
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

  useEffect(() => {
    if (!wardrobeLoading && items && items.length > 0) {
      generateRecommendations();
    }
  }, [wardrobeLoading]);

  // Charger l'historique au démarrage
  useEffect(() => {
    if (userId) {
      loadWearHistory();
    }
  }, [userId]);

  return {
    recommendations,
    weather,
    loading: loading || wardrobeLoading,
    markAsWorn,
    refreshRecommendations,
    generateNeedsBasedRecommendation,
  };
};