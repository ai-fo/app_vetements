"""
Routes pour les recommandations quotidiennes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from .service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["recommendations"])
service = RecommendationService()

class DailyRecommendationRequest(BaseModel):
    city: Optional[str] = "Paris"
    country_code: Optional[str] = "FR"
    wardrobe_items: List[Dict[str, Any]] = []
    user_needs: Optional[str] = None
    current_season: Optional[str] = None
    recently_worn_ids: List[str] = []
    recently_recommended_ids: List[str] = []
    recently_recommended_combos: List[str] = []

@router.post("/daily")
async def get_daily_recommendations(request: DailyRecommendationRequest):
    """Génère des recommandations quotidiennes basées sur la météo et la garde-robe"""
    try:
        result = await service.get_daily_recommendations(request)
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erreur dans daily_recommendations: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match")
async def match_outfit(request: Dict[str, Any]):
    """Trouve les meilleures combinaisons pour un article"""
    try:
        result = await service.match_outfit(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggestions")
async def generate_suggestions(preferences: Dict[str, Any]):
    """Génère des suggestions de tenues basées sur les préférences"""
    try:
        result = await service.generate_suggestions(preferences)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))