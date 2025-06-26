-- Migration: Ajouter le champ bounding_box à la table look_items
-- Date: 2025-01-26
-- Description: Permet de stocker les coordonnées de position de chaque vêtement dans une tenue complète

ALTER TABLE look_items 
ADD COLUMN bounding_box JSONB DEFAULT NULL;

-- Ajouter un commentaire pour documenter le format
COMMENT ON COLUMN look_items.bounding_box IS 'Coordonnées de la pièce dans l''image de la tenue complète (format normalisé 0-1): {"x": float, "y": float, "width": float, "height": float}';

-- Créer un index sur les bounding_box pour améliorer les performances si nécessaire
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_look_items_bounding_box ON look_items USING GIN (bounding_box);