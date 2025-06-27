# Changements à effectuer dans backend/main.py

## 1. Ajouter le nouveau champ dans DailyRecommendationRequest (ligne ~45)

```python
class DailyRecommendationRequest(BaseModel):
    city: Optional[str] = "Paris"
    country_code: Optional[str] = "FR"
    wardrobe_items: List[Dict[str, Any]] = []
    user_needs: Optional[str] = None
    current_season: Optional[str] = None
    recently_worn_ids: List[str] = []  # IDs des vêtements portés récemment
    recently_recommended_ids: List[str] = []  # AJOUTER CETTE LIGNE
    recently_recommended_combos: List[str] = []  # AJOUTER CETTE LIGNE
```

## 2. Modifier le prompt (ligne ~303)

REMPLACER :
```python
Génère 1 à 3 recommandations pertinentes. Priorise:
```

PAR :
```python
Génère EXACTEMENT 1 SEULE recommandation. Priorise dans cet ordre:
```

## 3. Modifier la fin du prompt (ligne ~335)

REMPLACER :
```python
- Maximum 3 recommandations, classées par score décroissant"""
```

PAR :
```python
- EXACTEMENT 1 recommandation dans le tableau recommendations"""
```

## 4. Ajouter les combos récemment recommandés dans le prompt (ligne ~279)

REMPLACER :
```python
VÊTEMENTS RÉCEMMENT PORTÉS (à éviter):
{json.dumps(request.recently_worn_ids) if request.recently_worn_ids else "Aucun"}
```

PAR :
```python
VÊTEMENTS ET COMBOS RÉCEMMENT RECOMMANDÉS (à éviter absolument):
Items: {json.dumps(request.recently_recommended_ids) if request.recently_recommended_ids else "Aucun"}
Combos: {json.dumps(request.recently_recommended_combos) if request.recently_recommended_combos else "Aucun"}
```

## 5. Forcer une seule recommandation après parsing (après ligne ~361)

AJOUTER après `result = json.loads(cleaned.strip())` :
```python
        # Forcer une seule recommandation
        if len(result.get("recommendations", [])) > 1:
            result["recommendations"] = result["recommendations"][:1]
            print("Avertissement: Plus d'une recommandation générée, limité à 1")
```

## Résumé des changements
- Le prompt demande maintenant EXACTEMENT 1 recommandation
- Le modèle de requête accepte les combos déjà recommandés
- Le backend force la limitation à 1 recommandation même si l'IA en génère plusieurs
- Les IDs de combos sont pris en compte pour éviter les doublons

Ces changements réduiront les coûts API de 66% et éviteront les problèmes de filtrage côté frontend.