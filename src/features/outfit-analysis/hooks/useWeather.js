import { useState, useEffect, useCallback } from 'react';
import weatherService from '../services/weatherService';

export const useWeather = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Charger la météo actuelle
  const loadWeather = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      if (forceRefresh) {
        setRefreshing(true);
      }

      const weatherData = await weatherService.getCurrentWeather(!forceRefresh);
      setWeather(weatherData);

      // Charger les prévisions en arrière-plan
      weatherService.getWeatherForecast(5).then(forecastData => {
        setForecast(forecastData);
      }).catch(err => {
        console.error('Erreur prévisions:', err);
      });

    } catch (err) {
      setError('Impossible de charger la météo');
      console.error('Erreur météo:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Rafraîchir la météo
  const refreshWeather = useCallback(async () => {
    await loadWeather(true);
  }, [loadWeather]);

  // Obtenir les recommandations vestimentaires
  const getRecommendations = useCallback(() => {
    if (!weather) return [];
    return weatherService.getClothingRecommendations(weather);
  }, [weather]);

  // Charger la météo au montage
  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  // Rafraîchir automatiquement toutes les 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadWeather();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadWeather]);

  return {
    weather,
    forecast,
    loading,
    error,
    refreshing,
    refreshWeather,
    getRecommendations,
  };
};