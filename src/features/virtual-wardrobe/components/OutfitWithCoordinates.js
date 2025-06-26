import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2;

export default function OutfitWithCoordinates({ item, onPress, onPiecePress }) {
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });

  const handleImageLoad = (event) => {
    const { width, height } = event.nativeEvent.source;
    setImageDimensions({ width, height });
  };

  const handleLayoutChange = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setDisplayDimensions({ width, height });
  };

  const renderBoundingBoxes = () => {
    if (!item.pieces || item.pieces.length === 0 || !displayDimensions.width) return null;

    return item.pieces.map((piece, index) => {
      if (!piece.bounding_box) return null;

      const bbox = piece.bounding_box;
      
      // Calculer les positions réelles basées sur les coordonnées normalisées
      const absoluteX = bbox.x * displayDimensions.width;
      const absoluteY = bbox.y * displayDimensions.height;
      const absoluteWidth = bbox.width * displayDimensions.width;
      const absoluteHeight = bbox.height * displayDimensions.height;

      return (
        <TouchableOpacity
          key={`bbox-${index}-${piece.id}`}
          style={[
            styles.boundingBox,
            {
              left: absoluteX,
              top: absoluteY,
              width: absoluteWidth,
              height: absoluteHeight,
            }
          ]}
          onPress={() => onPiecePress && onPiecePress(piece, bbox)}
          activeOpacity={0.7}
        >
          <View style={styles.boundingBoxContent}>
            <Text style={styles.boundingBoxLabel} numberOfLines={1}>
              {piece.name || piece.piece_type}
            </Text>
            <Ionicons name="scan-outline" size={10} color="#fff" />
          </View>
        </TouchableOpacity>
      );
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <View style={styles.imageWrapper} onLayout={handleLayoutChange}>
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.image} 
            onLoad={handleImageLoad}
          />
          
          {/* Overlay avec les bounding boxes */}
          {displayDimensions.width > 0 && (
            <View style={styles.overlayContainer}>
              {renderBoundingBoxes()}
            </View>
          )}
        </View>
        
        {/* Badge tenue */}
        <View style={styles.outfitBadge}>
          <Ionicons name="shirt" size={12} color="#fff" />
          <Text style={styles.outfitBadgeText}>Tenue</Text>
        </View>

        {/* Indicateur de zones interactives */}
        {item.pieces && item.pieces.length > 0 && (
          <View style={styles.interactiveBadge}>
            <Ionicons name="scan" size={14} color="#667eea" />
            <Text style={styles.interactiveBadgeText}>
              {item.pieces.length} zones
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.details}>
          {item.styleTags?.join(', ') || 'Tenue complète'}
        </Text>
        
        {/* Affichage des couleurs principales */}
        {item.colors && item.colors.length > 0 && (
          <View style={styles.colorRow}>
            {item.colors.slice(0, 3).map((color, index) => (
              <View key={index} style={[styles.colorDot, { backgroundColor: getColorCode(color) }]} />
            ))}
            {item.colors.length > 3 && (
              <Text style={styles.moreColors}>+{item.colors.length - 3}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Fonction utilitaire pour convertir les noms de couleurs en codes
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

const styles = StyleSheet.create({
  container: {
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
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: 3/4,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  boundingBox: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 20,
    minWidth: 30,
  },
  boundingBoxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
    maxWidth: '90%',
  },
  boundingBoxLabel: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
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
  interactiveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  interactiveBadgeText: {
    color: '#667eea',
    fontSize: 9,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  details: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
});