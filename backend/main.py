from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Union
from openai import OpenAI
import os
from dotenv import load_dotenv
import base64
from PIL import Image
import io
import json
import httpx
from datetime import datetime
from uuid import UUID
from services.clothing_analyzer import ClothingAnalyzer
from schemas.clothing_analysis import SinglePieceResponse, CompleteLookResponse
from services.wardrobe_service import WardrobeService
from database.models import Base, ClothingItem

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
clothing_analyzer = ClothingAnalyzer(client)

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

@app.post("/analyze-outfit", response_model=Union[SinglePieceResponse, CompleteLookResponse])
async def analyze_outfit(file: UploadFile = File(...), item_type: Optional[str] = None):
    try:
        # Lire et convertir l'image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Redimensionner si l'image est trop grande
        max_size = 1024
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            new_size = tuple(int(dim * ratio) for dim in image.size)
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        # Convertir en base64
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG")
        base64_image = base64.b64encode(buffered.getvalue()).decode()
        
        # Déterminer si c'est une pièce unique ou une tenue complète
        is_single_piece = (item_type == "clothing")
        
        # Utiliser le nouveau service pour analyser l'image
        result = clothing_analyzer.analyze_image(base64_image, is_single_piece)
        
        # Retourner le résultat avec la nouvelle structure
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
            model="gpt-4o",
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
            model="gpt-4o",
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
      "weather_adaptation": "OBLIGATOIRE: Expliquer précisément pourquoi ces vêtements sont adaptés à {weather['current']['temperature']}°C (matières, coupe, épaisseur)",
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
            model="gpt-4o",
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


class SaveClothingRequest(BaseModel):
    user_id: UUID
    analysis_result: Union[SinglePieceResponse, CompleteLookResponse]
    image_urls: Optional[List[str]] = None


# Importer la vraie connexion à la base de données
from database.connection import get_db


@app.post("/save-clothing")
async def save_clothing(
    request: SaveClothingRequest,
    db = Depends(get_db)
):
    """Sauvegarde les vêtements analysés dans la base de données"""
    try:
        wardrobe_service = WardrobeService(db)
        
        if request.analysis_result.capture_type == "single_piece":
            # Sauvegarder une pièce unique
            result = wardrobe_service.save_single_piece(
                user_id=request.user_id,
                piece_data=request.analysis_result,
                image_url=request.image_urls[0] if request.image_urls else None
            )
            return {
                "success": True,
                "message": "Pièce sauvegardée avec succès",
                "piece_id": str(result.id)
            }
        else:
            # Sauvegarder une tenue complète
            result = wardrobe_service.save_complete_look(
                user_id=request.user_id,
                look_data=request.analysis_result,
                image_url=request.image_urls[0] if request.image_urls else None
            )
            return {
                "success": True,
                "message": "Tenue sauvegardée avec succès",
                "look_id": str(result.id)
            }
            
    except Exception as e:
        print(f"Erreur lors de la sauvegarde: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/wardrobe/{user_id}/pieces")
async def get_user_pieces(
    user_id: UUID,
    piece_type: Optional[str] = None,
    db = Depends(get_db)
):
    """Récupère les pièces de vêtements d'un utilisateur"""
    try:
        wardrobe_service = WardrobeService(db)
        pieces = wardrobe_service.get_user_pieces(user_id, piece_type)
        
        return {
            "pieces": [
                {
                    "piece_id": str(piece.id),
                    "piece_type": piece.piece_type,
                    "name": piece.name,
                    "colors": piece.colors,
                    "material": piece.material,
                    "pattern": piece.pattern,
                    "fit": piece.fit,
                    "details": piece.details,
                    "style_tags": piece.style_tags,
                    "occasion_tags": piece.occasion_tags,
                    "seasonality": piece.seasonality,
                    "image_url": piece.image_url,
                    "is_favorite": piece.is_favorite,
                    "wear_count": piece.wear_count,
                    "created_at": piece.created_at.isoformat() if piece.created_at else None
                }
                for piece in pieces
            ]
        }
        
    except Exception as e:
        print(f"Erreur lors de la récupération des pièces: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/wardrobe/{user_id}/looks")
async def get_user_looks(
    user_id: UUID,
    db = Depends(get_db)
):
    """Récupère les tenues complètes d'un utilisateur"""
    try:
        wardrobe_service = WardrobeService(db)
        looks = wardrobe_service.get_user_looks(user_id)
        
        return {
            "looks": [
                {
                    "look_id": str(look.id),
                    "name": look.name,
                    "dominant_style": look.dominant_style,
                    "occasion_tags": look.occasion_tags,
                    "seasonality": look.seasonality,
                    "color_palette": look.color_palette,
                    "pattern_mix": look.pattern_mix,
                    "silhouette": look.silhouette,
                    "layering_level": look.layering_level,
                    "image_url": look.image_url,
                    "rating": look.rating,
                    "is_favorite": look.is_favorite,
                    "wear_count": look.wear_count,
                    "created_at": look.created_at.isoformat() if look.created_at else None
                }
                for look in looks
            ]
        }
        
    except Exception as e:
        print(f"Erreur lors de la récupération des tenues: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


class UpdateClothingItemRequest(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    colors: Optional[Dict[str, List[str]]] = None
    material: Optional[str] = None
    pattern: Optional[str] = None
    fit: Optional[str] = None
    details: Optional[List[str]] = None
    style_tags: Optional[List[str]] = None
    occasion_tags: Optional[List[str]] = None
    seasonality: Optional[List[str]] = None
    is_favorite: Optional[bool] = None


@app.put("/wardrobe/items/{item_id}")
async def update_clothing_item(
    item_id: UUID,
    request: UpdateClothingItemRequest,
    db = Depends(get_db)
):
    """Met à jour un vêtement existant"""
    try:
        # Récupérer l'item existant
        item = db.query(ClothingItem).filter_by(id=item_id).first()
        
        if not item:
            raise HTTPException(status_code=404, detail="Vêtement non trouvé")
        
        # Mettre à jour les champs fournis
        if request.name is not None:
            item.name = request.name
        if request.brand is not None:
            item.brand = request.brand
        if request.colors is not None:
            item.colors = request.colors
        if request.material is not None:
            item.material = request.material
        if request.pattern is not None:
            item.pattern = request.pattern
        if request.fit is not None:
            item.fit = request.fit
        if request.details is not None:
            item.details = request.details
        if request.style_tags is not None:
            item.style_tags = request.style_tags
        if request.occasion_tags is not None:
            item.occasion_tags = request.occasion_tags
        if request.seasonality is not None:
            item.seasonality = request.seasonality
        if request.is_favorite is not None:
            item.is_favorite = request.is_favorite
        
        db.commit()
        db.refresh(item)
        
        return {
            "piece_id": str(item.id),
            "piece_type": item.piece_type,
            "name": item.name,
            "colors": item.colors,
            "material": item.material,
            "pattern": item.pattern,
            "fit": item.fit,
            "details": item.details,
            "style_tags": item.style_tags,
            "occasion_tags": item.occasion_tags,
            "seasonality": item.seasonality,
            "image_url": item.image_url,
            "is_favorite": item.is_favorite,
            "wear_count": item.wear_count,
            "brand": item.brand,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erreur lors de la mise à jour: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8045)