import pytest
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime
import httpx

from ..service import ChatGPTService
from ..models import ChatMessage, ChatCompletionRequest, ChatCompletionResponse


@pytest.fixture
def chatgpt_service():
    with patch.dict('os.environ', {'OPENAI_API_KEY': 'test-key'}):
        return ChatGPTService()


@pytest.fixture
def sample_request():
    return ChatCompletionRequest(
        messages=[
            ChatMessage(role="system", content="You are a helpful assistant"),
            ChatMessage(role="user", content="Hello")
        ],
        model="gpt-4o",
        temperature=0.7
    )


class TestChatGPTService:
    def test_init_with_api_key(self):
        service = ChatGPTService(api_key="test-key")
        assert service.api_key == "test-key"
    
    def test_init_with_env_var(self):
        with patch.dict('os.environ', {'OPENAI_API_KEY': 'env-test-key'}):
            service = ChatGPTService()
            assert service.api_key == "env-test-key"
    
    def test_init_without_api_key_raises_error(self):
        with patch.dict('os.environ', {}, clear=True):
            with pytest.raises(ValueError, match="OpenAI API key not provided"):
                ChatGPTService()
    
    @pytest.mark.asyncio
    async def test_create_completion_success(self, chatgpt_service, sample_request):
        mock_response_data = {
            "id": "chatcmpl-123",
            "created": 1677858242,
            "model": "gpt-4o",
            "choices": [{
                "message": {"content": "Hello! How can I help you?"},
                "finish_reason": "stop"
            }],
            "usage": {"total_tokens": 100}
        }
        
        with patch('httpx.AsyncClient.post') as mock_post:
            mock_response = Mock()
            mock_response.json.return_value = mock_response_data
            mock_response.raise_for_status = Mock()
            mock_post.return_value = mock_response
            
            response = await chatgpt_service.create_completion(sample_request)
            
            assert response.id == "chatcmpl-123"
            assert response.content == "Hello! How can I help you?"
            assert response.model == "gpt-4o"
            assert response.usage == {"total_tokens": 100}
    
    @pytest.mark.asyncio
    async def test_create_completion_http_error(self, chatgpt_service, sample_request):
        with patch('httpx.AsyncClient.post') as mock_post:
            mock_response = Mock()
            mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
                "Error", request=Mock(), response=Mock(status_code=401, text="Unauthorized")
            )
            mock_post.return_value = mock_response
            
            with pytest.raises(Exception, match="OpenAI API error: 401"):
                await chatgpt_service.create_completion(sample_request)
    
    @pytest.mark.asyncio
    async def test_create_simple_completion(self, chatgpt_service):
        with patch.object(chatgpt_service, 'create_completion') as mock_create:
            mock_create.return_value = ChatCompletionResponse(
                id="test-id",
                created=datetime.now(),
                model="gpt-4o",
                content="Test response"
            )
            
            result = await chatgpt_service.create_simple_completion(
                prompt="Test prompt",
                system_prompt="Be helpful"
            )
            
            assert result == "Test response"
            mock_create.assert_called_once()
            
            args = mock_create.call_args[0][0]
            assert len(args.messages) == 2
            assert args.messages[0].role == "system"
            assert args.messages[0].content == "Be helpful"
            assert args.messages[1].role == "user"
            assert args.messages[1].content == "Test prompt"