"""
Routes pour l'analyse de tenues
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional, Union
from PIL import Image
import io
import base64

from ...schemas.clothing_analysis import SinglePieceResponse, CompleteLookResponse
from .service import OutfitAnalysisService

router = APIRouter(prefix="/outfit-analysis", tags=["outfit-analysis"])
service = OutfitAnalysisService()

@router.post("/analyze", response_model=Union[SinglePieceResponse, CompleteLookResponse])
async def analyze_outfit(
    file: UploadFile = File(...), 
    item_type: Optional[str] = None
):
    """Analyse une photo de vêtement ou de tenue complète"""
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
        
        # Utiliser le service pour analyser l'image
        result = service.analyze_image(base64_image, is_single_piece)
        
        return result
        
    except Exception as e:
        print(f"Erreur détaillée dans analyze_outfit: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))