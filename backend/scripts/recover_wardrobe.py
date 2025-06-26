#!/usr/bin/env python3
"""
Script pour récupérer les vêtements depuis le bucket storage
et recréer les entrées dans la nouvelle base de données
"""

import os
import sys
from pathlib import Path
from datetime import datetime
from uuid import uuid4
import asyncio
from typing import List, Dict

# Ajouter le répertoire parent au path pour importer les modules
sys.path.append(str(Path(__file__).parent.parent))

from database.connection import get_db, engine
from database.models import Base, ClothingItem
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import httpx

load_dotenv()

# Configuration Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://irdtiqaqwydnplvkzwfp.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

async def get_storage_files():
    """Récupère la liste des fichiers dans le bucket wardrobe"""
    
    headers = {
        "apikey": SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY}"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/storage/v1/object/list/wardrobe",
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Erreur lors de la récupération des fichiers: {response.status_code}")
            print(response.text)
            return []

def extract_user_id_from_path(file_path: str):
    """Extrait l'ID utilisateur du chemin du fichier"""
    # Format attendu: user_id/filename.jpg
    parts = file_path.split("/")
    if len(parts) >= 2:
        return parts[0]
    return None

def create_clothing_item_from_image(user_id: str, file_name: str, file_path: str) -> Dict:
    """Crée un objet ClothingItem basique à partir d'une image"""
    
    # Extraire le type de vêtement du nom de fichier si possible
    piece_type = "unknown"
    name = "Vêtement importé"
    
    # Essayer de deviner le type à partir du nom
    file_lower = file_name.lower()
    if any(word in file_lower for word in ["shirt", "chemise", "tshirt", "t-shirt", "haut", "top"]):
        piece_type = "shirt"
        name = "Haut importé"
    elif any(word in file_lower for word in ["pants", "pantalon", "jean", "jeans", "trouser"]):
        piece_type = "pants"
        name = "Pantalon importé"
    elif any(word in file_lower for word in ["dress", "robe"]):
        piece_type = "dress"
        name = "Robe importée"
    elif any(word in file_lower for word in ["skirt", "jupe"]):
        piece_type = "skirt"
        name = "Jupe importée"
    elif any(word in file_lower for word in ["jacket", "veste", "blazer", "coat", "manteau"]):
        piece_type = "jacket"
        name = "Veste importée"
    elif any(word in file_lower for word in ["shoe", "chaussure", "sneaker", "boot"]):
        piece_type = "shoes"
        name = "Chaussures importées"
    
    return {
        "id": uuid4(),
        "user_id": user_id,
        "piece_type": piece_type,
        "name": name,
        "colors": {"primary": [], "secondary": []},
        "material": None,
        "pattern": "uni",
        "fit": "regular",
        "details": [],
        "style_tags": ["imported"],
        "occasion_tags": ["casual"],
        "seasonality": ["all_season"],
        "image_url": f"{SUPABASE_URL}/storage/v1/object/public/wardrobe/{file_path}",
        "brand": None,
        "notes": f"Importé automatiquement le {datetime.now().strftime('%Y-%m-%d')}",
        "is_active": True,
        "is_favorite": False,
        "wear_count": 0
    }

async def recover_wardrobe_items():
    """Récupère et recrée les vêtements depuis le storage"""
    
    print("Récupération des fichiers depuis le bucket storage...")
    files = await get_storage_files()
    
    if not files:
        print("Aucun fichier trouvé dans le bucket")
        return
    
    print(f"Trouvé {len(files)} fichiers dans le bucket")
    
    # Grouper par utilisateur
    user_files = {}
    for file in files:
        if file.get("name") and not file["name"].startswith("."):  # Ignorer les fichiers cachés
            user_id = extract_user_id_from_path(file["name"])
            if user_id:
                if user_id not in user_files:
                    user_files[user_id] = []
                user_files[user_id].append(file)
    
    print(f"Fichiers trouvés pour {len(user_files)} utilisateurs")
    
    # Créer les entrées dans la base de données
    db = next(get_db())
    created_count = 0
    
    try:
        for user_id, files in user_files.items():
            print(f"\nTraitement de {len(files)} fichiers pour l'utilisateur {user_id}")
            
            # Vérifier les items existants pour cet utilisateur
            existing_items = db.query(ClothingItem).filter_by(user_id=user_id).all()
            existing_urls = {item.image_url for item in existing_items}
            
            for file in files:
                file_path = file["name"]
                image_url = f"{SUPABASE_URL}/storage/v1/object/public/wardrobe/{file_path}"
                
                # Ne pas recréer si déjà existant
                if image_url in existing_urls:
                    print(f"  - {file_path}: déjà dans la base de données")
                    continue
                
                # Créer le nouvel item
                item_data = create_clothing_item_from_image(user_id, file_path, file_path)
                new_item = ClothingItem(**item_data)
                
                db.add(new_item)
                created_count += 1
                print(f"  + {file_path}: créé comme {item_data['piece_type']}")
        
        # Sauvegarder tous les changements
        db.commit()
        print(f"\n✅ Récupération terminée: {created_count} vêtements créés")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Erreur lors de la récupération: {str(e)}")
        raise
    finally:
        db.close()

def main():
    """Point d'entrée principal"""
    print("=== Script de récupération de garde-robe ===")
    print(f"URL Supabase: {SUPABASE_URL}")
    print(f"Clé disponible: {'Oui' if (SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY) else 'Non'}")
    
    # Confirmer avant de continuer
    response = input("\nVoulez-vous continuer avec la récupération? (oui/non): ")
    if response.lower() not in ["oui", "o", "yes", "y"]:
        print("Récupération annulée")
        return
    
    # Lancer la récupération
    asyncio.run(recover_wardrobe_items())

if __name__ == "__main__":
    main()