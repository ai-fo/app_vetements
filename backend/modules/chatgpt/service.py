import os
import logging
from typing import List, Optional, AsyncGenerator
import httpx
from datetime import datetime

from .models import ChatMessage, ChatCompletionRequest, ChatCompletionResponse
from core.config import settings

logger = logging.getLogger(__name__)


class ChatGPTService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        if not self.api_key:
            raise ValueError("OpenAI API key not provided. Set OPENAI_API_KEY environment variable.")
        
        self.base_url = "https://api.openai.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def create_completion(
        self, 
        request: ChatCompletionRequest
    ) -> ChatCompletionResponse:
        """
        Create a chat completion using OpenAI API
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": request.model,
                        "messages": [msg.dict() for msg in request.messages],
                        "temperature": request.temperature,
                        "max_tokens": request.max_tokens,
                        "top_p": request.top_p,
                        "frequency_penalty": request.frequency_penalty,
                        "presence_penalty": request.presence_penalty,
                        "stream": False
                    },
                    timeout=60.0
                )
                
                response.raise_for_status()
                data = response.json()
                
                return ChatCompletionResponse(
                    id=data["id"],
                    created=datetime.fromtimestamp(data["created"]),
                    model=data["model"],
                    content=data["choices"][0]["message"]["content"],
                    usage=data.get("usage"),
                    finish_reason=data["choices"][0].get("finish_reason")
                )
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error: {e.response.status_code} - {e.response.text}")
            raise Exception(f"OpenAI API error: {e.response.status_code}")
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            raise
    
    async def create_completion_stream(
        self,
        request: ChatCompletionRequest
    ) -> AsyncGenerator[str, None]:
        """
        Create a streaming chat completion
        """
        request.stream = True
        
        try:
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": request.model,
                        "messages": [msg.dict() for msg in request.messages],
                        "temperature": request.temperature,
                        "max_tokens": request.max_tokens,
                        "top_p": request.top_p,
                        "frequency_penalty": request.frequency_penalty,
                        "presence_penalty": request.presence_penalty,
                        "stream": True
                    },
                    timeout=60.0
                ) as response:
                    response.raise_for_status()
                    
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data = line[6:]
                            if data == "[DONE]":
                                break
                            
                            try:
                                import json
                                chunk = json.loads(data)
                                content = chunk["choices"][0]["delta"].get("content", "")
                                if content:
                                    yield content
                            except json.JSONDecodeError:
                                continue
                                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error: {e.response.status_code}")
            raise Exception(f"OpenAI API error: {e.response.status_code}")
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            raise
    
    async def create_simple_completion(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: str = "gpt-4o",
        temperature: float = 0.7
    ) -> str:
        """
        Simplified method for quick completions
        """
        messages = []
        
        if system_prompt:
            messages.append(ChatMessage(role="system", content=system_prompt))
        
        messages.append(ChatMessage(role="user", content=prompt))
        
        request = ChatCompletionRequest(
            messages=messages,
            model=model,
            temperature=temperature
        )
        
        response = await self.create_completion(request)
        return response.content