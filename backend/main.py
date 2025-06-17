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

class OutfitAnalysisResponse(BaseModel):
    type: str = "clothing"
    style: str
    category: str
    colors: Dict[str, List[str]]
    material: str = ""
    pattern: str = "uni"
    occasion: str
    season: str | List[str]
    care_instructions: str = ""
    brand_style: str = ""
    recommendations: List[str]
    confidence: float

@app.get("/")
async def root():
    return {"message": "AI Fashion Assistant API"}

@app.post("/analyze-outfit", response_model=OutfitAnalysisResponse)
async def analyze_outfit(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        base64_image = base64.b64encode(contents).decode('utf-8')
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un expert en mode. Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """Analyse ce vêtement et retourne UNIQUEMENT ce JSON:
{
  "type": "haut/bas/robe/veste/etc",
  "style": "casual/formel/sportif/etc",
  "category": "quotidien/soirée/sport/travail",
  "colors": {"primary": ["couleur1"], "secondary": ["couleur2"]},
  "material": "coton/laine/synthétique/etc",
  "pattern": "uni/rayé/fleuri/etc",
  "occasion": "travail/sport/soirée/etc",
  "season": "spring/summer/fall/winter",
  "care_instructions": "laver à 30°",
  "brand_style": "casual/luxe/sportswear",
  "recommendations": ["suggestion1", "suggestion2"],
  "confidence": 0.8
}"""
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
            max_tokens=300
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
        
        return OutfitAnalysisResponse(**result)
        
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