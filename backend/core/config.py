"""
Configuration centralisée de l'application
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Configuration globale de l'application"""
    
    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://localhost/app_vetements")
    
    # API Settings
    API_VERSION: str = "v1"
    API_PREFIX: str = "/api"
    
    # CORS
    ALLOWED_ORIGINS: list = ["*"]  # À restreindre en production
    
    # Weather API
    DEFAULT_CITY: str = "Paris"
    DEFAULT_COUNTRY_CODE: str = "FR"
    
    # AI Model
    AI_MODEL: str = "gpt-4o"
    AI_MAX_TOKENS: int = 1000
    AI_TEMPERATURE: float = 0.7

settings = Settings()