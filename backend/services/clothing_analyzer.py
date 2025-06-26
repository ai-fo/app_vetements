import json
import uuid
from typing import Dict, List, Union
from openai import OpenAI
from schemas.clothing_analysis import (
    SinglePieceResponse,
    CompleteLookResponse,
    ClothingPiece,
    PieceAttributes,
    PieceColors,
    LookMeta,
    ColorPaletteGlobal
)


class ClothingAnalyzer:
    def __init__(self, openai_client: OpenAI):
        self.client = openai_client
    
    def analyze_image(self, image_base64: str, is_single_piece: bool) -> Union[SinglePieceResponse, CompleteLookResponse]:
        """Analyse une image et retourne la structure appropriée selon le type"""
        
        prompt = self._get_prompt(is_single_piece)
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": prompt
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Analyse cette image et retourne UNIQUEMENT le JSON demandé, sans aucun texte supplémentaire."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1500,
                temperature=0.3
            )
        except Exception as e:
            print(f"Erreur lors de l'appel à OpenAI: {type(e).__name__}: {str(e)}")
            raise ValueError(f"Erreur de communication avec OpenAI: {str(e)}")
        
        # Nettoyer la réponse JSON
        json_str = response.choices[0].message.content.strip()
        print(f"Réponse brute de GPT-4: {json_str[:500]}...")  # Debug
        
        if not json_str:
            raise ValueError("GPT-4 a retourné une réponse vide")
            
        if json_str.startswith("```json"):
            json_str = json_str[7:]
        if json_str.endswith("```"):
            json_str = json_str[:-3]
        
        json_str = json_str.strip()
        
        # Parser et valider avec les modèles Pydantic
        try:
            data = json.loads(json_str)
        except json.JSONDecodeError as e:
            print(f"Erreur de parsing JSON: {e}")
            print(f"Contenu problématique: {json_str[:200]}...")
            raise ValueError(f"Impossible de parser la réponse JSON: {e}")
        
        # Générer les UUIDs côté serveur (pas par GPT-4)
        if is_single_piece:
            return self._build_single_piece_response(data)
        else:
            return self._build_complete_look_response(data)
    
    def _get_prompt(self, is_single_piece: bool) -> str:
        """Retourne le prompt approprié selon le type d'analyse"""
        
        base_instructions = """Tu es un expert en mode et style vestimentaire. 
Analyse l'image fournie et retourne UNIQUEMENT un objet JSON structuré.

VALEURS NORMALISÉES :
- Colors: white, black, grey, light-grey, dark-grey, navy, blue, light-blue, red, burgundy, pink, green, khaki, olive, yellow, orange, purple, brown, beige, cream
- Materials: coton, laine, denim, cuir, synthétique, lin, soie, velours, cachemire, polyester, nylon
- Patterns: uni, rayé, carreaux, fleuri, logo, imprimé, graphique, camouflage, pois, géométrique
- Fits: slim, regular, loose, oversized, skinny, relaxed, straight, tapered
- Styles: casual, formel, sportif, streetwear, chic, bohème, minimaliste, rock, vintage, preppy, workwear
- Occasions: travail, soirée, weekend, sport, casual, cérémonie, vacances, quotidien
- Seasons: spring, summer, fall, winter

TYPES DE PIÈCES :
- Hauts: tshirt, shirt, sweater, pullover, hoodie, jacket, blazer, coat, vest
- Bas: pants, jeans, shorts, skirt, dress
- Chaussures: shoes, sneakers, boots, sandals
- Accessoires: bag, belt, hat, scarf, jewelry
"""
        
        if is_single_piece:
            return base_instructions + """
CONSIGNE : Analyse la pièce de vêtement UNIQUE visible dans l'image.

Retourne ce JSON EXACT :
{
  "capture_type": "single_piece",
  "pieces": [
    {
      "piece_type": "[type exact de la pièce]",
      "attributes": {
        "colors": {
          "primary": ["couleur1"],
          "secondary": ["couleur2"] 
        },
        "material": "[matière principale]",
        "pattern": "[motif]",
        "fit": "[coupe]",
        "details": ["détail1", "détail2"]
      },
      "style_tags": ["style1", "style2"],
      "occasion_tags": ["occasion1"],
      "seasonality": ["season1", "season2"]
    }
  ]
}"""
        else:
            return base_instructions + """
CONSIGNE : Analyse la TENUE COMPLÈTE visible dans l'image. Identifie TOUTES les pièces.

Retourne ce JSON EXACT :
{
  "capture_type": "complete_look",
  "pieces": [
    {
      "piece_type": "[type exact de la pièce 1]",
      "attributes": {
        "colors": {
          "primary": ["couleur1"],
          "secondary": ["couleur2"]
        },
        "material": "[matière]",
        "pattern": "[motif]",
        "fit": "[coupe]",
        "details": ["détail1"]
      },
      "style_tags": ["style1"],
      "occasion_tags": ["occasion1"],
      "seasonality": ["season1", "season2"]
    },
    {
      "piece_type": "[type exact de la pièce 2]",
      "attributes": {
        "colors": {
          "primary": ["couleur1"],
          "secondary": []
        },
        "material": "[matière]",
        "pattern": "[motif]",
        "fit": "[coupe]",
        "details": []
      },
      "style_tags": ["style1"],
      "occasion_tags": ["occasion1"],
      "seasonality": ["season1", "season2"]
    }
  ],
  "look_meta": {
    "dominant_style": ["style principal"],
    "occasion_tags": ["occasion globale"],
    "seasonality": ["season1", "season2"],
    "color_palette_global": {
      "primary": ["couleur1", "couleur2"],
      "accent": ["couleur_accent"]
    },
    "pattern_mix": ["pattern1", "pattern2"],
    "silhouette": "slim_top_loose_bottom",
    "layering_level": 1
  }
}"""
    
    def _build_single_piece_response(self, data: Dict) -> SinglePieceResponse:
        """Construit la réponse pour une pièce unique avec UUID généré"""
        
        pieces = []
        for piece_data in data.get("pieces", []):
            piece = ClothingPiece(
                piece_id=uuid.uuid4(),  # UUID généré côté serveur
                piece_type=piece_data["piece_type"],
                attributes=PieceAttributes(**piece_data["attributes"]),
                style_tags=piece_data["style_tags"],
                occasion_tags=piece_data["occasion_tags"],
                seasonality=piece_data["seasonality"]
            )
            pieces.append(piece)
        
        return SinglePieceResponse(
            capture_type="single_piece",
            pieces=pieces
        )
    
    def _build_complete_look_response(self, data: Dict) -> CompleteLookResponse:
        """Construit la réponse pour une tenue complète avec UUIDs générés"""
        
        pieces = []
        for piece_data in data.get("pieces", []):
            piece = ClothingPiece(
                piece_id=uuid.uuid4(),  # UUID généré côté serveur
                piece_type=piece_data["piece_type"],
                attributes=PieceAttributes(**piece_data["attributes"]),
                style_tags=piece_data["style_tags"],
                occasion_tags=piece_data["occasion_tags"],
                seasonality=piece_data["seasonality"]
            )
            pieces.append(piece)
        
        # Construire les métadonnées du look
        look_meta_data = data.get("look_meta", {})
        look_meta = LookMeta(
            look_id=uuid.uuid4(),  # UUID généré côté serveur
            dominant_style=look_meta_data["dominant_style"],
            occasion_tags=look_meta_data["occasion_tags"],
            seasonality=look_meta_data["seasonality"],
            color_palette_global=ColorPaletteGlobal(**look_meta_data["color_palette_global"]),
            pattern_mix=look_meta_data["pattern_mix"],
            silhouette=look_meta_data["silhouette"],
            layering_level=look_meta_data["layering_level"]
        )
        
        return CompleteLookResponse(
            capture_type="complete_look",
            pieces=pieces,
            look_meta=look_meta
        )