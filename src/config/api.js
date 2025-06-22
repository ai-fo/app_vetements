export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8045',
  ENDPOINTS: {
    ANALYZE_OUTFIT: '/analyze-outfit',
    GENERATE_SUGGESTIONS: '/generate-outfit-suggestions',
    MATCH_OUTFIT: '/match-outfit',
    DAILY_RECOMMENDATIONS: '/daily-recommendations',
  }
};