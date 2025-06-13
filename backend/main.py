from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings

# Import routers from modules when they're implemented
# from backend.modules.auth import router as auth_router
# from backend.modules.catalog import router as catalog_router
# from backend.modules.cart import router as cart_router
# from backend.modules.ai import router as ai_router
from modules.chatgpt import router as chatgpt_router

app = FastAPI(
    title="Vêtements API",
    description="Backend API for clothing e-commerce app",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers when implemented
# app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
# app.include_router(catalog_router, prefix="/api/catalog", tags=["catalog"])
# app.include_router(cart_router, prefix="/api/cart", tags=["cart"])
# app.include_router(ai_router, prefix="/api/ai", tags=["ai"])
app.include_router(chatgpt_router, tags=["chatgpt"])

@app.get("/")
def read_root():
    return {"message": "Vêtements API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}