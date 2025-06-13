import { useState } from 'react';
import { supabase } from '../../../shared/api/supabase';
import { outfitAnalysisAPI } from '../api';

export const useOutfitAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState([]);

  const uploadImage = async (imageUri, userId) => {
    try {
      // Créer un nom de fichier unique
      const fileName = `${userId}/${Date.now()}.jpg`;
      
      // Convertir l'URI en blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('outfit-analyses')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('outfit-analyses')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const analyzeOutfit = async (imageUri, userId) => {
    setLoading(true);
    try {
      // 1. Upload l'image vers Supabase Storage
      const imageUrl = await uploadImage(imageUri, userId);

      // 2. Créer l'entrée dans la base de données
      const { data: analysis, error: dbError } = await supabase
        .from('outfit_analyses')
        .insert({
          user_id: userId,
          image_url: imageUrl,
          processing_status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Envoyer pour analyse au backend Python
      try {
        const result = await outfitAnalysisAPI.analyzeImage(analysis.id, imageUrl);
        
        // 4. Mettre à jour avec les résultats
        const { error: updateError } = await supabase
          .from('outfit_analyses')
          .update({
            ...result,
            processing_status: 'completed',
            analyzed_at: new Date().toISOString()
          })
          .eq('id', analysis.id);

        if (updateError) throw updateError;

        return { ...analysis, ...result };
      } catch (apiError) {
        // En cas d'erreur d'analyse, marquer comme échoué
        await supabase
          .from('outfit_analyses')
          .update({
            processing_status: 'failed',
            error_message: apiError.message
          })
          .eq('id', analysis.id);
        
        throw apiError;
      }
    } catch (error) {
      console.error('Analyze outfit error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserAnalyses = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('outfit_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAnalyses(data || []);
      return data;
    } catch (error) {
      console.error('Get analyses error:', error);
      throw error;
    }
  };

  const getAnalysisById = async (analysisId) => {
    try {
      const { data, error } = await supabase
        .from('outfit_analyses')
        .select('*')
        .eq('id', analysisId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Get analysis error:', error);
      throw error;
    }
  };

  const deleteAnalysis = async (analysisId) => {
    try {
      // Récupérer l'analyse pour avoir l'URL de l'image
      const { data: analysis, error: getError } = await supabase
        .from('outfit_analyses')
        .select('image_url, user_id')
        .eq('id', analysisId)
        .single();

      if (getError) throw getError;

      // Extraire le chemin du fichier depuis l'URL
      const urlParts = analysis.image_url.split('/');
      const filePath = `${analysis.user_id}/${urlParts[urlParts.length - 1]}`;

      // Supprimer l'image du storage
      const { error: storageError } = await supabase.storage
        .from('outfit-analyses')
        .remove([filePath]);

      if (storageError) console.error('Storage delete error:', storageError);

      // Supprimer l'entrée de la base de données
      const { error: dbError } = await supabase
        .from('outfit_analyses')
        .delete()
        .eq('id', analysisId);

      if (dbError) throw dbError;

      // Mettre à jour la liste locale
      setAnalyses(prev => prev.filter(a => a.id !== analysisId));
    } catch (error) {
      console.error('Delete analysis error:', error);
      throw error;
    }
  };

  return {
    loading,
    analyses,
    analyzeOutfit,
    getUserAnalyses,
    getAnalysisById,
    deleteAnalysis
  };
};