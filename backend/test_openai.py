#!/usr/bin/env python3
import os
import sys
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv('../.env')

# Vérifier la clé API
api_key = os.getenv('OPENAI_API_KEY')
print(f"Clé API présente: {bool(api_key)}")
print(f"Longueur de la clé: {len(api_key) if api_key else 0}")
print(f"Commence par: {api_key[:10] if api_key else 'None'}...")

# Tester la connexion OpenAI
try:
    from openai import OpenAI
    client = OpenAI(api_key=api_key)
    
    # Test simple
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Dis bonjour"}],
        max_tokens=10
    )
    print("\nTest réussi!")
    print(f"Réponse: {response.choices[0].message.content}")
    
except Exception as e:
    print(f"\nErreur: {type(e).__name__}: {str(e)}")
    
    # Si c'est une erreur d'authentification
    if "authentication" in str(e).lower() or "api" in str(e).lower():
        print("\n⚠️  La clé API semble invalide ou expirée.")
        print("Vérifiez votre clé sur: https://platform.openai.com/api-keys")