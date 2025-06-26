# Nouvelle Structure de Données - Système de Vêtements

## Vue d'ensemble

La nouvelle structure de données a été conçue pour mieux représenter les vêtements individuels et les tenues complètes, avec une génération d'UUID côté serveur et une structure normalisée.

## Structure JSON

### 1. Pièce Unique (single_piece)

```json
{
  "capture_type": "single_piece",
  "pieces": [
    {
      "piece_id": "UUID_GÉNÉRÉ_CÔTÉ_SERVEUR",
      "piece_type": "tshirt",
      "attributes": {
        "colors": {
          "primary": ["white"],
          "secondary": ["black"]
        },
        "material": "coton",
        "pattern": "uni",
        "fit": "regular",
        "details": ["crewneck"]
      },
      "style_tags": ["casual", "minimaliste"],
      "occasion_tags": ["weekend"],
      "seasonality": ["spring", "summer"]
    }
  ]
}
```

### 2. Tenue Complète (complete_look)

```json
{
  "capture_type": "complete_look",
  "pieces": [
    {
      "piece_id": "UUID_HAUT",
      "piece_type": "tshirt",
      "attributes": { /* ... */ }
    },
    {
      "piece_id": "UUID_BAS",
      "piece_type": "pants",
      "attributes": { /* ... */ }
    }
  ],
  "look_meta": {
    "look_id": "UUID_LOOK",
    "dominant_style": ["casual"],
    "occasion_tags": ["weekend"],
    "seasonality": ["spring", "summer"],
    "color_palette_global": {
      "primary": ["white", "black"],
      "accent": ["red"]
    },
    "pattern_mix": ["uni", "logo"],
    "silhouette": "slim_top_loose_bottom",
    "layering_level": 1
  }
}
```

## Valeurs Normalisées

### Types de Pièces (piece_type)
- **Hauts**: tshirt, shirt, sweater, pullover, hoodie, jacket, blazer, coat, vest
- **Bas**: pants, jeans, shorts, skirt, dress
- **Chaussures**: shoes, sneakers, boots, sandals
- **Accessoires**: bag, belt, hat, scarf, jewelry

### Couleurs (colors)
white, black, grey, light-grey, dark-grey, navy, blue, light-blue, red, burgundy, pink, green, khaki, olive, yellow, orange, purple, brown, beige, cream

### Matériaux (material)
coton, laine, denim, cuir, synthétique, lin, soie, velours, cachemire, polyester, nylon

### Motifs (pattern)
uni, rayé, carreaux, fleuri, logo, imprimé, graphique, camouflage, pois, géométrique

### Coupes (fit)
slim, regular, loose, oversized, skinny, relaxed, straight, tapered

### Styles (style_tags)
casual, formel, sportif, streetwear, chic, bohème, minimaliste, rock, vintage, preppy, workwear

### Occasions (occasion_tags)
travail, soirée, weekend, sport, casual, cérémonie, vacances, quotidien

### Saisons (seasonality)
spring, summer, fall, winter

## Base de Données

### Tables Principales

1. **clothing_pieces**: Stocke toutes les pièces individuelles
2. **outfit_looks**: Stocke les métadonnées des tenues complètes
3. **look_pieces**: Table de liaison entre tenues et pièces

### Migration SQL

Voir le fichier `backend/database/migrations/001_new_clothing_structure.sql`

## Endpoints API

### Analyse d'Image
```
POST /analyze-outfit
- Paramètres: file (image), item_type (optionnel, "clothing" pour pièce unique)
- Retourne: SinglePieceResponse ou CompleteLookResponse
```

### Sauvegarde
```
POST /save-clothing
- Body: { user_id, analysis_result, image_urls? }
- Retourne: { success, message, piece_id/look_id }
```

### Récupération
```
GET /wardrobe/{user_id}/pieces?piece_type=tshirt
GET /wardrobe/{user_id}/looks
```

## Notes Importantes

1. **UUIDs**: Générés côté serveur, jamais par GPT-4
2. **Validation**: Utilise Pydantic pour garantir la structure
3. **Flexibilité**: Les attributs JSON permettent d'ajouter des propriétés sans modifier le schéma
4. **Performance**: Index sur les champs de recherche fréquents