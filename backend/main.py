from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings

# Import routers from modules
from backend.modules.auth import router as auth_router
from backend.modules.outfit_analysis import router as outfit_analysis_router

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

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(outfit_analysis_router, prefix="/api/outfit-analysis", tags=["outfit-analysis"])

@app.get("/")
def read_root():
    return {"message": "Vêtements API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}