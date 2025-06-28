"""
Application principale - Architecture modulaire
"""
from fastapi import FastAPI, Request, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from uuid import UUID

# Import des modules
from modules.outfit_analysis import router as outfit_analysis_router
from modules.wardrobe import router as wardrobe_router
from modules.recommendations import router as recommendations_router

# Import de la configuration
from core.config import settings
from core.database import get_db

# Créer l'application FastAPI
app = FastAPI(
    title="AI Fashion Assistant API",
    version="1.0.0",
    description="API modulaire pour l'assistant mode IA"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrer les routes des modules
app.include_router(
    outfit_analysis_router,
    prefix=f"{settings.API_PREFIX}",
)

app.include_router(
    wardrobe_router,
    prefix=f"{settings.API_PREFIX}",
)

app.include_router(
    recommendations_router,
    prefix=f"{settings.API_PREFIX}",
)

# Routes de base
@app.get("/")
async def root():
    return {
        "message": "AI Fashion Assistant API",
        "version": "1.0.0",
        "modules": ["outfit-analysis", "wardrobe", "recommendations"]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Routes de compatibilité pour l'ancien système
@app.post("/analyze-outfit")
async def analyze_outfit_legacy(
    file: UploadFile = File(...), 
    item_type: Optional[str] = None
):
    """Route de compatibilité - redirige vers le nouveau endpoint"""
    from modules.outfit_analysis.router import analyze_outfit
    return await analyze_outfit(file=file, item_type=item_type)

@app.post("/daily-recommendations")
async def daily_recommendations_legacy(request: Request):
    """Route de compatibilité - redirige vers le nouveau endpoint"""
    from modules.recommendations.router import DailyRecommendationRequest, get_daily_recommendations
    # Récupérer le body de la requête
    body = await request.json()
    # Convertir le dict en modèle Pydantic
    recommendation_request = DailyRecommendationRequest(**body)
    return await get_daily_recommendations(recommendation_request)

@app.post("/save-clothing")
async def save_clothing_legacy(request: Request, db = Depends(get_db)):
    """Route de compatibilité - redirige vers le nouveau endpoint"""
    from modules.wardrobe.router import save_clothing, SaveClothingRequest
    body = await request.json()
    save_request = SaveClothingRequest(**body)
    return await save_clothing(request=save_request, db=db)

@app.get("/wardrobe/{user_id}/pieces")
async def get_user_pieces_legacy(
    user_id: UUID,
    piece_type: Optional[str] = None,
    db = Depends(get_db)
):
    """Route de compatibilité - redirige vers le nouveau endpoint"""
    from modules.wardrobe.router import get_user_pieces
    return await get_user_pieces(user_id=user_id, piece_type=piece_type, db=db)

@app.get("/wardrobe/{user_id}/looks")
async def get_user_looks_legacy(
    user_id: UUID,
    db = Depends(get_db)
):
    """Route de compatibilité - redirige vers le nouveau endpoint"""
    from modules.wardrobe.router import get_user_looks
    return await get_user_looks(user_id=user_id, db=db)

@app.put("/wardrobe/items/{item_id}")
async def update_clothing_item_legacy(
    item_id: UUID,
    request: Request,
    db = Depends(get_db)
):
    """Route de compatibilité - redirige vers le nouveau endpoint"""
    from modules.wardrobe.router import update_clothing_item, UpdateClothingItemRequest
    body = await request.json()
    update_request = UpdateClothingItemRequest(**body)
    return await update_clothing_item(item_id=item_id, request=update_request, db=db)

@app.post("/generate-outfit-suggestions")
async def generate_suggestions_legacy(request: Request):
    """Route de compatibilité - redirige vers le nouveau endpoint"""
    from modules.recommendations.router import generate_suggestions
    preferences = await request.json()
    return await generate_suggestions(preferences=preferences)

@app.post("/match-outfit")
async def match_outfit_legacy(request: Request):
    """Route de compatibilité - redirige vers le nouveau endpoint"""
    from modules.recommendations.router import match_outfit
    body = await request.json()
    return await match_outfit(request=body)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8045)