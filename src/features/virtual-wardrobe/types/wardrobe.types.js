/**
 * Types pour la garde-robe virtuelle
 */

// Types d'items
export const ItemType = {
  SINGLE_PIECE: 'SINGLE_PIECE',
  OUTFIT: 'OUTFIT'
};

// Catégories de vêtements
export const ClothingCategory = {
  TOP: 'top',
  BOTTOM: 'bottom',
  SHOES: 'shoes',
  DRESS: 'dress',
  OUTERWEAR: 'outerwear',
  ACCESSORY: 'accessory',
  FULL_OUTFIT: 'full_outfit'
};

// Saisons
export const Season = {
  SPRING: 'spring',
  SUMMER: 'summer',
  FALL: 'fall',
  WINTER: 'winter',
  ALL_SEASON: 'all_season'
};

// Structure d'un item de garde-robe
export const WardrobeItemShape = {
  id: '',
  userId: '',
  itemType: ItemType.SINGLE_PIECE,
  category: ClothingCategory.TOP,
  imageUrl: '',
  imagePath: '',
  colors: [],
  materials: [],
  seasons: [],
  brand: '',
  name: '',
  createdAt: '',
  updatedAt: '',
  tags: [],
  isFavorite: false,
  analysisData: null // Pour les outfits analysés
};

// Structure des filtres
export const WardrobeFiltersShape = {
  itemType: null,
  category: null,
  season: null,
  color: null,
  brand: null,
  isFavorite: false
};

// Structure de réponse API
export const APIResponseShape = {
  data: null,
  error: null
};

// Mapping des types DB vers frontend
export const DB_TO_FRONTEND_MAPPING = {
  // Colonnes clothing_items
  user_id: 'userId',
  image_url: 'imageUrl',
  image_path: 'imagePath',
  type: 'category',
  color: 'colors', // Transformé en array
  is_favorite: 'isFavorite',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
  
  // Colonnes outfit_analyses
  processing_status: 'processingStatus',
  thumbnail_url: 'thumbnailUrl',
  matching_suggestions: 'matchingSuggestions'
};

// Mapping des types frontend vers DB
export const FRONTEND_TO_DB_MAPPING = {
  userId: 'user_id',
  imageUrl: 'image_url',
  imagePath: 'image_path',
  category: 'type',
  colors: 'color', // Premier élément de l'array
  isFavorite: 'is_favorite',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};