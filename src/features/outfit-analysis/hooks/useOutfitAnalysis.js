import { useState } from 'react';
import { outfitAnalysisAPI } from '../api';
import { ItemType } from '../../virtual-wardrobe/types';

export const useOutfitAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState([]);

  const analyzeOutfit = async (imageUri, userId, itemType = 'outfit') => {
    setLoading(true);
    try {
      // Utiliser l'API pour analyser l'image
      // L'upload sera géré par le backend
      const { data, error } = await outfitAnalysisAPI.analyzeImage(imageUri, userId, itemType);
      
      if (error) throw new Error(error);
      
      // Ajouter l'analyse à la liste
      setAnalyses(prev => [data, ...prev]);
      
      return data;
    } catch (error) {
      console.error('Analyze outfit error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserAnalyses = async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await outfitAnalysisAPI.getUserAnalyses(userId);
      
      if (error) throw new Error(error);
      
      setAnalyses(data || []);
      return data;
    } catch (error) {
      console.error('Get analyses error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisById = async (analysisId) => {
    try {
      const { data, error } = await outfitAnalysisAPI.getAnalysis(analysisId);
      
      if (error) throw new Error(error);
      
      return data;
    } catch (error) {
      console.error('Get analysis error:', error);
      throw error;
    }
  };

  const deleteAnalysis = async (analysisId) => {
    try {
      const { data, error } = await outfitAnalysisAPI.deleteAnalysis(analysisId);
      
      if (error) throw new Error(error);
      
      // Mettre à jour la liste locale
      setAnalyses(prev => prev.filter(a => a.id !== analysisId));
      
      return data;
    } catch (error) {
      console.error('Delete analysis error:', error);
      throw error;
    }
  };

  const addToWardrobe = async (analysisId, itemData) => {
    try {
      const { data, error } = await outfitAnalysisAPI.addToWardrobe(analysisId, itemData);
      
      if (error) throw new Error(error);
      
      return data;
    } catch (error) {
      console.error('Add to wardrobe error:', error);
      throw error;
    }
  };

  return {
    loading,
    analyses,
    analyzeOutfit,
    getUserAnalyses,
    getAnalysisById,
    deleteAnalysis,
    addToWardrobe
  };
};