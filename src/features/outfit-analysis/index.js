/**
 * Point d'entrée du module outfit-analysis
 * Exporte toutes les interfaces publiques du module
 */

// Composants
export { default as DailyRecommendation } from './components/DailyRecommendation';
export { default as CameraScreen } from './components/CameraScreen';
export { default as AnalysisResultScreen } from './components/AnalysisResultScreen';
export { default as RecommendationDetailScreen } from './components/RecommendationDetailScreen';
export { default as ClothingDetailView } from './components/ClothingDetailView';
export { default as AddItemTypeSelector } from './components/AddItemTypeSelector';
export { default as ClothingZoomView } from './components/ClothingZoomView';

// Hooks
export { useRecommendations } from './hooks/useRecommendations';
export { useOutfitAnalysis } from './hooks/useOutfitAnalysis';
export { useMood } from './hooks/useMood';
export { useWeather } from './hooks/useWeather';

// Services
export { dailyRecommendationService } from './services/dailyRecommendationService';
export { outfitAnalysisService } from './services/outfitAnalysisService';
export { recommendationHistoryService } from './services/recommendationHistoryService';

// Types (si spécifiques au module)
export * from './types';