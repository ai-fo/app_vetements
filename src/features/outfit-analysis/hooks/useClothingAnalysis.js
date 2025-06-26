import { useState } from 'react';
import { clothingAnalysisAPI } from '../api/clothingAnalysisAPI';
import { outfitAnalysisAPI } from '../api';

export const useClothingAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState([]);

  const analyzeClothing = async (imageUri, userId, itemType = 'outfit') => {
    setLoading(true);
    try {
      // 1. Analyser avec la nouvelle structure
      const { data: analysisResult, error: analysisError } = await clothingAnalysisAPI.analyzeClothing(
        imageUri, 
        userId, 
        itemType
      );
      
      if (analysisError) throw new Error(analysisError);
      
      // 2. Sauvegarder dans la nouvelle base de données
      const { data: saveResult, error: saveError } = await clothingAnalysisAPI.saveAnalysis(
        userId,
        analysisResult,
        analysisResult.image_url
      );
      
      if (saveError) throw new Error(saveError);
      
      // 3. Transformer pour l'affichage dans l'interface actuelle
      const displayData = clothingAnalysisAPI.transformForDisplay(analysisResult);
      
      return {
        ...analysisResult,
        ...displayData,
        success: true,
        id: saveResult.piece_id || saveResult.look_id
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserPieces = async (userId, pieceType = null) => {
    setLoading(true);
    try {
      const { data, error } = await clothingAnalysisAPI.getUserPieces(userId, pieceType);
      
      if (error) throw new Error(error);
      
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserLooks = async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await clothingAnalysisAPI.getUserLooks(userId);
      
      if (error) throw new Error(error);
      
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Méthodes de compatibilité avec l'ancien système
  const getUserAnalyses = async (userId) => {
    return outfitAnalysisAPI.getUserAnalyses(userId);
  };

  const getAnalysisById = async (analysisId) => {
    return outfitAnalysisAPI.getAnalysis(analysisId);
  };

  const deleteAnalysis = async (analysisId) => {
    return outfitAnalysisAPI.deleteAnalysis(analysisId);
  };

  return {
    loading,
    analyses,
    analyzeClothing,
    analyzeOutfit: analyzeClothing, // Alias pour compatibilité
    getUserPieces,
    getUserLooks,
    getUserAnalyses,
    getAnalysisById,
    deleteAnalysis
  };
};