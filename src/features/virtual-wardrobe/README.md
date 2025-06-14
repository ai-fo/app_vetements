# Module Virtual Wardrobe

## Description
Module de gestion de la garde-robe virtuelle. Permet de visualiser, organiser et g�rer sa collection de v�tements.

## Interface publique

### Composants
- `WardrobeScreen` - �cran principal de la garde-robe
- `ItemDetailsModal` - Modal de d�tails d'un item
- `ItemEditor` - �diteur d'item
- `FilterBar` - Barre de filtres
- `FavoriteButton` - Bouton favori

### Hooks
- `useWardrobe(userId)` - Hook principal pour la gestion de la garde-robe

### API
- `wardrobeAPI.getItems(userId, filters)` - R�cup�rer les items
- `wardrobeAPI.createItem(itemData)` - Cr�er un item
- `wardrobeAPI.updateItem(itemId, updates)` - Mettre � jour un item
- `wardrobeAPI.deleteItem(itemId)` - Supprimer un item
- `wardrobeAPI.getOutfitSuggestions(userId, occasion, weather)` - Suggestions de tenues
- `wardrobeAPI.findSimilarItems(itemId)` - Items similaires
- `wardrobeAPI.getWardrobeStats(userId)` - Statistiques

### Types
- `ItemType` - OUTFIT | SINGLE_PIECE
- `ClothingCategory` - Cat�gories de v�tements
- `Season` - Saisons
- `Material` - Mati�res

## Utilisation

```javascript
import { useWardrobe, WardrobeScreen } from '@/features/virtual-wardrobe';

function MyComponent() {
  const { items, updateItem, deleteItem, toggleFavorite } = useWardrobe(userId);
  
  return <WardrobeScreen />;
}
```

## �tat actuel
-  Visualisation en liste
-  Filtres et recherche
-  Favoris
-  �dition d'items
-  Suppression avec confirmation
- L Suggestions IA (mock�es)