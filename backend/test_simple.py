#!/usr/bin/env python3
import os

# Test direct de la clé
api_key = os.environ.get('OPENAI_API_KEY')
if not api_key:
    # Lire depuis le fichier .env
    try:
        with open('../.env', 'r') as f:
            for line in f:
                if line.startswith('OPENAI_API_KEY='):
                    api_key = line.split('=', 1)[1].strip()
                    break
    except:
        pass

print(f"Clé trouvée: {bool(api_key)}")
if api_key:
    print(f"Longueur: {len(api_key)}")
    print(f"Format: sk-{'proj' if 'proj' in api_key else 'autre'}-...")
    
    # Vérifier si c'est une vraie clé ou le placeholder
    if api_key == "your-openai-api-key-here":
        print("\n⚠️  ERREUR: La clé API est toujours le placeholder!")
        print("Remplacez 'your-openai-api-key-here' par votre vraie clé dans .env")
else:
    print("\n⚠️  ERREUR: Aucune clé API trouvée!")