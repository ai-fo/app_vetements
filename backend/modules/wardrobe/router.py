"""
Routes pour la gestion de garde-robe
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Union
from uuid import UUID

from ...schemas.clothing_analysis import SinglePieceResponse, CompleteLookResponse
from ...database.models import ClothingItem
from ...core.database import get_db
from .service import WardrobeServiceModule

router = APIRouter(prefix="/wardrobe", tags=["wardrobe"])

class SaveClothingRequest(BaseModel):
    user_id: UUID
    analysis_result: Union[SinglePieceResponse, CompleteLookResponse]
    image_urls: Optional[List[str]] = None

class UpdateClothingItemRequest(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    colors: Optional[dict] = None
    material: Optional[str] = None
    pattern: Optional[str] = None
    fit: Optional[str] = None
    details: Optional[List[str]] = None
    style_tags: Optional[List[str]] = None
    occasion_tags: Optional[List[str]] = None
    seasonality: Optional[List[str]] = None
    is_favorite: Optional[bool] = None

@router.post("/save")
async def save_clothing(
    request: SaveClothingRequest,
    db = Depends(get_db)
):
    """Sauvegarde les vêtements analysés"""
    try:
        service = WardrobeServiceModule(db)
        
        if request.analysis_result.capture_type == "single_piece":
            result = service.save_single_piece(
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
            result = await service.save_complete_look(
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

@router.get("/{user_id}/pieces")
async def get_user_pieces(
    user_id: UUID,
    piece_type: Optional[str] = None,
    db = Depends(get_db)
):
    """Récupère les pièces de vêtements d'un utilisateur"""
    try:
        service = WardrobeServiceModule(db)
        pieces = service.get_user_pieces(user_id, piece_type)
        
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

@router.get("/{user_id}/looks")
async def get_user_looks(
    user_id: UUID,
    db = Depends(get_db)
):
    """Récupère les tenues complètes d'un utilisateur"""
    try:
        service = WardrobeServiceModule(db)
        looks = service.get_user_looks(user_id)
        
        return {
            "looks": [
                {
                    "id": str(look.id),
                    "user_id": str(look.user_id),
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
                    "created_at": look.created_at.isoformat() if look.created_at else None,
                    "pieces": [
                        {
                            "id": str(item.item_id),
                            "position": item.position,
                            "bounding_box": item.bounding_box,
                            "piece_type": item.item.piece_type if hasattr(item, 'item') and item.item else None,
                            "name": item.item.name if hasattr(item, 'item') and item.item else None,
                            "colors": item.item.colors if hasattr(item, 'item') and item.item else None,
                            "image_url": item.item.image_url if hasattr(item, 'item') and item.item else None
                        }
                        for item in look.items
                    ] if hasattr(look, 'items') and look.items else []
                }
                for look in looks
            ]
        }
        
    except Exception as e:
        print(f"Erreur lors de la récupération des tenues: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/items/{item_id}")
async def update_clothing_item(
    item_id: UUID,
    request: UpdateClothingItemRequest,
    db = Depends(get_db)
):
    """Met à jour un vêtement existant"""
    try:
        item = db.query(ClothingItem).filter_by(id=item_id).first()
        
        if not item:
            raise HTTPException(status_code=404, detail="Vêtement non trouvé")
        
        # Mettre à jour les champs fournis
        update_data = request.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)
        
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