import { API_CONFIG } from '../config/api';

class OpenAIService {
  async analyzeOutfit(imageUri) {
    try {
      const formData = new FormData();
      
      // Pour React Native, on utilise directement l'URI
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'outfit.jpg',
      });

      const result = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE_OUTFIT}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`);
      }

      const data = await result.json();
      return { data, error: null };
    } catch (error) {
      console.error('OpenAI analyze outfit error:', error);
      return { data: null, error: error.message };
    }
  }

  async generateSuggestions(preferences) {
    try {
      const result = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_SUGGESTIONS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`);
      }

      const data = await result.json();
      return { data, error: null };
    } catch (error) {
      console.error('OpenAI generate suggestions error:', error);
      return { data: null, error: error.message };
    }
  }

  async matchOutfit(item, wardrobe) {
    try {
      const result = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MATCH_OUTFIT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ item, wardrobe }),
      });

      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`);
      }

      const data = await result.json();
      return { data, error: null };
    } catch (error) {
      console.error('OpenAI match outfit error:', error);
      return { data: null, error: error.message };
    }
  }
}

export const openaiService = new OpenAIService();