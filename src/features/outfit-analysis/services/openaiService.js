import { apiClient, API_ENDPOINTS } from '../../../shared/api/client';

class OpenAIService {
  async analyzeOutfit(imageUri, itemType = 'outfit') {
    try {
      const formData = new FormData();
      
      // Pour React Native, on utilise directement l'URI
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'outfit.jpg',
      });

      // Ajouter le paramètre item_type pour l'analyse ciblée
      const url = new URL(`${apiClient.baseURL}${API_ENDPOINTS.ANALYZE_OUTFIT}`);
      if (itemType === 'clothing') {
        url.searchParams.append('item_type', 'clothing');
      }

      const result = await fetch(url.toString(), {
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
      return { data: null, error: error.message };
    }
  }

  async generateSuggestions(preferences) {
    try {
      const result = await fetch(`${apiClient.baseURL}${API_ENDPOINTS.GENERATE_SUGGESTIONS}`, {
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
      return { data: null, error: error.message };
    }
  }

  async matchOutfit(item, wardrobe) {
    try {
      const result = await fetch(`${apiClient.baseURL}${API_ENDPOINTS.MATCH_OUTFIT}`, {
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
      return { data: null, error: error.message };
    }
  }
}

export const openaiService = new OpenAIService();