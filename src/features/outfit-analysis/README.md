# Module Outfit Analysis

## Description
Module d'analyse IA des tenues vestimentaires. Permet de capturer des photos, analyser le style et obtenir des recommandations.

## Interface publique

### Composants
- `CameraScreen` - Écran de capture photo
- `AnalysisResultScreen` - Affichage des résultats d'analyse
- `AddItemTypeSelector` - Sélecteur de type d'item
- `ClothingItemForm` - Formulaire d'ajout de vêtement
- `DailyRecommendation` - Widget de recommandation quotidienne

### Hooks
- `useOutfitAnalysis()` - Hook principal pour la gestion des analyses
- `useWeather()` - Hook pour obtenir la météo en temps réel avec géolocalisation
- `useRecommendations()` - Hook pour les recommandations de tenues
- `useMood()` - Hook pour la gestion de l'humeur

### API
- `outfitAnalysisAPI.analyzeImage(imageUri, userId)` - Analyser une photo
- `outfitAnalysisAPI.getUserAnalyses(userId)` - Récupérer les analyses
- `outfitAnalysisAPI.getAnalysis(analysisId)` - Détail d'une analyse
- `outfitAnalysisAPI.deleteAnalysis(analysisId)` - Supprimer une analyse
- `outfitAnalysisAPI.addToWardrobe(analysisId, itemData)` - Ajouter à la garde-robe
- `outfitAnalysisAPI.getRecommendations(userId)` - Obtenir des recommandations

## Utilisation

```javascript
import { useOutfitAnalysis, CameraScreen } from '@/features/outfit-analysis';

function MyComponent() {
  const { analyzeOutfit, analyses, loading } = useOutfitAnalysis();
  
  const handleCapture = async (imageUri) => {
    const result = await analyzeOutfit(imageUri, userId);
    // ...
  };
}
```

## État actuel
- ✅ Capture photo
- ✅ Analyse IA (mockée)
- ✅ Recommandations (mockées)
- ✅ Ajout à la garde-robe
- ✅ Météo en temps réel avec géolocalisation
- ✅ Widget météo interactif avec gestion d'erreurs
- ❌ Analyse IA réelle (en attente backend)

## Service Météo

### Configuration
Ajouter dans le fichier `.env` :
```
EXPO_PUBLIC_WEATHER_API_KEY=votre-clé-api-openweathermap
```

Pour obtenir une clé API gratuite : https://openweathermap.org/api

### Fonctionnalités
- Géolocalisation automatique
- Cache de 30 minutes pour économiser les appels API
- Fallback sur Paris si la géolocalisation échoue
- Données mockées si pas de clé API configurée
- Rafraîchissement manuel par tap sur le widget

### Utilisation du hook météo
```javascript
import { useWeather } from '@/features/outfit-analysis';

function MyComponent() {
  const { 
    weather,           // Données météo actuelles
    forecast,          // Prévisions sur 5 jours
    loading,           // État de chargement
    error,             // Erreur éventuelle
    refreshing,        // Rafraîchissement en cours
    refreshWeather,    // Fonction pour rafraîchir
    getRecommendations // Recommandations vestimentaires
  } = useWeather();
  
  // weather contient:
  // - temp: température en °C
  // - condition: 'ensoleillé', 'nuageux', 'pluvieux', etc.
  // - description: description détaillée
  // - icon: nom de l'icône Ionicons
  // - humidity: humidité en %
  // - wind: vitesse du vent en km/h
  // - city: nom de la ville
  // - feels_like: température ressentie
  // - temp_min/temp_max: températures min/max
}
```