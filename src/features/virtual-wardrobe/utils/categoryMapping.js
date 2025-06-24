/**
 * Utilitaire pour mapper les catégories détaillées vers les catégories principales
 */

// Mapping des catégories détaillées vers les catégories principales
export const DETAILED_TO_MAIN_CATEGORY = {
  // Hauts
  'tshirt': 'top',
  'shirt': 'top',
  'sweater': 'top',
  'pullover': 'top',
  
  // Bas
  'pants': 'bottom',
  'jeans': 'bottom',
  'shorts': 'bottom',
  'skirt': 'bottom',
  
  // Vêtements extérieurs
  'jacket': 'outerwear',
  'coat': 'outerwear',
  
  // Déjà des catégories principales
  'top': 'top',
  'bottom': 'bottom',
  'outerwear': 'outerwear',
  'dress': 'dress',
  'shoes': 'shoes',
  'accessory': 'accessory',
  'full_outfit': 'full_outfit'
};

// Labels français pour l'affichage
export const CATEGORY_LABELS = {
  // Catégories détaillées
  'tshirt': 'T-shirt',
  'shirt': 'Chemise',
  'sweater': 'Pull',
  'pullover': 'Pull-over',
  'pants': 'Pantalon',
  'jeans': 'Jean',
  'shorts': 'Short',
  'skirt': 'Jupe',
  'jacket': 'Veste',
  'coat': 'Manteau',
  
  // Catégories principales
  'top': 'Haut',
  'bottom': 'Bas',
  'outerwear': 'Vêtement extérieur',
  'dress': 'Robe',
  'shoes': 'Chaussures',
  'accessory': 'Accessoire',
  'full_outfit': 'Tenue complète'
};

/**
 * Obtient la catégorie principale pour une catégorie détaillée
 */
export const getMainCategory = (detailedCategory) => {
  return DETAILED_TO_MAIN_CATEGORY[detailedCategory] || detailedCategory;
};

/**
 * Obtient le label français pour une catégorie
 */
export const getCategoryLabel = (category) => {
  return CATEGORY_LABELS[category] || category;
};

/**
 * Obtient toutes les catégories détaillées pour une catégorie principale
 */
export const getDetailedCategories = (mainCategory) => {
  return Object.entries(DETAILED_TO_MAIN_CATEGORY)
    .filter(([_, main]) => main === mainCategory)
    .map(([detailed, _]) => detailed);
};