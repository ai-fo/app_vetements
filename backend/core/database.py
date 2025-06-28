"""
Configuration de la base de données
"""
from database.connection import SessionLocal

def get_db():
    """Générateur de session de base de données"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()