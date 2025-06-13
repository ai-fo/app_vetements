# Module ChatGPT

Module autonome pour l'intégration avec l'API OpenAI ChatGPT (GPT-4o).

## Configuration

Définir la clé API OpenAI dans les variables d'environnement :

```bash
OPENAI_API_KEY=your-api-key-here
```

## Endpoints

### POST /api/chatgpt/chat/completions
Endpoint complet pour les chat completions.

```json
{
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hello"}
  ],
  "model": "gpt-4o",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

### POST /api/chatgpt/chat/simple
Endpoint simplifié pour des completions rapides.

Paramètres query :
- `prompt` (required): Le prompt utilisateur
- `system_prompt` (optional): Instructions système
- `model` (optional): Modèle à utiliser (default: gpt-4o)
- `temperature` (optional): Température (default: 0.7)

### GET /api/chatgpt/health
Vérifier le statut du service.

## Utilisation du service

```python
from backend.modules.chatgpt import ChatGPTService

service = ChatGPTService()

# Completion simple
response = await service.create_simple_completion(
    prompt="Explain quantum computing",
    system_prompt="Explain in simple terms"
)

# Completion avec messages complets
from backend.modules.chatgpt.models import ChatMessage, ChatCompletionRequest

request = ChatCompletionRequest(
    messages=[
        ChatMessage(role="user", content="Hello")
    ]
)
response = await service.create_completion(request)
```

## Tests

```bash
pytest backend/modules/chatgpt/tests/
```