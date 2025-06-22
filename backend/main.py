from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from openai import OpenAI
import os
from dotenv import load_dotenv
import base64
from PIL import Image
import io
import json
import httpx
from datetime import datetime

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class OutfitAnalysisRequest(BaseModel):
    image_url: str
    user_preferences: Dict[str, Any] = {}

class DailyRecommendationRequest(BaseModel):
    city: Optional[str] = "Paris"
    country_code: Optional[str] = "FR"
    wardrobe_items: List[Dict[str, Any]] = []
    user_needs: Optional[str] = None
    current_season: Optional[str] = None
    recently_worn_ids: List[str] = []  # IDs des vêtements portés récemment

async def get_weather_data(city: str, country_code: str = "FR"):
    """Récupère les données météo pour une ville donnée"""
    try:
        async with httpx.AsyncClient() as client:
            # D'abord, obtenir les coordonnées de la ville
            geocoding_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=fr"
            geo_response = await client.get(geocoding_url)
            geo_data = geo_response.json()
            
            if not geo_data.get("results"):
                return None
            
            location = geo_data["results"][0]
            lat = location["latitude"]
            lon = location["longitude"]
            
            # Ensuite, obtenir la météo
            weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Europe/Paris"
            weather_response = await client.get(weather_url)
            weather_data = weather_response.json()
            
            return {
                "city": location["name"],
                "country": location["country"],
                "current": {
                    "temperature": weather_data["current"]["temperature_2m"],
                    "humidity": weather_data["current"]["relative_humidity_2m"],
                    "precipitation": weather_data["current"]["precipitation"],
                    "wind_speed": weather_data["current"]["wind_speed_10m"],
                    "weather_code": weather_data["current"]["weather_code"]
                },
                "daily": {
                    "max_temp": weather_data["daily"]["temperature_2m_max"][0],
                    "min_temp": weather_data["daily"]["temperature_2m_min"][0],
                    "precipitation": weather_data["daily"]["precipitation_sum"][0]
                }
            }
    except Exception as e:
        print(f"Erreur lors de la récupération de la météo: {str(e)}")
        return None

def interpret_weather_code(code: int) -> str:
    """Interprète le code météo en description"""
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

def get_weather_icon(code: int) -> str:
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

@app.get("/")
async def root():
    return {"message": "AI Fashion Assistant API"}

@app.post("/analyze-outfit")
async def analyze_outfit(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        base64_image = base64.b64encode(contents).decode('utf-8')
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un expert en mode et styliste professionnel. Analyse les vêtements avec précision. Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """Analyse cette image de vêtement(s). Identifie TOUTES les pièces visibles et retourne UNIQUEMENT ce JSON:
{
  "type": "outfit" ou "single_piece",
  "style": "casual/formel/sportif/streetwear/chic/bohème/minimaliste/etc",
  "category": "quotidien/soirée/sport/travail/décontracté",
  "colors": {"primary": ["couleur1", "couleur2"], "secondary": ["couleur3"]},
  "material": "coton/laine/denim/cuir/synthétique/etc",
  "pattern": "uni/rayé/fleuri/à carreaux/imprimé/etc",
  "occasion": "travail/sport/soirée/weekend/casual/etc",
  "season": ["spring", "summer", "fall", "winter"],
  "care_instructions": "laver à 30°/nettoyage à sec/etc",
  "brand_style": "casual/luxe/sportswear/fast-fashion/designer",
  "recommendations": ["suggestion1 détaillée", "suggestion2 détaillée"],
  "confidence": 0.85,
  "pieces": [
    {
      "type": "top/bottom/outerwear/dress/shoes/accessory",
      "name": "Nom descriptif de la pièce",
      "color": "couleur principale",
      "material": "matière",
      "brand_estimation": null,
      "price_range": "50-150€",
      "style": "style de la pièce",
      "fit": "slim/regular/loose/oversized"
    }
  ]
}

RÈGLES IMPORTANTES:
1. Le champ "pieces" doit TOUJOURS contenir au moins 1 élément
2. Si c'est une seule pièce visible, pieces contiendra 1 élément
3. Si c'est une tenue complète (personne habillée), pieces doit contenir TOUTES les pièces visibles: haut, bas, chaussures, accessoires, etc.
4. NE JAMAIS mettre brand_estimation - toujours null
5. type = "outfit" si plusieurs pièces forment une tenue, "single_piece" si c'est un vêtement isolé"""
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=800
        )
        
        # Log de la réponse pour debug
        raw_content = response.choices[0].message.content
        print(f"Réponse OpenAI: {raw_content}")
        
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
        
        # S'assurer que pieces existe toujours
        if "pieces" not in result:
            result["pieces"] = []
            
        # S'assurer que season est toujours un tableau
        if isinstance(result.get("season"), str):
            result["season"] = [result["season"]]
        
        return result
        
    except Exception as e:
        print(f"Erreur détaillée dans analyze_outfit: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-outfit-suggestions")
async def generate_suggestions(preferences: Dict[str, Any]):
    try:
        prompt = f"Suggère 5 tenues basées sur ces préférences: {preferences}"
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
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
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match-outfit")
async def match_outfit(request: Dict[str, Any]):
    try:
        item = request.get("item", {})
        wardrobe = request.get("wardrobe", [])
        
        prompt = f"Pour cet article {item}, trouve les meilleures combinaisons parmi: {wardrobe}"
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
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
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/daily-recommendations")
async def get_daily_recommendations(request: DailyRecommendationRequest):
    """Génère des recommandations quotidiennes basées sur la météo et la garde-robe"""
    try:
        # TODO: Connecter l'API météo plus tard
        # weather = await get_weather_data(request.city, request.country_code)
        
        # Pour l'instant, utiliser une météo fixe à 35°C pour les tests
        weather = {
            "city": request.city,
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
        
        # Interpréter les conditions météo
        weather_description = interpret_weather_code(weather["current"]["weather_code"])
        weather_icon = get_weather_icon(weather["current"]["weather_code"])
        
        # Créer le prompt pour GPT-4
        system_prompt = """Tu es un styliste personnel expert qui recommande des tenues basées sur:
1. La météo actuelle et prévue
2. Les vêtements disponibles dans la garde-robe
3. Les besoins spécifiques de l'utilisateur (si fournis)
4. La saison actuelle

Tu dois analyser la garde-robe et recommander les meilleures combinaisons ou pièces uniques.
Priorise les tenues complètes (outfits) quand c'est pertinent.
Réponds UNIQUEMENT avec un JSON valide."""

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

VÊTEMENTS RÉCEMMENT PORTÉS (à éviter):
{json.dumps(request.recently_worn_ids) if request.recently_worn_ids else "Aucun"}

GARDE-ROBE DISPONIBLE:
{json.dumps(request.wardrobe_items, ensure_ascii=False)}

RÈGLES IMPORTANTES:
1. ÉVITER absolument les vêtements avec les IDs dans recently_worn_ids
2. Les recommandations DOIVENT être cohérentes avec la météo:
   - Si > 30°C: vêtements légers, respirants, couleurs claires
   - Si < 10°C: vêtements chauds, plusieurs couches
   - Si pluie: vêtements imperméables ou résistants à l'eau
3. Prioriser la variété tout en restant approprié à la météo

Génère 1 à 3 recommandations pertinentes. Priorise:
1. Les tenues complètes (itemType: OUTFIT) adaptées à la météo ET non récemment portées
2. Les combinaisons de pièces individuelles si aucune tenue complète ne convient
3. Les pièces uniques exceptionnelles si particulièrement adaptées

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
      "weather_adaptation": "Comment cette tenue s'adapte à la météo",
      "style_tips": "Conseils de style supplémentaires"
    }}
  ]
}}

IMPORTANT: 
- L'id doit correspondre à un id existant dans la garde-robe
- Pour une combinaison, créer un id unique comme "combo-[id1]-[id2]"
- Le score doit refléter la pertinence (0-100)
- Maximum 3 recommandations, classées par score décroissant"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=1000,
            temperature=0.7
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8045)