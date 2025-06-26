#!/usr/bin/env python3
"""
Script pour vérifier l'état actuel de la garde-robe
"""

import os
import sys
from pathlib import Path

# Ajouter le répertoire parent au path
sys.path.append(str(Path(__file__).parent.parent))

from database.connection import get_db
from database.models import ClothingItem, OutfitLook
from sqlalchemy import func
from dotenv import load_dotenv

load_dotenv()

def check_wardrobe_status():
    """Vérifie l'état actuel de la garde-robe dans la base de données"""
    
    db = next(get_db())
    
    try:
        # Compter les vêtements par utilisateur
        clothing_stats = db.query(
            ClothingItem.user_id,
            func.count(ClothingItem.id).label('count'),
            func.count(func.distinct(ClothingItem.piece_type)).label('types')
        ).group_by(ClothingItem.user_id).all()
        
        # Compter les tenues par utilisateur
        outfit_stats = db.query(
            OutfitLook.user_id,
            func.count(OutfitLook.id).label('count')
        ).group_by(OutfitLook.user_id).all()
        
        print("=== État de la garde-robe ===\n")
        
        if clothing_stats:
            print("📦 Vêtements individuels:")
            for stat in clothing_stats:
                print(f"  - Utilisateur {stat.user_id}: {stat.count} pièces ({stat.types} types différents)")
        else:
            print("📦 Aucun vêtement individuel trouvé")
        
        print()
        
        if outfit_stats:
            print("👔 Tenues complètes:")
            for stat in outfit_stats:
                print(f"  - Utilisateur {stat.user_id}: {stat.count} tenues")
        else:
            print("👔 Aucune tenue complète trouvée")
        
        # Afficher quelques exemples
        sample_items = db.query(ClothingItem).limit(3).all()
        if sample_items:
            print("\n📋 Exemples de vêtements:")
            for item in sample_items:
                print(f"  - {item.name} ({item.piece_type}) - {item.colors}")
        
        # Statistiques globales
        total_items = db.query(func.count(ClothingItem.id)).scalar()
        total_looks = db.query(func.count(OutfitLook.id)).scalar()
        
        print(f"\n📊 Total: {total_items} vêtements et {total_looks} tenues")
        
    finally:
        db.close()

if __name__ == "__main__":
    check_wardrobe_status()