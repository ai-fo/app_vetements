import { useState } from 'react';
import { weatherRecommendationService } from '../../../services/weatherRecommendationService';

export const useWeatherRecommendations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  const getRecommendations = async (params) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: serviceError } = await weatherRecommendationService.getRecommendations(params);
      
      if (serviceError) {
        setError(serviceError);
        return null;
      }
      
      setRecommendations(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearRecommendations = () => {
    setRecommendations(null);
    setError(null);
  };

  return {
    loading,
    error,
    recommendations,
    getRecommendations,
    clearRecommendations
  };
};