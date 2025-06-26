# Configuration Supabase

## Tables créées avec succès

Les nouvelles tables ont été créées dans votre projet Supabase :

1. **clothing_pieces** - Stocke toutes les pièces individuelles
2. **outfit_looks** - Stocke les métadonnées des tenues complètes  
3. **look_pieces** - Table de liaison entre tenues et pièces

## Configuration requise

Pour connecter votre backend à Supabase, vous devez ajouter dans votre fichier `.env` :

```env
# Remplacez [YOUR-PASSWORD] par votre mot de passe de base de données
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.irdtiqaqwydnplvkzwfp.supabase.co:5432/postgres
```

### Où trouver votre mot de passe :

1. Allez sur https://supabase.com/dashboard/project/irdtiqaqwydnplvkzwfp/settings/database
2. Trouvez la section "Connection string"
3. Copiez le mot de passe ou réinitialisez-le si nécessaire

## Test de connexion

Une fois le DATABASE_URL configuré, lancez le backend :

```bash
cd backend
python -m uvicorn main:app --reload --port 8045
```

## Endpoints disponibles

- `POST /analyze-outfit` - Analyse une image de vêtement
- `POST /save-clothing` - Sauvegarde les vêtements analysés
- `GET /wardrobe/{user_id}/pieces` - Récupère les pièces d'un utilisateur
- `GET /wardrobe/{user_id}/looks` - Récupère les tenues d'un utilisateur

## Structure de données

Voir le fichier `backend/docs/new_data_structure.md` pour la documentation complète.