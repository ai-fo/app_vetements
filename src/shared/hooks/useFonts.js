import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

export default function useLoadFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        // Vérifier si les fonts sont déjà chargées
        if (Font.isLoaded('Manrope-Regular')) {
          setFontsLoaded(true);
          return;
        }

        await Font.loadAsync({
          'Manrope-Regular': require('../../../assets/fonts/Manrope-Regular.ttf'),
          'Manrope-Medium': require('../../../assets/fonts/Manrope-Medium.ttf'),
          'Manrope-SemiBold': require('../../../assets/fonts/Manrope-SemiBold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Fonts loading failed, using system fonts:', error.message);
        // Fallback to system fonts if custom fonts fail to load
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  return fontsLoaded;
}