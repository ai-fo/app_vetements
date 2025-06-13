# Outfit Analysis Module

Module d'analyse de tenue par IA pour l'application Vêtements.

## Fonctionnalités

- 📸 Capture photo ou sélection depuis la galerie
- 🤖 Analyse IA complète de la tenue
- 🎨 Détection des couleurs et palette
- 👔 Identification des vêtements
- 🌡️ Recommandations de température
- 💡 Suggestions d'amélioration
- 💾 Sauvegarde dans la base de données

## Structure
```
outfit-analysis/
├── components/          # Composants UI
│   ├── CameraScreen.js     # Écran de capture photo
│   └── AnalysisResultScreen.js # Écran de résultats
├── hooks/              # Hooks personnalisés
│   └── useOutfitAnalysis.js # Logique d'analyse
├── api.js             # API calls vers le backend
├── types.js           # Types et constantes
├── __tests__/         # Tests unitaires
└── index.js           # Exports du module
```

## Utilisation

```javascript
import { CameraScreen, useOutfitAnalysis } from '@/features/outfit-analysis';

// Dans un composant
const { analyzeOutfit, loading } = useOutfitAnalysis();

// Analyser une photo
const result = await analyzeOutfit(imageUri, userId);
```

## API Backend

### Endpoints
- `POST /api/outfit-analysis/analyze` - Analyser une image
- `GET /api/outfit-analysis/{id}/status` - Statut d'analyse
- `GET /api/outfit-analysis/{id}` - Détails complets

## Base de données

### Table `outfit_analyses`
Stocke toutes les analyses avec :
- Métadonnées de l'image
- Résultats de l'analyse IA
- Caractéristiques détectées
- Recommandations

### Bucket Storage `outfit-analyses`
Stockage des photos de tenues uploadées.

## Workflow

1. L'utilisateur prend une photo ou sélectionne depuis la galerie
2. L'image est uploadée vers Supabase Storage
3. Une entrée est créée dans la base avec statut "pending"
4. L'API backend analyse l'image avec l'IA
5. Les résultats sont sauvegardés et affichés
6. L'utilisateur peut sauvegarder dans sa garde-robe

## Permissions

- Caméra : Pour prendre des photos
- Galerie : Pour sélectionner des images existantes