# Mise à jour du endpoint /api/daily-recommendations pour éviter les doublons

# Dans la fonction qui gère les recommandations quotidiennes, modifier :

@app.post("/api/daily-recommendations")
async def get_daily_recommendations(request: DailyRecommendationRequest):
    # ... code existant ...
    
    # Récupérer les paramètres de duplications
    recently_recommended_ids = request.recently_recommended_ids or []
    recently_recommended_combos = request.recently_recommended_combos or []
    
    # Normaliser les IDs de combos pour la comparaison
    def normalize_combo_id(combo_id):
        if not combo_id or not combo_id.startswith('combo-'):
            return combo_id
        
        combo_string = combo_id.replace('combo-', '')
        import re
        uuid_pattern = r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
        ids = re.findall(uuid_pattern, combo_string)
        return f"combo-{'-'.join(sorted(ids))}" if ids else combo_id
    
    normalized_recent_combos = [normalize_combo_id(c) for c in recently_recommended_combos]
    
    # Préparer le prompt pour l'IA avec les exclusions
    system_prompt = f"""Tu es un assistant styliste personnel expert en mode.
    
    IMPORTANT - Tu dois générer EXACTEMENT 1 SEULE recommandation.
    
    EXCLUSIONS OBLIGATOIRES - NE JAMAIS recommander :
    1. Les items individuels avec ces IDs : {recently_recommended_ids}
    2. Les combinaisons/tenues avec ces IDs normalisés : {normalized_recent_combos}
    
    Ces items/combos ont déjà été recommandés récemment. Tu DOIS proposer quelque chose de différent.
    
    Si la garde-robe est très limitée et que tu ne peux pas éviter un doublon :
    - Ajoute was_recently_recommended: true
    - Ajoute last_recommended_days: 0
    
    Contexte météo : {weather_data}
    Saison actuelle : {current_season}
    
    Génère UNIQUEMENT 1 recommandation adaptée et créative.
    """
    
    # Modifier aussi le prompt de génération pour ne demander qu'UNE recommandation
    user_prompt = f"""
    Garde-robe disponible : {wardrobe_items}
    
    Génère EXACTEMENT 1 SEULE recommandation pour aujourd'hui.
    
    Format de réponse OBLIGATOIRE :
    {{
      "weather": {{...}},
      "recommendations": [
        {{
          "id": "...",
          "reason": "...",
          "weather_adaptation": "...",
          "style_tips": "..."
        }}
      ]
    }}
    
    IMPORTANT : Le tableau "recommendations" doit contenir EXACTEMENT 1 élément.
    """
    
    # Après réception de la réponse de l'IA
    if len(ai_recommendations) > 1:
        # Ne garder que la première recommandation
        ai_recommendations = ai_recommendations[:1]
    
    # Vérifier si c'est un doublon
    recommendation = ai_recommendations[0]
    normalized_rec_id = normalize_combo_id(recommendation['id'])
    
    if normalized_rec_id in normalized_recent_combos or recommendation['id'] in recently_recommended_ids:
        recommendation['was_recently_recommended'] = True
        recommendation['last_recommended_days'] = 0
    
    return {
        "weather": weather_data,
        "recommendations": ai_recommendations  # Toujours 1 seule recommandation
    }