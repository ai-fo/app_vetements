import pytest
import json
from uuid import UUID
from backend.schemas.clothing_analysis import (
    SinglePieceResponse,
    CompleteLookResponse,
    ClothingPiece,
    PieceAttributes,
    PieceColors,
    LookMeta,
    ColorPaletteGlobal
)


def test_single_piece_structure():
    """Test de la structure pour une pièce unique"""
    
    # Créer une pièce unique
    piece = ClothingPiece(
        piece_id=UUID("12345678-1234-5678-1234-567812345678"),
        piece_type="tshirt",
        attributes=PieceAttributes(
            colors=PieceColors(
                primary=["white"],
                secondary=["black"]
            ),
            material="coton",
            pattern="uni",
            fit="regular",
            details=["crewneck", "short_sleeves"]
        ),
        style_tags=["casual", "minimaliste"],
        occasion_tags=["weekend", "casual"],
        seasonality=["spring", "summer"]
    )
    
    # Créer la réponse
    response = SinglePieceResponse(
        capture_type="single_piece",
        pieces=[piece]
    )
    
    # Vérifier la structure
    assert response.capture_type == "single_piece"
    assert len(response.pieces) == 1
    assert response.pieces[0].piece_type == "tshirt"
    assert response.pieces[0].attributes.material == "coton"
    assert "white" in response.pieces[0].attributes.colors.primary
    
    # Vérifier la sérialisation JSON
    json_str = response.model_dump_json()
    data = json.loads(json_str)
    assert data["capture_type"] == "single_piece"
    assert len(data["pieces"]) == 1


def test_complete_look_structure():
    """Test de la structure pour une tenue complète"""
    
    # Créer plusieurs pièces
    pieces = [
        ClothingPiece(
            piece_id=UUID("12345678-1234-5678-1234-567812345678"),
            piece_type="tshirt",
            attributes=PieceAttributes(
                colors=PieceColors(primary=["light-grey"]),
                material="coton",
                pattern="uni",
                fit="regular",
                details=["crewneck"]
            ),
            style_tags=["casual"],
            occasion_tags=["weekend"],
            seasonality=["spring", "summer"]
        ),
        ClothingPiece(
            piece_id=UUID("87654321-4321-8765-4321-876543218765"),
            piece_type="pants",
            attributes=PieceAttributes(
                colors=PieceColors(primary=["black"]),
                material="denim",
                pattern="uni",
                fit="loose",
                details=["cargo_pockets"]
            ),
            style_tags=["streetwear"],
            occasion_tags=["weekend"],
            seasonality=["spring", "summer", "fall"]
        ),
        ClothingPiece(
            piece_id=UUID("11111111-2222-3333-4444-555555555555"),
            piece_type="shoes",
            attributes=PieceAttributes(
                colors=PieceColors(primary=["white"], secondary=["red"]),
                material="cuir",
                pattern="logo",
                fit="regular",
                details=["low_top"]
            ),
            style_tags=["sportswear"],
            occasion_tags=["weekend", "casual"],
            seasonality=["spring", "summer", "fall", "winter"]
        )
    ]
    
    # Créer les métadonnées du look
    look_meta = LookMeta(
        look_id=UUID("99999999-8888-7777-6666-555555555555"),
        dominant_style=["casual", "streetwear"],
        occasion_tags=["weekend"],
        seasonality=["spring", "summer"],
        color_palette_global=ColorPaletteGlobal(
            primary=["white", "black", "grey"],
            accent=["red"]
        ),
        pattern_mix=["uni", "logo"],
        silhouette="slim_top_loose_bottom",
        layering_level=1
    )
    
    # Créer la réponse
    response = CompleteLookResponse(
        capture_type="complete_look",
        pieces=pieces,
        look_meta=look_meta
    )
    
    # Vérifier la structure
    assert response.capture_type == "complete_look"
    assert len(response.pieces) == 3
    assert response.look_meta.silhouette == "slim_top_loose_bottom"
    assert response.look_meta.layering_level == 1
    assert "casual" in response.look_meta.dominant_style
    
    # Vérifier les types de pièces
    piece_types = [p.piece_type for p in response.pieces]
    assert "tshirt" in piece_types
    assert "pants" in piece_types
    assert "shoes" in piece_types
    
    # Vérifier la sérialisation JSON
    json_str = response.model_dump_json()
    data = json.loads(json_str)
    assert data["capture_type"] == "complete_look"
    assert len(data["pieces"]) == 3
    assert "look_meta" in data


def test_uuid_validation():
    """Test que les UUIDs sont correctement validés"""
    
    # Test avec un UUID valide
    piece = ClothingPiece(
        piece_id=UUID("12345678-1234-5678-1234-567812345678"),
        piece_type="tshirt",
        attributes=PieceAttributes(
            colors=PieceColors(primary=["white"]),
            material="coton",
            pattern="uni",
            fit="regular",
            details=[]
        ),
        style_tags=["casual"],
        occasion_tags=["weekend"],
        seasonality=["summer"]
    )
    
    assert isinstance(piece.piece_id, UUID)
    
    # Vérifier que l'UUID est sérialisé correctement
    json_str = piece.model_dump_json()
    data = json.loads(json_str)
    assert data["piece_id"] == "12345678-1234-5678-1234-567812345678"


def test_seasonality_validation():
    """Test que les saisons sont correctement validées"""
    
    # Test avec des saisons valides
    piece = ClothingPiece(
        piece_id=UUID("12345678-1234-5678-1234-567812345678"),
        piece_type="tshirt",
        attributes=PieceAttributes(
            colors=PieceColors(primary=["white"]),
            material="coton",
            pattern="uni",
            fit="regular",
            details=[]
        ),
        style_tags=["casual"],
        occasion_tags=["weekend"],
        seasonality=["spring", "summer", "fall", "winter"]
    )
    
    assert len(piece.seasonality) == 4
    assert all(season in ["spring", "summer", "fall", "winter"] for season in piece.seasonality)


def test_layering_level_validation():
    """Test que le niveau de layering est correctement validé"""
    
    # Test avec un niveau valide
    look_meta = LookMeta(
        look_id=UUID("99999999-8888-7777-6666-555555555555"),
        dominant_style=["casual"],
        occasion_tags=["weekend"],
        seasonality=["summer"],
        color_palette_global=ColorPaletteGlobal(primary=["black"]),
        pattern_mix=["uni"],
        silhouette="regular",
        layering_level=3
    )
    
    assert look_meta.layering_level == 3
    
    # Test avec un niveau invalide (devrait lever une exception)
    with pytest.raises(ValueError):
        LookMeta(
            look_id=UUID("99999999-8888-7777-6666-555555555555"),
            dominant_style=["casual"],
            occasion_tags=["weekend"],
            seasonality=["summer"],
            color_palette_global=ColorPaletteGlobal(primary=["black"]),
            pattern_mix=["uni"],
            silhouette="regular",
            layering_level=6  # Max est 5
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])