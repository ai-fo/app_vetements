# Test de la Nouvelle Structure de Données

## Configuration

1. **Backend** : Assurez-vous que le backend est lancé sur le port 8045
   ```bash
   cd backend
   source env/bin/activate  # ou env/bin/python
   python -m uvicorn main:app --reload --port 8045
   ```

2. **Frontend** : L'application React Native doit être lancée
   ```bash
   npx expo start
   ```

## Ce qui a été modifié

### Backend
- Nouvelle structure de données avec UUIDs générés côté serveur
- Endpoint `/analyze-outfit` retourne maintenant :
  - Pour pièce unique : `SinglePieceResponse`
  - Pour tenue complète : `CompleteLookResponse`
- Nouveau endpoint `/save-clothing` pour sauvegarder dans les nouvelles tables
- Tables Supabase créées : `clothing_pieces`, `outfit_looks`, `look_pieces`

### Frontend
- Nouveau hook `useClothingAnalysis` qui :
  1. Appelle la nouvelle API
  2. Sauvegarde dans la nouvelle structure
  3. Transforme les données pour l'affichage
  4. Maintient la compatibilité avec l'ancienne structure
- `CameraScreen.js` utilise maintenant `analyzeClothing` au lieu de `analyzeOutfit`

## Test pas à pas

1. **Prendre une photo d'une pièce unique** :
   - Cliquez sur "Ajouter un vêtement"
   - Prenez une photo d'un t-shirt/chemise/etc.
   - Vérifiez dans les logs backend que la réponse contient :
     ```json
     {
       "capture_type": "single_piece",
       "pieces": [{
         "piece_id": "UUID",
         "piece_type": "tshirt",
         "attributes": {...}
       }]
     }
     ```

2. **Prendre une photo d'une tenue complète** :
   - Cliquez sur "Ajouter une tenue"
   - Prenez une photo d'une tenue complète
   - Vérifiez que la réponse contient `capture_type: "complete_look"` et `look_meta`

3. **Vérifier la sauvegarde** :
   - Les données doivent être sauvegardées dans les nouvelles tables Supabase
   - L'interface devrait continuer à fonctionner normalement

## Logs à surveiller

Dans le terminal backend, vous devriez voir :
- `Connexion à Supabase réussie` au démarrage
- Les requêtes POST vers `/analyze-outfit`
- Les requêtes POST vers `/save-clothing`

## En cas d'erreur

1. **"No module named 'sqlalchemy'"** : Installez avec `env/bin/pip install sqlalchemy psycopg2-binary`
2. **Erreur de connexion DB** : Vérifiez que DATABASE_URL est bien configuré dans `.env`
3. **Erreur 500** : Vérifiez les logs backend pour plus de détails