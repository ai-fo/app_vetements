from typing import List, Optional, Union
from uuid import UUID
import time
from sqlalchemy.orm import Session
from database.models import ClothingItem, OutfitLook, LookItem, AnalysisHistory
from schemas.clothing_analysis import SinglePieceResponse, CompleteLookResponse, ClothingPiece as ClothingPieceSchema


class WardrobeService:
    def __init__(self, db: Session):
        self.db = db
    
    def save_single_piece(self, user_id: UUID, piece_data: SinglePieceResponse, image_url: Optional[str] = None) -> ClothingItem:
        """Sauvegarde une pièce unique dans la base de données"""
        
        start_time = time.time()
        piece = piece_data.pieces[0]  # Une pièce unique a toujours exactement 1 pièce
        
        # Utiliser le nom généré par l'IA ou fallback sur piece_type
        piece_name = piece.name if hasattr(piece, 'name') and piece.name else piece.piece_type
        
        # Créer la pièce
        db_piece = ClothingItem(
            id=piece.piece_id,
            user_id=user_id,
            piece_type=piece.piece_type,
            name=piece_name,
            colors={
                "primary": piece.attributes.colors.primary,
                "secondary": piece.attributes.colors.secondary
            },
            material=piece.attributes.material,
            pattern=piece.attributes.pattern,
            fit=piece.attributes.fit,
            details=piece.attributes.details,
            style_tags=piece.style_tags,
            occasion_tags=piece.occasion_tags,
            seasonality=piece.seasonality,
            image_url=image_url
        )
        
        self.db.add(db_piece)
        self.db.flush()  # Pour obtenir l'ID avant le commit
        
        # Sauvegarder l'historique d'analyse
        analysis_history = AnalysisHistory(
            user_id=user_id,
            capture_type="single_piece",
            raw_analysis=piece_data.model_dump(mode='json'),  # Utiliser mode='json' pour sérialiser les UUID
            created_item_id=db_piece.id,
            analysis_duration_ms=int((time.time() - start_time) * 1000)
        )
        self.db.add(analysis_history)
        
        self.db.commit()
        self.db.refresh(db_piece)
        
        return db_piece
    
    def save_complete_look(self, user_id: UUID, look_data: CompleteLookResponse, image_url: Optional[str] = None) -> OutfitLook:
        """Sauvegarde une tenue complète dans la base de données"""
        
        start_time = time.time()
        
        # Créer le nom du look basé sur le style dominant
        look_name = f"Look {look_data.look_meta.dominant_style[0]}" if look_data.look_meta.dominant_style else "Look"
        
        # Créer le look
        db_look = OutfitLook(
            id=look_data.look_meta.look_id,
            user_id=user_id,
            name=look_name,
            dominant_style=look_data.look_meta.dominant_style,
            occasion_tags=look_data.look_meta.occasion_tags,
            seasonality=look_data.look_meta.seasonality,
            color_palette={
                "primary": look_data.look_meta.color_palette_global.primary,
                "accent": look_data.look_meta.color_palette_global.accent
            },
            pattern_mix=look_data.look_meta.pattern_mix,
            silhouette=look_data.look_meta.silhouette,
            layering_level=look_data.look_meta.layering_level,
            image_url=image_url
        )
        
        self.db.add(db_look)
        self.db.flush()
        
        # Sauvegarder chaque pièce et créer les liens
        for idx, piece in enumerate(look_data.pieces):
            # Vérifier si la pièce existe déjà
            existing_piece = self.db.query(ClothingItem).filter_by(
                id=piece.piece_id
            ).first()
            
            if not existing_piece:
                # Utiliser le nom généré par l'IA ou fallback sur piece_type
                piece_name = piece.name if hasattr(piece, 'name') and piece.name else piece.piece_type
                
                # Créer la nouvelle pièce
                db_piece = ClothingItem(
                    id=piece.piece_id,
                    user_id=user_id,
                    piece_type=piece.piece_type,
                    name=piece_name,
                    colors={
                        "primary": piece.attributes.colors.primary,
                        "secondary": piece.attributes.colors.secondary
                    },
                    material=piece.attributes.material,
                    pattern=piece.attributes.pattern,
                    fit=piece.attributes.fit,
                    details=piece.attributes.details,
                    style_tags=piece.style_tags,
                    occasion_tags=piece.occasion_tags,
                    seasonality=piece.seasonality
                )
                self.db.add(db_piece)
                item_id = db_piece.id
            else:
                item_id = existing_piece.id
            
            # Créer le lien look-pièce
            look_item = LookItem(
                look_id=db_look.id,
                item_id=item_id,
                position=idx
            )
            self.db.add(look_item)
        
        # Sauvegarder l'historique d'analyse
        analysis_history = AnalysisHistory(
            user_id=user_id,
            capture_type="complete_look",
            raw_analysis=look_data.model_dump(mode='json'),  # Utiliser mode='json' pour sérialiser les UUID
            created_look_id=db_look.id,
            analysis_duration_ms=int((time.time() - start_time) * 1000)
        )
        self.db.add(analysis_history)
        
        self.db.commit()
        self.db.refresh(db_look)
        
        return db_look
    
    def get_user_pieces(self, user_id: UUID, piece_type: Optional[str] = None) -> List[ClothingItem]:
        """Récupère les pièces d'un utilisateur"""
        
        query = self.db.query(ClothingItem).filter_by(
            user_id=user_id,
            is_active=True
        )
        
        if piece_type:
            query = query.filter_by(piece_type=piece_type)
        
        return query.order_by(ClothingItem.created_at.desc()).all()
    
    def get_user_looks(self, user_id: UUID) -> List[OutfitLook]:
        """Récupère les tenues d'un utilisateur"""
        
        return self.db.query(OutfitLook).filter_by(
            user_id=user_id
        ).order_by(OutfitLook.created_at.desc()).all()