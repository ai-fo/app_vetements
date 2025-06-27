# Modification du endpoint /daily-recommendations pour ne générer qu'une seule recommandation
# Remplacer les lignes 303-335 dans main.py par :

"""
Génère EXACTEMENT 1 SEULE recommandation. Priorise dans cet ordre:
1. Une tenue complète (itemType: OUTFIT) adaptée à la météo ET non récemment portée
2. Une combinaison de 2-3 pièces individuelles si aucune tenue complète ne convient
3. Une pièce unique exceptionnelle si particulièrement adaptée

Retourne UNIQUEMENT ce JSON avec EXACTEMENT 1 recommandation:
{
  "weather": {
    "temp": {weather['current']['temperature']},
    "condition": "{weather_description.lower()}",
    "description": "{weather_description}",
    "icon": "{weather_icon}",
    "humidity": {weather['current']['humidity']},
    "wind": {weather['current']['wind_speed']},
    "sunrise": "06:30",
    "sunset": "19:45"
  },
  "recommendations": [
    {
      "id": "id_du_vetement_ou_combinaison",
      "score": 95,
      "reason": "Pourquoi cette recommandation est parfaite pour aujourd'hui",
      "weather_adaptation": "OBLIGATOIRE: Expliquer précisément pourquoi ces vêtements sont adaptés à {weather['current']['temperature']}°C (matières, coupe, épaisseur)",
      "style_tips": "Conseils de style supplémentaires"
    }
  ]
}

IMPORTANT: 
- L'id doit correspondre à un id existant dans la garde-robe
- Pour une combinaison, créer un id unique comme "combo-[id1]-[id2]" avec les IDs triés alphabétiquement
- Le tableau "recommendations" doit contenir EXACTEMENT 1 élément, pas plus
- Ne JAMAIS générer plusieurs recommandations
"""

# Ajouter aussi après la ligne 44 dans DailyRecommendationRequest:
recently_recommended_ids: List[str] = []  # IDs des items déjà recommandés
recently_recommended_combos: List[str] = []  # IDs des combos déjà recommandés

# Modifier la ligne 279 pour inclure les combos:
VÊTEMENTS ET COMBOS RÉCEMMENT RECOMMANDÉS (à éviter absolument):
Items: {json.dumps(request.recently_recommended_ids) if request.recently_recommended_ids else "Aucun"}
Combos: {json.dumps(request.recently_recommended_combos) if request.recently_recommended_combos else "Aucun"}

# Après la ligne 361, ajouter une vérification:
# Forcer une seule recommandation
if len(result.get("recommendations", [])) > 1:
    result["recommendations"] = result["recommendations"][:1]
    print("Avertissement: Plus d'une recommandation générée, limité à 1")