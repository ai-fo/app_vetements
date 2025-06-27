# Mise à jour du endpoint /api/daily-recommendations pour éviter les doublons

# Dans la fonction qui gère les recommandations quotidiennes, ajouter :

@app.post("/api/daily-recommendations")
async def get_daily_recommendations(request: DailyRecommendationRequest):
    # ... code existant ...
    
    # Récupérer les paramètres de duplications
    recently_recommended_ids = request.recently_recommended_ids or []
    recently_recommended_combos = request.recently_recommended_combos or []
    
    # Préparer le prompt pour l'IA avec les exclusions
    system_prompt = f"""Tu es un assistant styliste personnel expert en mode.
    
    IMPORTANT - Évite de recommander :
    1. Les items individuels avec ces IDs : {recently_recommended_ids}
    2. Les combinaisons/tenues avec ces IDs : {recently_recommended_combos}
    
    Ces items/combos ont déjà été recommandés aujourd'hui. Propose des alternatives différentes.
    
    Si tu dois absolument recommander un item déjà suggéré (par exemple si la garde-robe est très limitée), 
    mentionne explicitement que cet item a déjà été recommandé aujourd'hui avec was_recently_recommended: true.
    
    Contexte météo : {weather_data}
    Saison actuelle : {current_season}
    
    Analyse la garde-robe et propose 3-5 tenues adaptées en variant les suggestions.
    Pour chaque recommandation, privilégie la variété et la créativité.
    """
    
    # Dans la réponse de l'IA, vérifier si une recommandation est un doublon
    for recommendation in ai_recommendations:
        # Pour les combos
        if recommendation['id'].startswith('combo-'):
            if recommendation['id'] in recently_recommended_combos:
                recommendation['was_recently_recommended'] = True
                recommendation['last_recommended_days'] = 0  # Aujourd'hui
        # Pour les items simples
        elif recommendation['id'] in recently_recommended_ids:
            recommendation['was_recently_recommended'] = True
            recommendation['last_recommended_days'] = 0
    
    # Filtrer pour privilégier les nouvelles recommandations
    new_recommendations = [r for r in ai_recommendations if not r.get('was_recently_recommended', False)]
    old_recommendations = [r for r in ai_recommendations if r.get('was_recently_recommended', False)]
    
    # Prioriser les nouvelles recommandations
    final_recommendations = new_recommendations[:3]  # Prendre d'abord les nouvelles
    if len(final_recommendations) < 3:
        # Compléter avec les anciennes si nécessaire
        final_recommendations.extend(old_recommendations[:3-len(final_recommendations)])
    
    return {
        "weather": weather_data,
        "recommendations": final_recommendations
    }