import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime

from backend.main import app
from ..models import ChatCompletionResponse


@pytest.fixture
def client():
    return TestClient(app)


class TestChatGPTRouter:
    @patch('backend.modules.chatgpt.router.ChatGPTService')
    def test_health_check_with_api_key(self, mock_service_class, client):
        with patch.dict('os.environ', {'OPENAI_API_KEY': 'test-key'}):
            response = client.get("/api/chatgpt/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert data["api_key_configured"] is True
    
    @patch('backend.modules.chatgpt.router.ChatGPTService')
    def test_health_check_without_api_key(self, mock_service_class, client):
        with patch.dict('os.environ', {}, clear=True):
            response = client.get("/api/chatgpt/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "unhealthy"
            assert data["api_key_configured"] is False
    
    @patch('backend.modules.chatgpt.router.get_chatgpt_service')
    def test_create_chat_completion(self, mock_get_service, client):
        mock_service = Mock()
        mock_get_service.return_value = mock_service
        
        mock_response = ChatCompletionResponse(
            id="test-123",
            created=datetime.now(),
            model="gpt-4o",
            content="Test response",
            usage={"total_tokens": 50}
        )
        
        mock_service.create_completion = AsyncMock(return_value=mock_response)
        
        request_data = {
            "messages": [
                {"role": "user", "content": "Hello"}
            ],
            "model": "gpt-4o",
            "temperature": 0.7
        }
        
        response = client.post("/api/chatgpt/chat/completions", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "test-123"
        assert data["content"] == "Test response"
        assert data["model"] == "gpt-4o"
    
    @patch('backend.modules.chatgpt.router.get_chatgpt_service')
    def test_create_simple_completion(self, mock_get_service, client):
        mock_service = Mock()
        mock_get_service.return_value = mock_service
        
        mock_service.create_simple_completion = AsyncMock(return_value="Simple response")
        
        response = client.post(
            "/api/chatgpt/chat/simple",
            params={
                "prompt": "Test prompt",
                "temperature": 0.5
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == "Simple response"
    
    @patch('backend.modules.chatgpt.router.ChatGPTService')
    def test_service_initialization_error(self, mock_service_class, client):
        mock_service_class.side_effect = ValueError("API key not found")
        
        response = client.post(
            "/api/chatgpt/chat/completions",
            json={
                "messages": [{"role": "user", "content": "Test"}]
            }
        )
        
        assert response.status_code == 500
        assert "API key not found" in response.json()["detail"]