from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from .service import OutfitAnalysisService
from .models import AnalyzeRequest, AnalysisResponse, AnalysisStatusResponse

router = APIRouter()
service = OutfitAnalysisService()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_outfit(request: AnalyzeRequest) -> AnalysisResponse:
    """
    Analyser une image de tenue
    """
    try:
        result = await service.analyze_outfit(
            request.analysis_id,
            request.image_url
        )
        
        return AnalysisResponse(
            id=request.analysis_id,
            status=result["status"],
            message="Analysis completed successfully",
            analysis=result.get("analysis")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{analysis_id}/status", response_model=AnalysisStatusResponse)
async def get_analysis_status(analysis_id: str) -> AnalysisStatusResponse:
    """
    Récupérer le statut d'une analyse
    """
    try:
        status_data = await service.get_analysis_status(analysis_id)
        
        return AnalysisStatusResponse(
            id=status_data["id"],
            status=status_data["status"],
            message=status_data.get("error_message")
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))