import React from 'react';
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

export default function GridClothingItem({ 
  item, 
  onPress, 
  onToggleFavorite, 
  onDelete, 
  deleteMode = false 
}) {
  const getSeasonLabel = (season) => {
    const labels = {
      'spring': '🌸',
      'summer': '☀️',
      'fall': '🍂',
      'winter': '❄️',
      'all_season': '🌍'
    };
    return labels[season] || season;
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

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        
        {/* Boutons d'action */}
        <View style={styles.actionBar}>
          <FavoriteButton
            isFavorite={item.isFavorite}
            onToggle={onToggleFavorite}
            size={16}
          />
          {deleteMode && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={onDelete}
            >
              <Ionicons name="trash" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        {item.brand && (
          <Text style={styles.brand} numberOfLines={1}>{item.brand}</Text>
        )}
        
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
        
        {/* Saisons */}
        {item.seasons && item.seasons.length > 0 && (
          <View style={styles.seasonRow}>
            {item.seasons.slice(0, 4).map((season, index) => (
              <Text key={index} style={styles.seasonIcon}>
                {getSeasonLabel(season)}
              </Text>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

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
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  brand: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
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
  seasonRow: {
    flexDirection: 'row',
    gap: 4,
  },
  seasonIcon: {
    fontSize: 14,
  },
});