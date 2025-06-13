from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from .service import AuthService
from .models import UserLogin, UserRegister, TokenResponse

router = APIRouter()
auth_service = AuthService()

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin) -> Dict[str, Any]:
    """
    Authenticate user with email and password
    """
    result = await auth_service.login(credentials.email, credentials.password)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return result

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister) -> Dict[str, Any]:
    """
    Register new user
    """
    result = await auth_service.register(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name
    )
    if not result:
        raise HTTPException(status_code=400, detail="Registration failed")
    return result

@router.post("/logout")
async def logout() -> Dict[str, str]:
    """
    Logout user (handled by frontend, but endpoint exists for consistency)
    """
    return {"message": "Logged out successfully"}

@router.get("/me")
async def get_current_user() -> Dict[str, Any]:
    """
    Get current user information
    """
    # Implementation depends on auth strategy
    return {"message": "User profile endpoint"}