import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FavoriteButton from './FavoriteButton';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2;

export default function OutfitPiecesCropped({ 
  outfit, 
  onPiecePress, 
  onToggleFavorite, 
  onDelete, 
  deleteMode = false 
}) {
  const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });

  const handleImageLoad = (event) => {
    const { width, height } = event.nativeEvent.source;
    setImageDimensions({ width, height });
  };

  const getColorCode = (colorName) => {
    const colorMap = {
      'black': '#000000',
      'white': '#FFFFFF',
      'grey': '#808080',
      'gray': '#808080',
      'navy': '#000080',
      'blue': '#0000FF',
      'red': '#FF0000',
      'green': '#008000',
      'yellow': '#FFFF00',
      'orange': '#FFA500',
      'pink': '#FFC0CB',
      'purple': '#800080',
      'brown': '#A52A2A',
      'beige': '#F5F5DC',
      'cream': '#FFFDD0',
    };
    return colorMap[colorName?.toLowerCase()] || '#E5E7EB';
  };

  const renderPieceItem = (piece, index) => {
    console.log(`🔍 Rendering piece ${index}:`, {
      id: piece.id,
      name: piece.name || piece.piece_type,
      bounding_box: piece.bounding_box,
      image_url: piece.image_url,
      has_cropped_image: !!piece.image_url
    });

    // Vérifier si on a une image découpée sauvegardée pour cette pièce
    const hasIndividualImage = piece.image_url && piece.image_url !== outfit.imageUrl;
    
    return (
      <TouchableOpacity
        key={`piece-${index}-${piece.id}`}
        style={styles.pieceContainer}
        onPress={() => onPiecePress && onPiecePress(piece)}
      >
        <View style={styles.imageContainer}>
          {hasIndividualImage ? (
            // Utiliser l'image découpée sauvegardée dans le bucket
            <Image 
              source={{ uri: piece.image_url }} 
              style={styles.pieceImage}
              onLoad={() => console.log(`✅ Image découpée chargée pour ${piece.name}`)}
              onError={(error) => console.error(`❌ Erreur chargement image découpée:`, error)}
              resizeMode="cover"
            />
          ) : piece.bounding_box ? (
            // Fallback: utiliser le CSS cropping si pas d'image individuelle
            <View style={styles.imageWrapper}>
              <Image 
                source={{ uri: outfit.imageUrl }} 
                style={[
                  styles.croppedImage,
                  {
                    width: imageDimensions.width,
                    height: imageDimensions.height,
                  }
                ]}
                onLoad={handleImageLoad}
                resizeMode="cover"
              />
              <Text style={styles.debugText}>CSS Crop Fallback</Text>
            </View>
          ) : (
            // Placeholder si aucune image disponible
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={40} color="#9ca3af" />
              <Text style={styles.debugText}>No Image</Text>
            </View>
          )}
          
          {/* Badge type de pièce */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {piece.piece_type || 'Vêtement'}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionBar}>
            {deleteMode && (
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => onDelete && onDelete(piece.id, piece.name)}
              >
                <Ionicons name="trash" size={16} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.pieceContent}>
          <Text style={styles.pieceName} numberOfLines={2}>
            {piece.name || piece.piece_type}
          </Text>
          
          {/* Affichage des couleurs */}
          {piece.colors && piece.colors.primary && piece.colors.primary.length > 0 && (
            <View style={styles.colorRow}>
              {piece.colors.primary.slice(0, 3).map((color, colorIndex) => (
                <View 
                  key={colorIndex} 
                  style={[styles.colorDot, { backgroundColor: getColorCode(color) }]} 
                />
              ))}
              {piece.colors.primary.length > 3 && (
                <Text style={styles.moreColors}>+{piece.colors.primary.length - 3}</Text>
              )}
            </View>
          )}
          
          {/* Position dans la tenue */}
          <Text style={styles.positionText}>
            Pos. {piece.position + 1}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Debug pour voir les données reçues
  console.log('OutfitPiecesCropped - outfit:', {
    name: outfit.name,
    pieces: outfit.pieces,
    piecesCount: outfit.pieces?.length || 0,
    imageUrl: outfit.imageUrl
  });

  if (!outfit.pieces || outfit.pieces.length === 0) {
    console.log('Pas de pièces trouvées, affichage fallback');
    return (
      <TouchableOpacity
        style={styles.fallbackContainer}
        onPress={() => onPiecePress && onPiecePress(outfit)}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: outfit.imageUrl }} style={styles.fallbackImage} />
          <View style={styles.outfitBadge}>
            <Ionicons name="shirt" size={12} color="#fff" />
            <Text style={styles.outfitBadgeText}>Tenue</Text>
          </View>
        </View>
        <View style={styles.pieceContent}>
          <Text style={styles.pieceName}>{outfit.name}</Text>
          <Text style={styles.positionText}>Tenue complète</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Retourner tous les éléments découpés
  return (
    <>
      {outfit.pieces.map((piece, index) => renderPieceItem(piece, index))}
    </>
  );
}

const styles = StyleSheet.create({
  pieceContainer: {
    width: ITEM_WIDTH,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 3/4,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  croppedImage: {
    position: 'absolute',
  },
  pieceImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugText: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    fontSize: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionBar: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'column',
    gap: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceContent: {
    padding: 12,
  },
  pieceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  moreColors: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 2,
  },
  positionText: {
    fontSize: 10,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  fallbackContainer: {
    width: ITEM_WIDTH,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
  },
  outfitBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  outfitBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});