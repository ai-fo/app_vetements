from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import Optional
import os

from .models import ChatCompletionRequest, ChatCompletionResponse, ErrorResponse
from .service import ChatGPTService
from core.config import settings

router = APIRouter(
    prefix="/api/chatgpt",
    tags=["chatgpt"]
)


def get_chatgpt_service() -> ChatGPTService:
    """Dependency to get ChatGPT service instance"""
    try:
        return ChatGPTService()
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/completions", response_model=ChatCompletionResponse)
async def create_chat_completion(
    request: ChatCompletionRequest,
    service: ChatGPTService = Depends(get_chatgpt_service)
):
    """
    Create a chat completion using ChatGPT
    """
    try:
        if request.stream:
            return StreamingResponse(
                service.create_completion_stream(request),
                media_type="text/event-stream"
            )
        
        response = await service.create_completion(request)
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/simple")
async def create_simple_completion(
    prompt: str,
    system_prompt: Optional[str] = None,
    model: str = "gpt-4o",
    temperature: float = 0.7,
    service: ChatGPTService = Depends(get_chatgpt_service)
):
    """
    Simplified endpoint for quick completions
    """
    try:
        content = await service.create_simple_completion(
            prompt=prompt,
            system_prompt=system_prompt,
            model=model,
            temperature=temperature
        )
        
        return {"content": content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """
    Check if the ChatGPT service is properly configured
    """
    api_key_configured = bool(settings.OPENAI_API_KEY)
    
    return {
        "status": "healthy" if api_key_configured else "unhealthy",
        "api_key_configured": api_key_configured
    }