from sqlalchemy import Column, String, DateTime, Boolean, Integer, ForeignKey, JSON, ARRAY, Date, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()


class ClothingItem(Base):
    __tablename__ = 'clothing_items'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    
    # Type et identification
    piece_type = Column(String(50), nullable=False)
    name = Column(String)
    
    # Attributs structurés
    colors = Column(JSON, nullable=False, default={"primary": [], "secondary": []})
    material = Column(String(50))
    pattern = Column(String(50))
    fit = Column(String(50))
    details = Column(ARRAY(String), default=[])
    
    # Tags et métadonnées
    style_tags = Column(ARRAY(String), default=[])
    occasion_tags = Column(ARRAY(String), default=[])
    seasonality = Column(ARRAY(String), default=[])
    
    # Données supplémentaires
    image_url = Column(String)
    thumbnail_url = Column(String)
    brand = Column(String(100))
    price_range = Column(String(50))
    notes = Column(String)
    
    # Métadonnées système
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_worn = Column(Date)
    wear_count = Column(Integer, default=0)
    is_favorite = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Relations
    looks = relationship("LookItem", back_populates="item")
    analysis_history = relationship("AnalysisHistory", back_populates="created_item")


class OutfitLook(Base):
    __tablename__ = 'outfit_looks'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    
    # Métadonnées du look
    name = Column(String)
    dominant_style = Column(ARRAY(String), default=[])
    occasion_tags = Column(ARRAY(String), default=[])
    seasonality = Column(ARRAY(String), default=[])
    
    # Analyse visuelle
    color_palette = Column(JSON, default={"primary": [], "accent": []})
    pattern_mix = Column(ARRAY(String), default=[])
    silhouette = Column(String(100))
    layering_level = Column(Integer, default=1)
    
    # Données supplémentaires
    image_url = Column(String)
    thumbnail_url = Column(String)
    notes = Column(String)
    weather_suitable = Column(JSON)
    
    # Métadonnées système
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_worn = Column(Date)
    wear_count = Column(Integer, default=0)
    rating = Column(Integer)
    is_favorite = Column(Boolean, default=False)
    
    # Relations
    items = relationship("LookItem", back_populates="look", cascade="all, delete-orphan")
    analysis_history = relationship("AnalysisHistory", back_populates="created_look")


class LookItem(Base):
    __tablename__ = 'look_items'
    
    look_id = Column(UUID(as_uuid=True), ForeignKey('outfit_looks.id', ondelete='CASCADE'), primary_key=True)
    item_id = Column(UUID(as_uuid=True), ForeignKey('clothing_items.id', ondelete='CASCADE'), primary_key=True)
    position = Column(Integer, default=0)
    
    # Coordonnées de la pièce dans l'image de la tenue complète (format normalisé 0-1)
    bounding_box = Column(JSON, default=None)  # {"x": 0.1, "y": 0.2, "width": 0.6, "height": 0.4}
    
    # Relations
    look = relationship("OutfitLook", back_populates="items")
    item = relationship("ClothingItem", back_populates="looks")


class AnalysisHistory(Base):
    __tablename__ = 'analysis_history'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    
    # Type d'analyse
    capture_type = Column(String(20), nullable=False)
    
    # Données brutes
    raw_analysis = Column(JSON, nullable=False)
    
    # Références
    created_item_id = Column(UUID(as_uuid=True), ForeignKey('clothing_items.id', ondelete='SET NULL'))
    created_look_id = Column(UUID(as_uuid=True), ForeignKey('outfit_looks.id', ondelete='SET NULL'))
    
    # Métadonnées
    analysis_duration_ms = Column(Integer)
    model_used = Column(String(50), default='gpt-4o')
    confidence_score = Column(Numeric(3, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    created_item = relationship("ClothingItem", back_populates="analysis_history")
    created_look = relationship("OutfitLook", back_populates="analysis_history")