/**
 * Types spécifiques au module outfit-analysis
 */

// Types pour les analyses
export const AnalysisStatus = {
  IDLE: 'idle',
  ANALYZING: 'analyzing',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Types pour les recommandations
export const RecommendationType = {
  DAILY: 'daily',
  NEEDS_BASED: 'needs_based',
  WEATHER_BASED: 'weather_based'
};

// Interface pour les résultats d'analyse
export interface AnalysisResult {
  id: string;
  type: 'single_piece' | 'complete_look';
  data: any;
  timestamp: Date;
}

// Interface pour les recommandations
export interface Recommendation {
  id: string;
  type: RecommendationType;
  items: string[];
  reason: string;
  score?: number;
  weatherContext?: any;
  wasRecentlyRecommended?: boolean;
  lastRecommendedDays?: number;
}