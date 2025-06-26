from typing import List, Optional, Dict, Literal
from pydantic import BaseModel, Field
from uuid import UUID


class PieceColors(BaseModel):
    primary: List[str]
    secondary: Optional[List[str]] = []


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
    silhouette: str
    layering_level: int = Field(..., ge=1, le=5)


class CompleteLookResponse(BaseModel):
    capture_type: Literal["complete_look"]
    pieces: List[ClothingPiece]
    look_meta: LookMeta