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
- ❌ Analyse IA réelle (en attente backend)