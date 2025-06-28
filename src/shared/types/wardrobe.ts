/**
 * Types partagés pour la garde-robe
 * Ces types sont utilisés par plusieurs modules
 */

export enum ItemType {
  SINGLE_PIECE = 'SINGLE_PIECE',
  OUTFIT = 'OUTFIT'
}

export enum ClothingCategory {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  DRESS = 'DRESS',
  OUTERWEAR = 'OUTERWEAR',
  SHOES = 'SHOES',
  ACCESSORIES = 'ACCESSORIES'
}

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  itemType: ItemType;
  imageUrl: string;
  colors?: string[];
  secondaryColors?: string[];
  materials?: string[];
  pattern?: string;
  fit?: string;
  details?: string[];
  styleTags?: string[];
  occasionTags?: string[];
  seasons?: string[];
  isFavorite?: boolean;
  wearCount?: number;
  lastWorn?: Date | null;
  brand?: string;
  piece_type?: string;
  capture_type?: string;
  image_url?: string;
  is_favorite?: boolean;
  wear_count?: number;
  last_worn?: Date | null;
  style_tags?: string[];
  occasion_tags?: string[];
  // Nouvelles propriétés de l'analyse enrichie
  silhouette?: string;
  layeringLevel?: number;
  layering_level?: number;
  patternMix?: string[];
  pattern_mix?: string[];
  colorPalette?: string;
  color_palette?: string;
  weatherSuitable?: string[];
  weather_suitable?: string[];
  dominantStyle?: string[];
  dominant_style?: string[];
  created_at?: string;
  pieces?: ClothingItem[];
}

export interface WardrobeState {
  items: ClothingItem[];
  loading: boolean;
  error: string | null;
}

export interface UseWardrobeReturn extends WardrobeState {
  addItem: (item: ClothingItem) => Promise<void>;
  updateItem: (id: string, updates: Partial<ClothingItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  loadWardrobe: () => Promise<void>;
}