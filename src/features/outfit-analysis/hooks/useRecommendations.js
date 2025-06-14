import { useState, useEffect } from 'react';
import { useWardrobe } from '../../virtual-wardrobe/hooks/useWardrobe';
import { ItemType } from '../../virtual-wardrobe/types';

export const useRecommendations = (userId) => {
  const { items, loading: wardrobeLoading } = useWardrobe(userId);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [preferenceHistory, setPreferenceHistory] = useState([]);

  // Obtenir la saison actuelle
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };

  // Simuler l'obtention de données météo
  const fetchWeatherData = async () => {
    // TODO: Activer quand le backend est prêt
    // const weatherData = await weatherAPI.getCurrentWeather();
    
    const conditions = [
      { temp: 25, condition: 'ensoleillé', description: 'Ciel dégagé', icon: 'sunny' },
      { temp: 20, condition: 'nuageux', description: 'Partiellement nuageux', icon: 'partly-sunny' },
      { temp: 15, condition: 'pluvieux', description: 'Pluie légère', icon: 'rainy' },
      { temp: 10, condition: 'froid', description: 'Temps frais', icon: 'cloud' },
      { temp: 5, condition: 'neigeux', description: 'Neige légère', icon: 'snow' },
    ];
    
    const randomWeather = conditions[Math.floor(Math.random() * conditions.length)];
    return {
      ...randomWeather,
      humidity: Math.floor(Math.random() * 40) + 40,
      wind: Math.floor(Math.random() * 20) + 5,
      sunrise: '06:30',
      sunset: '19:45',
    };
  };

  // Calculer un score de pertinence pour chaque vêtement
  const calculateRelevanceScore = (item, weatherData, currentSeason) => {
    let score = 0;
    
    // Score basé sur la saison
    if (item.seasons?.includes(currentSeason) || item.seasons?.includes('all_season')) {
      score += 30;
    }
    
    // Score basé sur les favoris
    if (item.isFavorite) {
      score += 20;
    }
    
    // Score basé sur la météo
    if (weatherData) {
      if (weatherData.temp > 20 && item.category?.toLowerCase().includes('léger')) {
        score += 15;
      }
      if (weatherData.temp < 15 && item.category?.toLowerCase().includes('chaud')) {
        score += 15;
      }
      if (weatherData.condition === 'pluvieux' && item.category?.toLowerCase().includes('imperméable')) {
        score += 25;
      }
    }
    
    // Score basé sur la variété (éviter de recommander toujours les mêmes)
    if (!preferenceHistory.includes(item.id)) {
      score += 10;
    }
    
    // Score aléatoire pour la diversité
    score += Math.random() * 10;
    
    return score;
  };

  // Générer des recommandations intelligentes
  const generateRecommendations = async () => {
    setLoading(true);
    
    try {
      const weatherData = await fetchWeatherData();
      setWeather(weatherData);
      
      if (!items || items.length === 0) {
        setRecommendations([]);
        return;
      }
      
      const currentSeason = getCurrentSeason();
      
      // Calculer les scores pour tous les items
      const scoredItems = items.map(item => ({
        ...item,
        score: calculateRelevanceScore(item, weatherData, currentSeason)
      }));
      
      // Trier par score décroissant
      scoredItems.sort((a, b) => b.score - a.score);
      
      // Prendre les meilleures recommandations
      const maxRecommendations = 5;
      const topRecommendations = [];
      
      // D'abord les tenues complètes
      const outfits = scoredItems.filter(item => item.itemType === ItemType.OUTFIT);
      topRecommendations.push(...outfits.slice(0, 3));
      
      // Ensuite les items individuels si nécessaire
      if (topRecommendations.length < maxRecommendations) {
        const individualItems = scoredItems.filter(item => item.itemType !== ItemType.OUTFIT);
        topRecommendations.push(
          ...individualItems.slice(0, maxRecommendations - topRecommendations.length)
        );
      }
      
      setRecommendations(topRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // Marquer une tenue comme portée
  const markAsWorn = (itemId) => {
    setPreferenceHistory(prev => [...prev, itemId].slice(-10)); // Garder les 10 derniers
    // TODO: Sauvegarder dans le backend quand prêt
  };

  // Rafraîchir les recommandations
  const refreshRecommendations = () => {
    generateRecommendations();
  };

  useEffect(() => {
    if (!wardrobeLoading) {
      generateRecommendations();
    }
  }, [items, wardrobeLoading]);

  return {
    recommendations,
    weather,
    loading: loading || wardrobeLoading,
    markAsWorn,
    refreshRecommendations,
  };
};