from typing import List, Optional, Dict, Literal
from pydantic import BaseModel, Field
from uuid import UUID


class PieceColors(BaseModel):
    primary: List[str]
    secondary: Optional[List[str]] = []


class BoundingBox(BaseModel):
    """Coordonnées de délimitation d'un vêtement dans l'image (format normalisé 0-1)"""
    x: float = Field(..., ge=0, le=1, description="Position X du coin supérieur gauche (0-1)")
    y: float = Field(..., ge=0, le=1, description="Position Y du coin supérieur gauche (0-1)")
    width: float = Field(..., ge=0, le=1, description="Largeur de la zone (0-1)")
    height: float = Field(..., ge=0, le=1, description="Hauteur de la zone (0-1)")


class PieceAttributes(BaseModel):
    colors: PieceColors
    material: str
    pattern: str
    fit: str
    details: List[str] = []


class ClothingPiece(BaseModel):
    piece_id: UUID
    piece_type: str  # tshirt, shirt, blazer, pants, etc.
    name: str  # Nom descriptif généré par l'IA (ex: "Chemise blanche à col italien")
    attributes: PieceAttributes
    style_tags: List[str]
    occasion_tags: List[str]
    seasonality: List[Literal["spring", "summer", "fall", "winter"]]
    bounding_box: Optional[BoundingBox] = None  # Coordonnées dans l'image (seulement pour tenues complètes)


class SinglePieceResponse(BaseModel):
    capture_type: Literal["single_piece"]
    pieces: List[ClothingPiece]


class ColorPaletteGlobal(BaseModel):
    primary: List[str]
    accent: Optional[List[str]] = []


class LookMeta(BaseModel):
    look_id: UUID
    dominant_style: List[str]
    occasion_tags: List[str]
    seasonality: List[Literal["spring", "summer", "fall", "winter"]]
    color_palette_global: ColorPaletteGlobal
    pattern_mix: List[str]
    silhouette: Optional[str] = None
    layering_level: Optional[int] = Field(None, ge=1, le=5)


class CompleteLookResponse(BaseModel):
    capture_type: Literal["complete_look"]
    pieces: List[ClothingPiece]
    look_meta: LookMeta