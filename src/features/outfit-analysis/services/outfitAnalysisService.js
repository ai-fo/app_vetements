import { apiClient, API_ENDPOINTS } from '../../../shared/api/client';
import { supabase } from '../../../shared/api/supabase';

class OutfitAnalysisService {
  async analyzeImage(imageUri, itemType = 'clothing') {
    try {
      const formData = new FormData();
      
      // Créer un blob depuis l'URI de l'image
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      formData.append('file', {
        uri: imageUri,
        type: blob.type || 'image/jpeg',
        name: 'photo.jpg'
      });
      
      if (itemType) {
        formData.append('item_type', itemType);
      }

      const result = await fetch(`${apiClient.baseURL}${API_ENDPOINTS.ANALYZE_OUTFIT}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.detail || `HTTP error! status: ${result.status}`);
      }

      const data = await result.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error analyzing outfit:', error);
      return { data: null, error: error.message };
    }
  }

  async saveAnalysis(userId, analysisResult, imageUrl) {
    try {
      const response = await fetch(`${apiClient.baseURL}${API_ENDPOINTS.SAVE_CLOTHING}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          analysis_result: analysisResult,
          image_urls: imageUrl ? [imageUrl] : []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error saving analysis:', error);
      return { data: null, error: error.message };
    }
  }

  async uploadImage(userId, imageUri) {
    try {
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const { data, error } = await supabase.storage
        .from('wardrobe')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('wardrobe')
        .getPublicUrl(fileName);

      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { url: null, error: error.message };
    }
  }
}

export const outfitAnalysisService = new OutfitAnalysisService();