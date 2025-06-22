export interface WeatherData {
  city: string;
  country: string;
  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    wind_speed: number;
    weather_code: number;
  };
  daily: {
    max_temp: number;
    min_temp: number;
    precipitation: number;
  };
}

export interface RecommendationPiece {
  type: string;
  description: string;
  why: string;
}

export interface OutfitRecommendation {
  name: string;
  description: string;
  pieces: RecommendationPiece[];
  style_tags: string[];
  comfort_level: string;
  weather_appropriateness: string;
  tips: string;
}

export interface WeatherRecommendations {
  weather_summary: string;
  recommendations: OutfitRecommendation[];
  general_tips: string[];
  weather_data: WeatherData;
  request_info: {
    city: string;
    occasion: string;
    style_preference: string;
  };
}