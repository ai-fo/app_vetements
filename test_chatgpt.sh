#!/bin/bash

# Test de l'API ChatGPT

echo "1. Test de santé:"
curl http://localhost:8000/api/chatgpt/health
echo -e "\n"

echo "2. Test simple completion:"
curl -X POST "http://localhost:8000/api/chatgpt/chat/simple?prompt=Dis%20bonjour%20en%20francais&temperature=0.7" \
  -H "accept: application/json"
echo -e "\n"

echo "3. Test completion complète:"
curl -X POST "http://localhost:8000/api/chatgpt/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "Tu es un assistant utile."},
      {"role": "user", "content": "Quelle est la capitale de la France?"}
    ],
    "model": "gpt-4o",
    "temperature": 0.7
  }'
echo -e "\n"