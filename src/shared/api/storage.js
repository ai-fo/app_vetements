import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

const WARDROBE_BUCKET = 'wardrobe';

/**
 * Service de gestion du stockage des images
 */
export const storageService = {
  /**
   * Upload une photo vers le bucket Supabase
   * @param {string} uri - URI de l'image (depuis expo-image-picker)
   * @param {string} fileName - Nom du fichier (optionnel)
   * @returns {Promise<{publicUrl: string, path: string}>}
   */
  async uploadPhoto(uri, fileName = null) {
    try {
      // Générer un nom de fichier unique si non fourni
      if (!fileName) {
        fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      }
      
      // Récupérer le blob de l'image
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Convertir le blob en base64
      const base64 = await blobToBase64(blob);
      
      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from(WARDROBE_BUCKET)
        .upload(fileName, decode(base64), {
          contentType: 'image/jpeg',
          upsert: false
        });
      
      if (error) {
        throw error;
      }
      
      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(WARDROBE_BUCKET)
        .getPublicUrl(data.path);
      
      return {
        publicUrl,
        path: data.path
      };
    } catch (error) {
      throw new Error(`Impossible d'uploader l'image: ${error.message}`);
    }
  },
  
  /**
   * Supprimer une photo du bucket
   * @param {string} path - Chemin du fichier dans le bucket
   */
  async deletePhoto(path) {
    try {
      if (!path) return;
      
      const { error } = await supabase.storage
        .from(WARDROBE_BUCKET)
        .remove([path]);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      throw new Error(`Impossible de supprimer l'image: ${error.message}`);
    }
  },
  
  /**
   * Lister les photos d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {object} options - Options de pagination et filtrage
   */
  async listUserPhotos(userId, options = {}) {
    try {
      const { limit = 100, offset = 0 } = options;
      
      const { data, error } = await supabase.storage
        .from(WARDROBE_BUCKET)
        .list(userId, {
          limit,
          offset,
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (error) {
        throw error;
      }
      
      // Retourner les URLs publiques
      return (data || []).map(file => ({
        name: file.name,
        path: `${userId}/${file.name}`,
        url: this.getPublicUrl(`${userId}/${file.name}`),
        createdAt: file.created_at,
        size: file.metadata?.size
      }));
    } catch (error) {
      throw new Error(`Impossible de récupérer les photos: ${error.message}`);
    }
  },
  
  /**
   * Obtenir l'URL publique d'une photo
   * @param {string} path - Chemin du fichier
   */
  getPublicUrl(path) {
    const { data } = supabase.storage
      .from(WARDROBE_BUCKET)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },
  
  /**
   * Vérifier si une image existe
   * @param {string} path - Chemin du fichier
   */
  async exists(path) {
    try {
      const { data, error } = await supabase.storage
        .from(WARDROBE_BUCKET)
        .download(path);
      
      return !error && data !== null;
    } catch {
      return false;
    }
  }
};

/**
 * Convertir un blob en base64
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}