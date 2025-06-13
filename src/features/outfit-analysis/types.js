// Types pour l'analyse de tenue

export const OutfitAnalysis = {
  id: '',
  userId: '',
  imageUrl: '',
  thumbnailUrl: '',
  
  // Analyse IA
  colors: {
    primary: [],      // Couleurs principales
    secondary: [],    // Couleurs secondaires
    accent: []        // Couleurs d'accent
  },
  
  // Caractéristiques
  category: '',         // Type général (casual, formal, sport, etc.)
  style: '',           // Style (moderne, classique, streetwear, etc.)
  
  // Vêtements détectés
  items: [
    {
      type: '',        // t-shirt, pantalon, chaussures, etc.
      color: '',
      brand: '',       // Si détectable
      material: '',    // Si détectable
      pattern: ''      // uni, rayé, à motifs, etc.
    }
  ],
  
  // Contexte d'utilisation
  occasions: [],       // travail, soirée, sport, décontracté, etc.
  seasons: [],        // été, hiver, mi-saison, toutes saisons
  weather: {
    temperature: {
      min: 0,         // Température minimale recommandée
      max: 0          // Température maximale recommandée
    },
    conditions: []    // ensoleillé, pluvieux, neigeux, etc.
  },
  
  // Évaluation
  comfort: {
    rating: 0,        // Note de 1 à 10
    notes: ''         // Notes sur le confort
  },
  
  formality: 0,       // Niveau de formalité de 1 à 10
  versatility: 0,     // Polyvalence de 1 à 10
  
  // Matériaux et entretien
  materials: [],      // coton, polyester, laine, etc.
  careInstructions: [],  // lavage machine, nettoyage à sec, etc.
  
  // Recommandations
  matchingSuggestions: [], // Suggestions d'association
  improvements: [],        // Améliorations possibles
  
  // Métadonnées
  analysisConfidence: 0,   // Confiance de l'analyse (0-100)
  processingStatus: '',    // pending, processing, completed, failed
  errorMessage: '',
  
  // Timestamps
  createdAt: '',
  updatedAt: '',
  analyzedAt: ''
};

export const ProcessingStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const OccasionTypes = [
  'travail',
  'soirée',
  'sport',
  'décontracté',
  'formel',
  'weekend',
  'plage',
  'rendez-vous'
];

export const SeasonTypes = [
  'printemps',
  'été',
  'automne',
  'hiver',
  'mi-saison',
  'toutes-saisons'
];

export const StyleTypes = [
  'casual',
  'formel',
  'streetwear',
  'classique',
  'sportif',
  'bohème',
  'minimaliste',
  'vintage'
];