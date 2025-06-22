import { API_CONFIG } from '../config/api';

class DailyRecommendationService {
  async getDailyRecommendations(params) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DAILY_RECOMMENDATIONS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          city: params.city || 'Paris',
          country_code: params.countryCode || 'FR',
          wardrobe_items: params.wardrobeItems || [],
          user_needs: params.userNeeds || null,
          current_season: params.currentSeason || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Daily recommendation error:', error);
      return { data: null, error: error.message };
    }
  }
}

export const dailyRecommendationService = new DailyRecommendationService();