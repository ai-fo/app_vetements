-- Drop des tables existantes si nécessaire
DROP TABLE IF EXISTS clothing_piece_details CASCADE;
DROP TABLE IF EXISTS clothing_pieces CASCADE;
DROP TABLE IF EXISTS outfit_looks CASCADE;
DROP TABLE IF EXISTS user_wardrobe CASCADE;

-- Table pour stocker les pièces de vêtements
CREATE TABLE clothing_pieces (
    piece_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    piece_type VARCHAR(50) NOT NULL, -- tshirt, shirt, blazer, pants, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Attributs JSON
    attributes JSONB NOT NULL DEFAULT '{}', -- colors, material, pattern, fit, details
    style_tags TEXT[] DEFAULT '{}',
    occasion_tags TEXT[] DEFAULT '{}',
    seasonality TEXT[] DEFAULT '{}',
    
    -- Métadonnées
    image_url TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Table pour les tenues complètes
CREATE TABLE outfit_looks (
    look_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Métadonnées du look
    dominant_style TEXT[] DEFAULT '{}',
    occasion_tags TEXT[] DEFAULT '{}',
    seasonality TEXT[] DEFAULT '{}',
    color_palette_global JSONB DEFAULT '{}',
    pattern_mix TEXT[] DEFAULT '{}',
    silhouette VARCHAR(100),
    layering_level INTEGER DEFAULT 1,
    
    -- Autres infos
    notes TEXT,
    rating INTEGER,
    last_worn DATE,
    is_favorite BOOLEAN DEFAULT false
);

-- Table de liaison entre looks et pièces
CREATE TABLE look_pieces (
    look_id UUID REFERENCES outfit_looks(look_id) ON DELETE CASCADE,
    piece_id UUID REFERENCES clothing_pieces(piece_id) ON DELETE CASCADE,
    position INTEGER, -- ordre dans la tenue
    PRIMARY KEY (look_id, piece_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_clothing_pieces_user_id ON clothing_pieces(user_id);
CREATE INDEX idx_clothing_pieces_type ON clothing_pieces(piece_type);
CREATE INDEX idx_clothing_pieces_style_tags ON clothing_pieces USING GIN(style_tags);
CREATE INDEX idx_clothing_pieces_occasion_tags ON clothing_pieces USING GIN(occasion_tags);
CREATE INDEX idx_clothing_pieces_seasonality ON clothing_pieces USING GIN(seasonality);

CREATE INDEX idx_outfit_looks_user_id ON outfit_looks(user_id);
CREATE INDEX idx_outfit_looks_dominant_style ON outfit_looks USING GIN(dominant_style);
CREATE INDEX idx_outfit_looks_occasion_tags ON outfit_looks USING GIN(occasion_tags);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clothing_pieces_updated_at BEFORE UPDATE
    ON clothing_pieces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outfit_looks_updated_at BEFORE UPDATE
    ON outfit_looks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();