// Polices Manrope
export const fonts = {
  regular: 'Manrope-Regular',
  medium: 'Manrope-Medium',
  semiBold: 'Manrope-SemiBold',
};

// Helper pour obtenir le fontFamily et fontWeight appropriés
export const getFontStyle = (type = 'regular') => {
  switch(type) {
    case 'regular':
      return { fontFamily: fonts.regular };
    case 'medium':
      return { fontFamily: fonts.medium };
    case 'semiBold':
      return { fontFamily: fonts.semiBold };
    default:
      return { fontFamily: fonts.regular };
  }
};