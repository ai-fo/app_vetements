from typing import Optional, Dict, Any
from backend.core.database import db

class AuthService:
    def __init__(self):
        self.client = db.get_client()
    
    async def login(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate user with Supabase
        """
        try:
            response = self.client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if response.user:
                return {
                    "access_token": response.session.access_token,
                    "refresh_token": response.session.refresh_token,
                    "user": {
                        "id": response.user.id,
                        "email": response.user.email,
                        "created_at": response.user.created_at
                    }
                }
            return None
        except Exception as e:
            print(f"Login error: {e}")
            return None
    
    async def register(self, email: str, password: str, full_name: str) -> Optional[Dict[str, Any]]:
        """
        Register new user with Supabase
        """
        try:
            response = self.client.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "full_name": full_name
                    }
                }
            })
            
            if response.user:
                return {
                    "access_token": response.session.access_token if response.session else None,
                    "refresh_token": response.session.refresh_token if response.session else None,
                    "user": {
                        "id": response.user.id,
                        "email": response.user.email,
                        "created_at": response.user.created_at
                    },
                    "confirmation_sent": True
                }
            return None
        except Exception as e:
            print(f"Registration error: {e}")
            return None