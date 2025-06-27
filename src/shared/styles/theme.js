// Thème global de l'application
export const theme = {
  // Couleurs principales
  colors: {
    // Couleurs de base
    primary: '#6b5b95',      // Lilas principal
    primaryLight: '#b794f4', // Lilas clair pour les accents
    primaryDark: '#4a4458',  // Lilas foncé pour les textes
    
    // Couleurs de fond
    background: '#f5f3ff',   // Fond lilas très doux
    surface: '#fdfcff',      // Blanc légèrement teinté
    surfaceLight: 'rgba(255, 255, 255, 0.5)', // Surface semi-transparente
    
    // Couleurs de texte
    text: '#1a1a1a',         // Texte principal noir doux
    textSecondary: '#6b7280', // Texte secondaire gris
    textMuted: '#8b7aa8',    // Texte discret lilas
    
    // Couleurs d'accent
    accent: '#fbbf24',       // Jaune pour les favoris
    error: '#ef4444',        // Rouge pour les erreurs
    success: '#10b981',      // Vert pour le succès
    
    // Couleurs par catégorie
    categories: {
      tops: '#3b82f6',       // Bleu
      bottoms: '#8b5cf6',    // Violet
      dresses: '#ec4899',    // Rose
      outerwear: '#06b6d4',  // Cyan
      shoes: '#10b981',      // Vert
      accessories: '#f59e0b', // Orange
      outfits: '#6b5b95',    // Lilas (couleur principale)
    },
    
    // Bordures
    border: '#d8d0e8',       // Bordure lilas clair
    borderLight: 'rgba(139, 122, 168, 0.2)', // Bordure très légère
  },
  
  // Typographie
  typography: {
    // Tailles
    sizes: {
      xs: 11,
      sm: 13,
      base: 14,
      md: 15,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    
    // Polices
    fonts: {
      regular: 'Manrope-Regular',
      medium: 'Manrope-Medium',
      semiBold: 'Manrope-SemiBold',
    },
    
    // Espacement des lettres
    letterSpacing: {
      tight: -0.3,
      normal: -0.2,
      relaxed: -0.1,
    },
  },
  
  // Espacements
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  
  // Rayons de bordure
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  
  // Ombres
  shadows: {
    sm: {
      shadowColor: '#6b5b95',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#6b5b95',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#6b5b95',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    xl: {
      shadowColor: '#b794f4',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  
  // Styles de composants communs
  components: {
    // Header flottant
    floatingHeader: {
      paddingTop: 60,
      paddingBottom: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 0.5,
      borderBottomColor: 'rgba(139, 122, 168, 0.2)',
    },
    
    // Bouton principal
    primaryButton: {
      backgroundColor: '#6b5b95',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 25,
    },
    
    // Bouton secondaire
    secondaryButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderWidth: 1.5,
      borderColor: '#d8d0e8',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 25,
    },
    
    // Carte
    card: {
      backgroundColor: '#fdfcff',
      borderRadius: 16,
      shadowColor: '#6b5b95',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    
    // Input
    input: {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      borderWidth: 1.5,
      borderColor: '#d8d0e8',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 14,
      fontFamily: 'Manrope-Regular',
      color: '#1a1a1a',
    },
  },
};

// Helper pour obtenir les styles de texte
export const getTextStyle = (size = 'base', weight = 'regular') => ({
  fontSize: theme.typography.sizes[size] || theme.typography.sizes.base,
  fontFamily: theme.typography.fonts[weight] || theme.typography.fonts.regular,
  color: theme.colors.text,
});

// Helper pour les couleurs de catégorie
export const getCategoryColor = (category) => {
  const categoryMap = {
    'Hauts': theme.colors.categories.tops,
    'Bas': theme.colors.categories.bottoms,
    'Robes': theme.colors.categories.dresses,
    'Vestes': theme.colors.categories.outerwear,
    'Chaussures': theme.colors.categories.shoes,
    'Accessoires': theme.colors.categories.accessories,
    'Tenues complètes': theme.colors.categories.outfits,
  };
  return categoryMap[category] || theme.colors.primary;
};