// Types spécifiques au module outfit-analysis

export const AnalysisStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const ItemType = {
  OUTFIT: 'outfit',
  SINGLE_PIECE: 'single_piece',
};

export const ClothingPieceType = {
  HAUT: 'haut',
  BAS: 'bas',
  ROBE: 'robe',
  VESTE: 'veste',
  CHAUSSURES: 'chaussures',
  ACCESSOIRES: 'accessoires',
};

export const OutfitAnalysis = {
  id: 'string',
  userId: 'string',
  imageUrl: 'string',
  processingStatus: 'AnalysisStatus',
  analysis: {
    style: 'string',
    category: 'string',
    occasion: 'string[]',
    season: 'string[]',
    colors: {
      primary: 'string[]',
      secondary: 'string[]',
      accents: 'string[]',
    },
    pieces: 'ClothingPiece[]',
    recommendations: 'string[]',
    rating: 'number',
  },
  createdAt: 'string',
};

export const ClothingPiece = {
  type: 'ClothingPieceType',
  description: 'string',
};

export const DailyRecommendation = {
  style: 'string',
  pieces: 'string[]',
  occasion: 'string',
  weather: 'string',
};