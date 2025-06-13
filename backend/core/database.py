from supabase import create_client, Client
from backend.core.config import settings
from typing import Optional

class Database:
    _instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Client:
        if cls._instance is None:
            if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
                raise ValueError("Supabase credentials not configured")
            
            cls._instance = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY
            )
        
        return cls._instance

# Singleton instance
db = Database()