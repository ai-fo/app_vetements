from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from openai import OpenAI
import os
from dotenv import load_dotenv
import base64
from PIL import Image
import io
import json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class OutfitAnalysisRequest(BaseModel):
    image_url: str
    user_preferences: Dict[str, Any] = {}

@app.get("/")
async def root():
    return {"message": "AI Fashion Assistant API"}

@app.post("/analyze-outfit")
async def analyze_outfit(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        base64_image = base64.b64encode(contents).decode('utf-8')
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un expert en mode et styliste professionnel. Analyse les vêtements avec précision. Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """Analyse cette image de vêtement(s). Identifie TOUTES les pièces visibles et retourne UNIQUEMENT ce JSON:
{
  "type": "outfit" ou "single_piece",
  "style": "casual/formel/sportif/streetwear/chic/bohème/minimaliste/etc",
  "category": "quotidien/soirée/sport/travail/décontracté",
  "colors": {"primary": ["couleur1", "couleur2"], "secondary": ["couleur3"]},
  "material": "coton/laine/denim/cuir/synthétique/etc",
  "pattern": "uni/rayé/fleuri/à carreaux/imprimé/etc",
  "occasion": "travail/sport/soirée/weekend/casual/etc",
  "season": ["spring", "summer", "fall", "winter"],
  "care_instructions": "laver à 30°/nettoyage à sec/etc",
  "brand_style": "casual/luxe/sportswear/fast-fashion/designer",
  "recommendations": ["suggestion1 détaillée", "suggestion2 détaillée"],
  "confidence": 0.85,
  "pieces": [
    {
      "type": "top/bottom/outerwear/dress/shoes/accessory",
      "name": "Nom descriptif de la pièce",
      "color": "couleur principale",
      "material": "matière",
      "brand_estimation": null,
      "price_range": "50-150€",
      "style": "style de la pièce",
      "fit": "slim/regular/loose/oversized"
    }
  ]
}

RÈGLES IMPORTANTES:
1. Le champ "pieces" doit TOUJOURS contenir au moins 1 élément
2. Si c'est une seule pièce visible, pieces contiendra 1 élément
3. Si c'est une tenue complète (personne habillée), pieces doit contenir TOUTES les pièces visibles: haut, bas, chaussures, accessoires, etc.
4. NE JAMAIS mettre brand_estimation - toujours null
5. type = "outfit" si plusieurs pièces forment une tenue, "single_piece" si c'est un vêtement isolé"""
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=800
        )
        
        # Log de la réponse pour debug
        raw_content = response.choices[0].message.content
        print(f"Réponse OpenAI: {raw_content}")
        
        try:
            result = json.loads(raw_content)
        except json.JSONDecodeError:
            # Si ce n'est pas du JSON, essayer de nettoyer
            cleaned = raw_content.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            result = json.loads(cleaned.strip())
        
        # S'assurer que pieces existe toujours
        if "pieces" not in result:
            result["pieces"] = []
            
        # S'assurer que season est toujours un tableau
        if isinstance(result.get("season"), str):
            result["season"] = [result["season"]]
        
        return result
        
    except Exception as e:
        print(f"Erreur détaillée dans analyze_outfit: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-outfit-suggestions")
async def generate_suggestions(preferences: Dict[str, Any]):
    try:
        prompt = f"Suggère 5 tenues basées sur ces préférences: {preferences}"
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un styliste personnel. Fournis des suggestions de tenues détaillées."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=1000
        )
        
        return {"suggestions": response.choices[0].message.content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match-outfit")
async def match_outfit(request: Dict[str, Any]):
    try:
        item = request.get("item", {})
        wardrobe = request.get("wardrobe", [])
        
        prompt = f"Pour cet article {item}, trouve les meilleures combinaisons parmi: {wardrobe}"
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un expert en coordination de tenues. Trouve les meilleures combinaisons."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=800
        )
        
        return {"matches": response.choices[0].message.content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8045)