# Module Quick Gallery Add

## Description
Ce module améliore l'UX en permettant l'ajout rapide de vêtements directement depuis la galerie, sans passer par plusieurs écrans de sélection.

## Fonctionnalités
- **Ajout direct depuis la galerie** : Le bouton "Ajouter un vêtement" ouvre directement la galerie
- **Traitement en arrière-plan** : L'analyse est faite automatiquement
- **Navigation simplifiée** : Redirection automatique vers la garde-robe après ajout

## Composants modifiés

### HomeScreen
- Modifié le bouton "Ajouter un vêtement" pour ouvrir directement la galerie
- Ajouté un bouton caméra séparé pour l'analyse de tenues complètes
- Ajouté un overlay de traitement pendant l'upload

### WardrobeScreen  
- Intégré le composant QuickAddButton
- Modifié l'état vide pour proposer les deux options

### QuickAddButton (nouveau)
- Composant réutilisable pour l'ajout rapide depuis la galerie
- Gère les permissions et le traitement
- Callback de succès pour rafraîchir la liste

## Flux utilisateur

1. **Ajout rapide d'un vêtement** :
   - Cliquer sur "Ajouter un vêtement" (bouton avec icône galerie)
   - Sélectionner une photo depuis la galerie
   - L'analyse se fait automatiquement
   - Redirection vers la garde-robe

2. **Analyse de tenue complète** :
   - Cliquer sur le bouton caméra
   - Accéder au flux complet d'analyse

## API utilisée
- `ImagePicker.launchImageLibraryAsync()` pour ouvrir la galerie
- `analyzeOutfit()` avec paramètre `itemType: 'clothing'` pour l'analyse simplifiée

## Permissions requises
- Accès à la galerie photo (`MediaLibrary`)

## Tests recommandés
- Vérifier l'ouverture directe de la galerie
- Tester le traitement en arrière-plan
- Vérifier la redirection après ajout
- Tester les cas d'erreur (permission refusée, échec d'analyse)