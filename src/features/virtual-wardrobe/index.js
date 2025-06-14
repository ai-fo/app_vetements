// Point d'entrée unique du module virtual-wardrobe
// Exporte toutes les interfaces publiques du module

// Composants
export { default as WardrobeScreen } from './components/WardrobeScreen';
export { default as ItemDetailsModal } from './components/ItemDetailsModal';
export { default as ItemEditor } from './components/ItemEditor';
export { default as FilterBar } from './components/FilterBar';
export { default as FavoriteButton } from './components/FavoriteButton';

// Hooks
export { useWardrobe } from './hooks/useWardrobe';

// API
export { wardrobeAPI } from './api';

// Types
export * from './types';