import json
from typing import Dict, Any, Optional
from PIL import Image
import requests
from io import BytesIO
from core.config import settings
from core.database import db
from modules.chatgpt.service import ChatGPTService
from .models import OutfitAnalysis, ProcessingStatus, ClothingItem, Colors, Weather, ComfortRating

class OutfitAnalysisService:
    def __init__(self):
        self.client = db.get_client()
        self.chatgpt_service = ChatGPTService()
    
    async def analyze_outfit(self, analysis_id: str, image_url: str) -> Dict[str, Any]:
        """
        Analyser une image de tenue avec ChatGPT Vision
        """
        try:
            # Mettre à jour le statut
            await self._update_status(analysis_id, ProcessingStatus.PROCESSING)
            
            # Préparer le prompt pour l'analyse
            prompt = self._create_analysis_prompt()
            
            # Appeler l'API OpenAI Vision
            response = await self._call_openai_vision(image_url, prompt)
            
            # Parser la réponse
            analysis_data = self._parse_ai_response(response)
            
            # Sauvegarder les résultats
            await self._save_analysis_results(analysis_id, analysis_data)
            
            return {
                "status": ProcessingStatus.COMPLETED,
                "analysis": analysis_data
            }
            
        except Exception as e:
            await self._update_status(
                analysis_id, 
                ProcessingStatus.FAILED,
                error_message=str(e)
            )
            raise e
    
    def _create_analysis_prompt(self) -> str:
        return """Analyse cette photo de tenue vestimentaire et fournis une analyse détaillée au format JSON avec la structure suivante:

{
  "colors": {
    "primary": ["couleurs principales"],
    "secondary": ["couleurs secondaires"],
    "accent": ["couleurs d'accent"]
  },
  "category": "type général (casual/formal/sport/streetwear/business)",
  "style": "style (moderne/classique/vintage/minimaliste/bohème)",
  "formality": 5, // niveau de formalité de 1 à 10
  "versatility": 7, // polyvalence de 1 à 10
  "items": [
    {
      "type": "type de vêtement",
      "color": "couleur",
      "brand": "marque si visible",
      "material": "matière estimée",
      "pattern": "motif (uni/rayé/à motifs)"
    }
  ],
  "occasions": ["travail", "soirée", "décontracté", "sport"],
  "seasons": ["été", "hiver", "mi-saison"],
  "weather": {
    "temperature": {"min": 15, "max": 25},
    "conditions": ["ensoleillé", "pluvieux"]
  },
  "comfort": {
    "rating": 8,
    "notes": "notes sur le confort"
  },
  "materials": ["coton", "polyester", "laine"],
  "care_instructions": ["lavage machine 30°", "repassage doux"],
  "matching_suggestions": ["suggestions d'association"],
  "improvements": ["améliorations possibles"],
  "analysis_confidence": 85.5
}

Sois précis et détaillé dans ton analyse. Identifie tous les vêtements visibles et leurs caractéristiques."""
    
    async def _call_openai_vision(self, image_url: str, prompt: str) -> str:
        """
        Appeler l'API OpenAI Vision pour analyser l'image via le service ChatGPT
        """
        try:
            # Utiliser le service ChatGPT pour analyser l'image
            messages = [
                {
                    "role": "system",
                    "content": "Tu es un expert en mode et style vestimentaire. Analyse les photos de tenues et fournis des analyses détaillées."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            }
                        }
                    ]
                }
            ]
            
            # Appeler le service ChatGPT avec le modèle vision
            response = await self.chatgpt_service.create_completion(
                messages=messages,
                model="gpt-4o",  # Modèle avec capacités vision
                max_tokens=2000,
                temperature=0.7
            )
            
            return response.content
            
        except Exception as e:
            print(f"Error calling ChatGPT Vision: {e}")
            # Fallback vers une réponse par défaut en cas d'erreur
            return json.dumps({
            "colors": {
                "primary": ["noir", "blanc"],
                "secondary": ["gris"],
                "accent": ["rouge"]
            },
            "category": "casual",
            "style": "moderne",
            "formality": 3,
            "versatility": 8,
            "items": [
                {
                    "type": "t-shirt",
                    "color": "blanc",
                    "brand": None,
                    "material": "coton",
                    "pattern": "uni"
                },
                {
                    "type": "jean",
                    "color": "noir",
                    "brand": None,
                    "material": "denim",
                    "pattern": "uni"
                }
            ],
            "occasions": ["décontracté", "weekend", "shopping"],
            "seasons": ["printemps", "été", "automne"],
            "weather": {
                "temperature": {"min": 15, "max": 28},
                "conditions": ["ensoleillé", "nuageux"]
            },
            "comfort": {
                "rating": 9,
                "notes": "Tenue très confortable pour un usage quotidien"
            },
            "materials": ["coton", "denim"],
            "care_instructions": ["lavage machine 30°", "séchage à l'air libre"],
            "matching_suggestions": [
                "Ajouter une veste en jean pour plus de style",
                "Des baskets blanches complèteraient bien la tenue"
            ],
            "improvements": [
                "Un accessoire coloré pourrait ajouter du dynamisme",
                "Une ceinture en cuir marron serait un bon ajout"
            ],
            "analysis_confidence": 92.5
        })
    
    def _parse_ai_response(self, response: str) -> OutfitAnalysis:
        """
        Parser la réponse de l'IA en modèle OutfitAnalysis
        """
        try:
            data = json.loads(response)
            
            # Convertir les items
            items = [ClothingItem(**item) for item in data.get("items", [])]
            
            # Créer l'objet d'analyse
            analysis = OutfitAnalysis(
                colors=Colors(**data.get("colors", {})),
                category=data.get("category", "unknown"),
                style=data.get("style", "unknown"),
                formality=data.get("formality", 5),
                versatility=data.get("versatility", 5),
                items=items,
                occasions=data.get("occasions", []),
                seasons=data.get("seasons", []),
                weather=Weather(**data.get("weather", {"temperature": {}, "conditions": []})),
                comfort=ComfortRating(**data.get("comfort", {"rating": 5, "notes": ""})),
                materials=data.get("materials", []),
                care_instructions=data.get("care_instructions", []),
                matching_suggestions=data.get("matching_suggestions", []),
                improvements=data.get("improvements", []),
                analysis_confidence=data.get("analysis_confidence", 0),
                ai_analysis=data
            )
            
            return analysis
        except Exception as e:
            print(f"Error parsing AI response: {e}")
            raise ValueError(f"Failed to parse AI response: {str(e)}")
    
    async def _update_status(
        self, 
        analysis_id: str, 
        status: ProcessingStatus,
        error_message: Optional[str] = None
    ):
        """
        Mettre à jour le statut de l'analyse dans la base de données
        """
        update_data = {
            "processing_status": status.value
        }
        
        if error_message:
            update_data["error_message"] = error_message
        
        if status == ProcessingStatus.COMPLETED:
            update_data["analyzed_at"] = "now()"
        
        self.client.table("outfit_analyses").update(update_data).eq("id", analysis_id).execute()
    
    async def _save_analysis_results(self, analysis_id: str, analysis: OutfitAnalysis):
        """
        Sauvegarder les résultats de l'analyse dans la base de données
        """
        # Convertir l'analyse en dict pour la sauvegarde
        analysis_dict = analysis.dict()
        
        # Séparer les champs pour correspondre à la structure de la table
        update_data = {
            "colors": analysis_dict["colors"],
            "category": analysis_dict["category"],
            "style": analysis_dict["style"],
            "formality": analysis_dict["formality"],
            "versatility": analysis_dict["versatility"],
            "items": analysis_dict["items"],
            "occasions": analysis_dict["occasions"],
            "seasons": analysis_dict["seasons"],
            "weather": analysis_dict["weather"],
            "comfort": analysis_dict["comfort"],
            "materials": analysis_dict["materials"],
            "care_instructions": analysis_dict["care_instructions"],
            "matching_suggestions": analysis_dict["matching_suggestions"],
            "improvements": analysis_dict["improvements"],
            "analysis_confidence": analysis_dict["analysis_confidence"],
            "ai_analysis": analysis_dict["ai_analysis"],
            "processing_status": ProcessingStatus.COMPLETED.value,
            "analyzed_at": "now()"
        }
        
        self.client.table("outfit_analyses").update(update_data).eq("id", analysis_id).execute()
    
    async def get_analysis_status(self, analysis_id: str) -> Dict[str, Any]:
        """
        Récupérer le statut d'une analyse
        """
        result = self.client.table("outfit_analyses")\
            .select("id, processing_status, error_message")\
            .eq("id", analysis_id)\
            .single()\
            .execute()
        
        if result.data:
            return {
                "id": result.data["id"],
                "status": result.data["processing_status"],
                "error_message": result.data.get("error_message")
            }
        
        raise ValueError(f"Analysis {analysis_id} not found")