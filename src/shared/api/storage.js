import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

const WARDROBE_BUCKET = 'wardrobe';

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
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
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
        publicUrl: publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      throw error;
    }
  },
  
  /**
   * Supprimer une photo du bucket
   * @param {string} path - Chemin du fichier dans le bucket
   */
  async deletePhoto(path) {
    try {
      const { error } = await supabase.storage
        .from(WARDROBE_BUCKET)
        .remove([path]);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  },
  
  /**
   * Lister les photos d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {string} category - Catégorie (optionnel)
   */
  async listUserPhotos(userId, category = null) {
    try {
      const path = category ? `${userId}/${category}` : userId;
      
      const { data, error } = await supabase.storage
        .from(WARDROBE_BUCKET)
        .list(path, {
          limit: 100,
          offset: 0
        });
      
      if (error) {
        throw error;
      }
      
      // Retourner les URLs publiques
      return data.map(file => ({
        name: file.name,
        path: `${path}/${file.name}`,
        url: supabase.storage.from(WARDROBE_BUCKET).getPublicUrl(`${path}/${file.name}`).data.publicUrl,
        createdAt: file.created_at,
        size: file.metadata?.size
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des photos:', error);
      throw error;
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
  }
};