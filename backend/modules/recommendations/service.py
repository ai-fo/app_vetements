"""
Service de recommandations
"""
import json
import httpx
from openai import OpenAI
from typing import Dict, Any, List, Optional

from core.config import settings
from .weather import WeatherService

class RecommendationService:
    """Service pour générer des recommandations de tenues"""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.weather_service = WeatherService()
    
    async def get_daily_recommendations(self, request) -> Dict[str, Any]:
        """Génère des recommandations quotidiennes"""
        # Récupérer la météo (simulée pour l'instant)
        weather = await self._get_weather_data(request.city, request.country_code)
        
        # Interpréter les conditions météo
        weather_description = self._interpret_weather_code(weather["current"]["weather_code"])
        weather_icon = self._get_weather_icon(weather["current"]["weather_code"])
        
        # Créer le prompt pour GPT-4
        system_prompt = self._create_system_prompt()
        user_prompt = self._create_user_prompt(
            weather, weather_description, weather_icon,
            request.current_season, request.user_needs,
            request.recently_recommended_ids, request.recently_recommended_combos,
            request.wardrobe_items
        )
        
        # Appeler GPT-4
        response = self.client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=settings.AI_MAX_TOKENS,
            temperature=settings.AI_TEMPERATURE
        )
        
        # Parser la réponse
        result = self._parse_ai_response(response.choices[0].message.content)
        
        # Forcer une seule recommandation
        if len(result.get("recommendations", [])) > 1:
            result["recommendations"] = result["recommendations"][:1]
            print("Avertissement: Plus d'une recommandation générée, limité à 1")
        
        return result
    
    async def match_outfit(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Trouve les meilleures combinaisons pour un article"""
        item = request.get("item", {})
        wardrobe = request.get("wardrobe", [])
        
        prompt = f"Pour cet article {item}, trouve les meilleures combinaisons parmi: {wardrobe}"
        
        response = self.client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un expert en coordination de tenues. Trouve les meilleures combinaisons."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=800
        )
        
        return {"matches": response.choices[0].message.content}
    
    async def generate_suggestions(self, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Génère des suggestions de tenues basées sur les préférences"""
        prompt = f"Suggère 5 tenues basées sur ces préférences: {preferences}"
        
        response = self.client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un styliste personnel. Fournis des suggestions de tenues détaillées."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=1000
        )
        
        return {"suggestions": response.choices[0].message.content}
    
    async def _get_weather_data(self, city: str, country_code: str) -> Dict[str, Any]:
        """Récupère les données météo (simulées pour l'instant)"""
        # TODO: Connecter l'API météo plus tard
        return {
            "city": city,
            "current": {
                "temperature": 35,
                "humidity": 65,
                "precipitation": 0,
                "wind_speed": 15,
                "weather_code": 0  # Ciel dégagé
            },
            "daily": {
                "max_temp": 37,
                "min_temp": 28,
                "precipitation": 0
            }
        }
    
    def _interpret_weather_code(self, code: int) -> str:
        """Interprète le code météo"""
        weather_codes = {
            0: "Ciel dégagé",
            1: "Principalement dégagé",
            2: "Partiellement nuageux",
            3: "Nuageux",
            45: "Brouillard",
            48: "Brouillard givrant",
            51: "Bruine légère",
            53: "Bruine modérée",
            55: "Bruine forte",
            61: "Pluie légère",
            63: "Pluie modérée",
            65: "Pluie forte",
            71: "Neige légère",
            73: "Neige modérée",
            75: "Neige forte",
            80: "Averses légères",
            81: "Averses modérées",
            82: "Averses fortes",
            95: "Orage",
            96: "Orage avec grêle"
        }
        return weather_codes.get(code, "Conditions inconnues")
    
    def _get_weather_icon(self, code: int) -> str:
        """Retourne l'icône appropriée pour le code météo"""
        if code == 0 or code == 1:
            return "sunny"
        elif code == 2:
            return "partly-sunny"
        elif code == 3:
            return "cloud"
        elif code >= 45 and code <= 48:
            return "cloudy"
        elif code >= 51 and code <= 67:
            return "rainy"
        elif code >= 71 and code <= 77:
            return "snow"
        elif code >= 80 and code <= 82:
            return "rainy"
        elif code >= 95:
            return "thunderstorm"
        else:
            return "partly-sunny"
    
    def _create_system_prompt(self) -> str:
        """Crée le prompt système pour GPT-4"""
        return """Tu es un styliste personnel expert qui recommande des tenues basées sur:
1. La météo actuelle et prévue
2. Les vêtements disponibles dans la garde-robe
3. Les besoins spécifiques de l'utilisateur (si fournis)
4. La saison actuelle

Tu dois analyser la garde-robe et recommander les meilleures combinaisons ou pièces uniques.
Priorise les tenues complètes (outfits) quand c'est pertinent.
Réponds UNIQUEMENT avec un JSON valide."""
    
    def _create_user_prompt(self, weather, weather_description, weather_icon,
                           current_season, user_needs, recently_recommended_ids,
                           recently_recommended_combos, wardrobe_items) -> str:
        """Crée le prompt utilisateur pour GPT-4"""
        return f"""Conditions actuelles:
MÉTÉO À {weather['city']}:
- {weather_description}
- Température: {weather['current']['temperature']}°C
- Max/Min aujourd'hui: {weather['daily']['max_temp']}°C / {weather['daily']['min_temp']}°C
- Humidité: {weather['current']['humidity']}%
- Vent: {weather['current']['wind_speed']} km/h
- Précipitations: {weather['current']['precipitation']}mm

SAISON: {current_season or 'all_season'}

{f"BESOINS SPÉCIFIQUES: {user_needs}" if user_needs else ""}

VÊTEMENTS ET COMBOS RÉCEMMENT RECOMMANDÉS (à éviter absolument):
Items: {json.dumps(recently_recommended_ids) if recently_recommended_ids else "Aucun"}
Combos: {json.dumps(recently_recommended_combos) if recently_recommended_combos else "Aucun"}

GARDE-ROBE DISPONIBLE:
{json.dumps(wardrobe_items, ensure_ascii=False)}

RÈGLES IMPORTANTES ET OBLIGATOIRES:
1. ÉVITER absolument les vêtements avec les IDs dans recently_worn_ids
2. COHÉRENCE MÉTÉO STRICTE - NE JAMAIS DÉROGER À CES RÈGLES:
   - Si température >= 30°C: 
     * INTERDITS: pulls, sweats, vestes chaudes, laine, cachemire, velours
     * OBLIGATOIRES: t-shirts, chemises légères, shorts, robes légères, lin, coton léger
   - Si température 20-29°C:
     * INTERDITS: pulls épais, doudounes, manteaux, laine épaisse
     * AUTORISÉS: chemises, t-shirts, pantalons légers, robes, cardigans légers
   - Si température 10-19°C:
     * AUTORISÉS: pulls légers, vestes, jeans, chemises manches longues
   - Si température < 10°C:
     * RECOMMANDÉS: pulls chauds, manteaux, écharpes, vestes chaudes
   - Si pluie: privilégier imperméables ou résistants à l'eau
3. VÉRIFIER que chaque pièce recommandée a des matières adaptées:
   - Chaleur (>25°C): coton, lin, viscose, matières respirantes
   - Froid (<15°C): laine, cachemire, polyester, matières chaudes
4. NE JAMAIS recommander un pull/sweat/veste chaude si température > 25°C

Génère EXACTEMENT 1 SEULE recommandation de TENUE COMPLÈTE. 

RÈGLES OBLIGATOIRES pour les recommandations:
1. Si c'est une tenue complète (itemType: OUTFIT) : recommande-la directement
2. Si c'est une combinaison, elle DOIT être une tenue complète :
   - SOIT : 1 haut (t-shirt, chemise, top, etc.) + 1 bas (pantalon, short, jupe, etc.)
   - SOIT : 1 robe SEULE (car la robe compte comme haut + bas)
   - Optionnel dans tous les cas : veste/cardigan, chaussures, accessoires
3. JAMAIS recommander seulement des hauts ou seulement des bas
4. Les combinaisons peuvent inclure 2-5 pièces selon le type

COMPATIBILITÉ VESTIMENTAIRE - INTERDICTIONS ABSOLUES:
- JAMAIS combiner une robe avec un t-shirt/chemise/top (une robe se porte seule ou avec veste)
- JAMAIS combiner une robe avec un pantalon/short/jupe
- Une robe peut SEULEMENT être combinée avec : veste, cardigan, chaussures, accessoires
- JAMAIS superposer plusieurs bas ensemble (pantalon + short, jupe + pantalon, etc.)
- JAMAIS combiner plusieurs pièces du même type sauf pour le layering de hauts
- Si tu recommandes plusieurs hauts, assure-toi qu'ils sont compatibles pour le layering (ex: t-shirt sous chemise ouverte)

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
      "score": 95,
      "reason": "Pourquoi cette recommandation est parfaite pour aujourd'hui",
      "weather_adaptation": "OBLIGATOIRE: Expliquer précisément pourquoi ces vêtements sont adaptés à {weather['current']['temperature']}°C (matières, coupe, épaisseur)",
      "style_tips": "Conseils de style supplémentaires"
    }}
  ]
}}

IMPORTANT: 
- L'id doit correspondre à un id existant dans la garde-robe
- Pour une combinaison, créer un id unique comme "combo-[id1]-[id2]-[id3]..." avec TOUS les IDs triés alphabétiquement
- Une combinaison DOIT inclure au minimum un haut ET un bas (sauf si c'est une robe)
- Le score doit refléter la pertinence (0-100)
- EXACTEMENT 1 recommandation dans le tableau recommendations, pas plus
- Si tu recommandes plusieurs hauts (ex: t-shirt + chemise), assure-toi qu'ils se complètent (layering)"""
    
    def _parse_ai_response(self, raw_content: str) -> Dict[str, Any]:
        """Parse la réponse JSON de l'IA"""
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