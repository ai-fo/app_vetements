#!/usr/bin/env python
"""Test server to verify ChatGPT module works"""
import asyncio
from modules.chatgpt import ChatGPTService
from modules.chatgpt.models import ChatMessage, ChatCompletionRequest

async def test_chatgpt():
    try:
        # Initialize service
        service = ChatGPTService()
        print("✓ ChatGPT service initialized successfully")
        
        # Test simple completion
        response = await service.create_simple_completion(
            prompt="Say hello in French",
            temperature=0.7
        )
        print(f"✓ Simple completion test: {response}")
        
        # Test full completion
        request = ChatCompletionRequest(
            messages=[
                ChatMessage(role="user", content="What is 2+2?")
            ],
            model="gpt-4o",
            temperature=0
        )
        full_response = await service.create_completion(request)
        print(f"✓ Full completion test: {full_response.content}")
        
        print("\n✅ All tests passed! The ChatGPT module is working correctly.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nMake sure you have set OPENAI_API_KEY in your .env file")

if __name__ == "__main__":
    asyncio.run(test_chatgpt())