# Backend Python avec OpenAI

## Installation

1. Créer un environnement virtuel :
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

2. Installer les dépendances :
```bash
pip install -r requirements.txt
```

3. Configuration :
```bash
cp .env.example .env
# Ajouter votre clé OpenAI dans le fichier .env
```

## Lancement

```bash
uvicorn main:app --reload
```

Le serveur sera accessible sur http://localhost:8045

## Endpoints

- `POST /analyze-outfit` : Analyse une image de tenue
- `POST /generate-outfit-suggestions` : Génère des suggestions de tenues
- `POST /match-outfit` : Trouve des combinaisons dans la garde-robe

## Test

Pour tester l'analyse d'image :
```bash
curl -X POST "http://localhost:8045/analyze-outfit" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/image.jpg"
```