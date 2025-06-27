# Extrait de la méthode daily-recommendations mise à jour
# À intégrer dans main.py

@app.post("/daily-recommendations")
async def get_daily_recommendations(request: DailyRecommendationRequest):
    """Génère des recommandations quotidiennes basées sur la météo et la garde-robe"""
    try:
        # TODO: Connecter l'API météo réelle
        # weather = await get_weather_data(request.city, request.country_code)
        
        # Pour l'instant, utiliser une météo simulée variable
        import random
        temp = random.randint(15, 35)  # Température variable pour tester
        weather = {
            "city": request.city,
            "current": {
                "temperature": temp,
                "humidity": random.randint(40, 80),
                "precipitation": random.choice([0, 0, 0, 5, 10]),  # Pluie occasionnelle
                "wind_speed": random.randint(5, 25),
                "weather_code": random.choice([0, 1, 2, 3, 45, 61])  # Différentes conditions
            },
            "daily": {
                "max_temp": temp + random.randint(2, 5),
                "min_temp": temp - random.randint(2, 5),
                "precipitation": 0
            }
        }
        
        # Interpréter les conditions météo
        weather_description = interpret_weather_code(weather["current"]["weather_code"])
        weather_icon = get_weather_icon(weather["current"]["weather_code"])
        
        # Créer le prompt pour GPT-4 sans règles hardcodées
        system_prompt = """Tu es un styliste personnel expert qui recommande des tenues basées sur:
1. La météo actuelle et prévue
2. Les vêtements disponibles dans la garde-robe avec TOUTES leurs caractéristiques
3. Les besoins spécifiques de l'utilisateur (si fournis)
4. La saison actuelle
5. L'historique des recommandations récentes

Tu dois analyser en profondeur la garde-robe en utilisant TOUTES les données disponibles:
- Nom descriptif généré par l'IA
- Style dominant, tags d'occasion, saisonnalité
- Palette de couleurs complète (primaires et secondaires)
- Niveau de superposition (layering_level)
- Compatibilité météo (weather_suitable)
- Silhouette et mix de motifs
- Fréquence de port et date du dernier port
- Favoris de l'utilisateur

Priorise les tenues complètes (outfits) et les combinaisons créatives.
Réponds UNIQUEMENT avec un JSON valide."""

        # Ajouter l'info sur les recommandations récentes si demandé
        recommendation_history_info = ""
        if request.include_recommendation_history and request.recently_recommended_ids:
            recommendation_history_info = f"""
RECOMMANDATIONS RÉCENTES (pour information):
Ces items ont été récemment recommandés : {json.dumps(request.recently_recommended_ids)}
Tu PEUX les recommander à nouveau si vraiment pertinent, mais indique dans ce cas:
- was_recently_recommended: true
- last_recommended_days: X (nombre approximatif de jours)
"""

        user_prompt = f"""Conditions actuelles:
MÉTÉO À {weather['city']}:
- {weather_description}
- Température: {weather['current']['temperature']}°C
- Max/Min aujourd'hui: {weather['daily']['max_temp']}°C / {weather['daily']['min_temp']}°C
- Humidité: {weather['current']['humidity']}%
- Vent: {weather['current']['wind_speed']} km/h
- Précipitations: {weather['current']['precipitation']}mm

SAISON: {request.current_season or 'all_season'}

{f"BESOINS SPÉCIFIQUES: {request.user_needs}" if request.user_needs else ""}

{recommendation_history_info}

GARDE-ROBE DISPONIBLE (avec toutes les métadonnées enrichies):
{json.dumps(request.wardrobe_items, ensure_ascii=False)}

INSTRUCTIONS:
1. Analyse TOUTES les données disponibles pour chaque vêtement (pas seulement le type)
2. Utilise l'intelligence de l'IA : noms descriptifs, styles, occasions, météo compatible
3. Crée des combinaisons créatives basées sur:
   - Harmonie des couleurs (utilise colorPalette)
   - Mix de motifs approprié (utilise patternMix)
   - Silhouettes complémentaires
   - Niveaux de superposition adaptés à la météo
4. Favorise la variété mais reste cohérent avec le style de l'utilisateur
5. Si tu recommandes quelque chose de récent, explique pourquoi c'est vraiment pertinent

Génère 1 à 3 recommandations pertinentes. Priorise:
1. Les tenues complètes existantes (isLook: true) si adaptées
2. Les combinaisons créatives de pièces individuelles
3. Les pièces uniques exceptionnelles avec suggestions de combinaisons

Retourne UNIQUEMENT ce JSON:
{{
  "weather": {{
    "temp": {weather['current']['temperature']},
    "condition": "{weather_description.lower()}",
    "description": "{weather_description}",
    "icon": "{weather_icon}",
    "humidity": {weather['current']['humidity']},
    "wind": {weather['current']['wind_speed']},
    "sunrise": "06:30",
    "sunset": "19:45"
  }},
  "recommendations": [
    {{
      "id": "id_du_vetement_ou_combinaison",
      "name": "Nom descriptif de la recommandation",
      "score": 95,
      "reason": "Explication détaillée basée sur TOUTES les données (style, couleurs, météo, occasion)",
      "weather_adaptation": "Comment cette tenue s'adapte spécifiquement aux conditions météo",
      "style_tips": "Conseils de style personnalisés basés sur les données enrichies",
      "was_recently_recommended": false,
      "last_recommended_days": null
    }}
  ]
}}

IMPORTANT: 
- Utilise les données enrichies (dominantStyle, silhouette, colorPalette, etc.)
- Pour les combinaisons: "combo-[uuid1]-[uuid2]-[uuid3]"
- Le score reflète la pertinence globale (météo + style + occasion)
- Si was_recently_recommended est true, justifie pourquoi c'est quand même pertinent"""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=1500,  # Plus de tokens pour des réponses détaillées
            temperature=0.8   # Plus de créativité
        )
        
        # Parser la réponse JSON
        raw_content = response.choices[0].message.content
        print(f"Réponse GPT pour recommandations quotidiennes: {raw_content}")
        
        try:
            result = json.loads(raw_content)
        except json.JSONDecodeError:
            # Si ce n'est pas du JSON, essayer de nettoyer
            cleaned = raw_content.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            result = json.loads(cleaned.strip())
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erreur dans daily_recommendations: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))