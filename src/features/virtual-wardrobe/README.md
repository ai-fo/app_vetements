# Module Virtual Wardrobe

## Description
Module de gestion de la garde-robe virtuelle. Permet de visualiser, organiser et gérer sa collection de vêtements.

## Interface publique

### Composants
- `WardrobeScreen` - Écran principal de la garde-robe
- `ItemDetailsModal` - Modal de détails d'un item
- `ItemEditor` - Éditeur d'item
- `FilterBar` - Barre de filtres
- `FavoriteButton` - Bouton favori

### Hooks
- `useWardrobe(userId)` - Hook principal pour la gestion de la garde-robe

### API
- `wardrobeAPI.getItems(userId, filters)` - Récupérer les items
- `wardrobeAPI.createItem(itemData)` - Créer un item
- `wardrobeAPI.updateItem(itemId, updates)` - Mettre à jour un item
- `wardrobeAPI.deleteItem(itemId)` - Supprimer un item
- `wardrobeAPI.getOutfitSuggestions(userId, occasion, weather)` - Suggestions de tenues
- `wardrobeAPI.findSimilarItems(itemId)` - Items similaires
- `wardrobeAPI.getWardrobeStats(userId)` - Statistiques

### Types
- `ItemType` - OUTFIT | SINGLE_PIECE
- `ClothingCategory` - Catégories de vêtements
- `Season` - Saisons
- `Material` - Matières

## Utilisation

```javascript
import { useWardrobe, WardrobeScreen } from '@/features/virtual-wardrobe';

function MyComponent() {
  const { items, updateItem, deleteItem, toggleFavorite } = useWardrobe(userId);
  
  return <WardrobeScreen />;
}
```

## État actuel
-  Visualisation en liste
-  Filtres et recherche
-  Favoris
-  Édition d'items
-  Suppression avec confirmation
- L Suggestions IA (mockées)