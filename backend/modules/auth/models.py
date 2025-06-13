from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class User(BaseModel):
    id: str
    email: str
    created_at: datetime
    full_name: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: Dict[str, Any]
    token_type: str = "bearer"