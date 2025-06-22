import { API_CONFIG } from '../config/api';

class WeatherRecommendationService {
  async getRecommendations(params) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WEATHER_RECOMMENDATIONS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          city: params.city,
          country_code: params.countryCode || 'FR',
          wardrobe_items: params.wardrobeItems || [],
          occasion: params.occasion || 'quotidien',
          style_preference: params.stylePreference || 'casual'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Weather recommendation error:', error);
      return { data: null, error: error.message };
    }
  }
}

export const weatherRecommendationService = new WeatherRecommendationService();