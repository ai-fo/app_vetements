from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatCompletionRequest(BaseModel):
    messages: List[ChatMessage]
    model: str = Field(default="gpt-4o", description="OpenAI model to use")
    temperature: float = Field(default=0.7, ge=0, le=2, description="Sampling temperature")
    max_tokens: Optional[int] = Field(default=None, description="Maximum tokens in response")
    top_p: Optional[float] = Field(default=1.0, ge=0, le=1, description="Top-p sampling")
    frequency_penalty: Optional[float] = Field(default=0, ge=-2, le=2)
    presence_penalty: Optional[float] = Field(default=0, ge=-2, le=2)
    stream: bool = Field(default=False, description="Stream the response")


class ChatCompletionResponse(BaseModel):
    id: str
    created: datetime
    model: str
    content: str
    usage: Optional[dict] = None
    finish_reason: Optional[str] = None


class ErrorResponse(BaseModel):
    error: str
    code: Optional[str] = None
    details: Optional[dict] = None