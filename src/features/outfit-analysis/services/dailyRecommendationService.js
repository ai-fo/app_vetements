import { apiClient, API_ENDPOINTS } from '../../../shared/api/client';

class DailyRecommendationService {
  async getDailyRecommendations(params) {
    try {
      const response = await fetch(`${apiClient.baseURL}${API_ENDPOINTS.DAILY_RECOMMENDATIONS}`, {
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
          current_season: params.currentSeason || null,
          recently_worn_ids: params.recentlyWornIds || []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
}

export const dailyRecommendationService = new DailyRecommendationService();