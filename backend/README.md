# Backend - Vêtements API

Backend Python modulaire pour l'application de vêtements.

## Architecture

```
backend/
├── modules/          # Modules métier autonomes
│   ├── auth/        # Authentification
│   ├── catalog/     # Catalogue produits
│   ├── cart/        # Panier
│   ├── ai/          # Intelligence artificielle
│   └── user/        # Gestion utilisateurs
├── core/            # Noyau de l'application
│   ├── config.py    # Configuration
│   └── database.py  # Connexion DB
└── main.py          # Point d'entrée FastAPI
```

## Installation

```bash
# Créer environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer dépendances
pip install -r requirements.txt
```

## Configuration

Créer un fichier `.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## Lancement

```bash
# Développement
uvicorn backend.main:app --reload

# Production
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## Tests

```bash
# Tous les tests
pytest

# Avec coverage
pytest --cov=backend

# Module spécifique
pytest backend/modules/auth/tests/
```

## Ajout d'un module

1. Créer le dossier dans `modules/`
2. Structure standard:
   - `__init__.py` - Exports
   - `router.py` - Endpoints API
   - `service.py` - Logique métier
   - `models.py` - Modèles Pydantic
   - `tests/` - Tests unitaires

3. Importer dans `main.py`