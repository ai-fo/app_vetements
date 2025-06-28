"""
Service d'analyse de tenues
"""
from ...services.clothing_analyzer import ClothingAnalyzer
from openai import OpenAI
from ...core.config import settings

class OutfitAnalysisService:
    """Service pour l'analyse d'images de vêtements"""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.analyzer = ClothingAnalyzer(self.client)
    
    def analyze_image(self, base64_image: str, is_single_piece: bool):
        """Analyse une image de vêtement ou tenue"""
        return self.analyzer.analyze_image(base64_image, is_single_piece)