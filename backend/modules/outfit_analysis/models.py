from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class TemperatureRange(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None

class Weather(BaseModel):
    temperature: TemperatureRange
    conditions: List[str] = []

class ComfortRating(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=10)
    notes: str = ""

class Colors(BaseModel):
    primary: List[str] = []
    secondary: List[str] = []
    accent: List[str] = []

class ClothingItem(BaseModel):
    type: str              # t-shirt, pantalon, chaussures, etc.
    color: str
    brand: Optional[str] = None
    material: Optional[str] = None
    pattern: Optional[str] = None  # uni, rayé, à motifs, etc.

class AnalyzeRequest(BaseModel):
    analysis_id: str
    image_url: str

class OutfitAnalysis(BaseModel):
    # Analyse des couleurs
    colors: Colors
    
    # Caractéristiques générales
    category: str          # casual, formal, sport, etc.
    style: str            # moderne, classique, streetwear, etc.
    formality: int = Field(ge=1, le=10)
    versatility: int = Field(ge=1, le=10)
    
    # Vêtements détectés
    items: List[ClothingItem]
    
    # Contexte d'utilisation
    occasions: List[str]   # travail, soirée, sport, etc.
    seasons: List[str]     # été, hiver, mi-saison, etc.
    weather: Weather
    
    # Évaluation
    comfort: ComfortRating
    
    # Matériaux et entretien
    materials: List[str] = []
    care_instructions: List[str] = []
    
    # Recommandations
    matching_suggestions: List[str] = []
    improvements: List[str] = []
    
    # Métadonnées
    analysis_confidence: float = Field(ge=0, le=100)
    ai_analysis: Optional[Dict[str, Any]] = None

class AnalysisResponse(BaseModel):
    id: str
    status: ProcessingStatus
    message: str
    analysis: Optional[OutfitAnalysis] = None

class AnalysisStatusResponse(BaseModel):
    id: str
    status: ProcessingStatus
    progress: Optional[int] = None
    message: Optional[str] = None