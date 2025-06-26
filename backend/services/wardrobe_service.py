from typing import List, Optional, Union
from uuid import UUID
import time
import io
import base64
import httpx
from PIL import Image
from sqlalchemy.orm import Session
from database.models import ClothingItem, OutfitLook, LookItem, AnalysisHistory
from schemas.clothing_analysis import SinglePieceResponse, CompleteLookResponse, ClothingPiece as ClothingPieceSchema


class WardrobeService:
    def __init__(self, db: Session):
        self.db = db
    
    async def crop_and_save_piece_image(self, original_image_url: str, bounding_box: dict, piece_id: UUID, user_id: UUID) -> Optional[str]:
        """Découpe une pièce de l'image originale et la sauvegarde dans le bucket"""
        print(f"🔪 Début découpage pour pièce {piece_id}")
        print(f"   - Image originale: {original_image_url}")
        print(f"   - Bounding box: {bounding_box}")
        try:
            # Télécharger l'image originale
            print(f"   📥 Téléchargement de l'image...")
            async with httpx.AsyncClient() as client:
                response = await client.get(original_image_url)
                response.raise_for_status()
                image_data = response.content
                print(f"   ✅ Image téléchargée: {len(image_data)} bytes")
            
            # Ouvrir l'image avec PIL
            image = Image.open(io.BytesIO(image_data))
            img_width, img_height = image.size
            print(f"   📐 Dimensions originales: {img_width}x{img_height}")
            
            # Calculer les coordonnées absolues
            crop_x = int(bounding_box['x'] * img_width)
            crop_y = int(bounding_box['y'] * img_height)
            crop_width = int(bounding_box['width'] * img_width)
            crop_height = int(bounding_box['height'] * img_height)
            print(f"   🎯 Coordonnées calculées: x={crop_x}, y={crop_y}, w={crop_width}, h={crop_height}")
            
            # S'assurer que les coordonnées sont valides
            crop_x = max(0, min(crop_x, img_width - 1))
            crop_y = max(0, min(crop_y, img_height - 1))
            crop_width = max(10, min(crop_width, img_width - crop_x))
            crop_height = max(10, min(crop_height, img_height - crop_y))
            print(f"   ✂️ Coordonnées ajustées: x={crop_x}, y={crop_y}, w={crop_width}, h={crop_height}")
            
            # Découper l'image
            cropped_image = image.crop((
                crop_x,
                crop_y, 
                crop_x + crop_width,
                crop_y + crop_height
            ))
            print(f"   🖼️ Image découpée: {cropped_image.size}")
            
            # Convertir en bytes pour l'upload
            output_buffer = io.BytesIO()
            cropped_image.save(output_buffer, format='JPEG', quality=85)
            cropped_data = output_buffer.getvalue()
            
            # Upload vers Supabase Storage
            from supabase import create_client
            import os
            import base64
            
            supabase_url = os.getenv("EXPO_PUBLIC_SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
            
            if not supabase_url or not supabase_key:
                print("   ⚠️ Clés Supabase manquantes - sauvegarde locale temporaire")
                # Pour l'instant, retourner une URL temporaire
                temp_filename = f"piece_{user_id}_{piece_id}_{int(time.time())}.jpg"
                return f"data:image/jpeg;base64,{base64.b64encode(cropped_data).decode()}"
                
            supabase = create_client(supabase_url, supabase_key)
            
            # Nom du fichier pour la pièce
            filename = f"piece_{user_id}_{piece_id}_{int(time.time())}.jpg"
            print(f"   📤 Upload vers Supabase: {filename}")
            
            # Upload du fichier
            result = supabase.storage.from_("wardrobe").upload(
                filename,
                cropped_data,
                file_options={
                    "content-type": "image/jpeg",
                    "upsert": "true"
                }
            )
            
            # Debug: voir la structure de la réponse
            print(f"   🔍 Structure result: {type(result)}")
            print(f"   🔍 Attributs: {[attr for attr in dir(result) if not attr.startswith('_')]}")
            
            # Vérifier si l'upload a réussi (la nouvelle API Supabase peut retourner différents formats)
            if hasattr(result, 'data') and result.data:
                # Ancienne API
                public_url = supabase.storage.from_("wardrobe").get_public_url(filename)
                print(f"   ✅ Upload réussi: {public_url.data.public_url}")
                return public_url.data.public_url
            elif hasattr(result, 'path') or not hasattr(result, 'error'):
                # Nouvelle API - l'upload a réussi si pas d'erreur
                public_url = supabase.storage.from_("wardrobe").get_public_url(filename)
                full_url = public_url.data.public_url if hasattr(public_url, 'data') else public_url
                print(f"   ✅ Upload réussi: {full_url}")
                return full_url
            else:
                error_msg = result.error if hasattr(result, 'error') else "Upload failed"
                print(f"   ❌ Erreur upload: {error_msg}")
                return None
                
        except Exception as e:
            print(f"   ❌ Erreur lors du découpage/upload de l'image: {e}")
            import traceback
            traceback.print_exc()
            return None
    
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
    
    async def save_complete_look(self, user_id: UUID, look_data: CompleteLookResponse, image_url: Optional[str] = None) -> OutfitLook:
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
            
            piece_image_url = None
            
            # Découper et sauvegarder l'image de la pièce si elle a des coordonnées
            if piece.bounding_box and image_url:
                print(f"🎯 Découpage de la pièce {piece.piece_type} (ID: {piece.piece_id})")
                print(f"   - Coordonnées: {piece.bounding_box}")
                bounding_box_dict = {
                    'x': piece.bounding_box.x,
                    'y': piece.bounding_box.y, 
                    'width': piece.bounding_box.width,
                    'height': piece.bounding_box.height
                }
                piece_image_url = await self.crop_and_save_piece_image(
                    image_url, 
                    bounding_box_dict, 
                    piece.piece_id, 
                    user_id
                )
                if piece_image_url:
                    print(f"   ✅ Image de pièce sauvegardée: {piece_image_url}")
                else:
                    print(f"   ❌ Échec sauvegarde image pour {piece.piece_type}")
            
            if not existing_piece:
                # Utiliser le nom généré par l'IA ou fallback sur piece_type
                piece_name = piece.name if hasattr(piece, 'name') and piece.name else piece.piece_type
                
                # Créer la nouvelle pièce avec son image découpée
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
                    image_url=piece_image_url  # URL de l'image découpée
                )
                self.db.add(db_piece)
                item_id = db_piece.id
            else:
                # Mettre à jour l'image de la pièce existante si une nouvelle a été générée
                if piece_image_url:
                    existing_piece.image_url = piece_image_url
                    print(f"   📝 Mise à jour image_url pour pièce existante {existing_piece.id}: {piece_image_url}")
                    self.db.flush()  # S'assurer que la mise à jour est persistée
                item_id = existing_piece.id
            
            # Préparer les coordonnées de la bounding box si disponibles
            bounding_box = None
            if piece.bounding_box:
                bounding_box = {
                    "x": piece.bounding_box.x,
                    "y": piece.bounding_box.y,
                    "width": piece.bounding_box.width,
                    "height": piece.bounding_box.height
                }
            
            # Créer le lien look-pièce avec coordonnées
            look_item = LookItem(
                look_id=db_look.id,
                item_id=item_id,
                position=idx,
                bounding_box=bounding_box
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
        """Récupère les tenues d'un utilisateur avec les pièces et leurs coordonnées"""
        
        from sqlalchemy.orm import joinedload
        
        return self.db.query(OutfitLook).filter_by(
            user_id=user_id
        ).options(
            joinedload(OutfitLook.items).joinedload(LookItem.item)  # Charge les look_items avec leurs items et coordonnées
        ).order_by(OutfitLook.created_at.desc()).all()