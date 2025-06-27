import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FavoriteButton from './FavoriteButton';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;
const CARD_MARGIN = 8;

export default function CategoryCarousel({ 
  category, 
  items, 
  onItemPress, 
  onToggleFavorite,
  deleteMode,
  onDeleteItem 
}) {
  if (!items || items.length === 0) return null;

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.card,
        index === 0 && styles.firstCard,
        index === items.length - 1 && styles.lastCard
      ]}
      onPress={() => onItemPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        
        {/* Gradient overlay pour le texte */}
        <LinearGradient
          colors={['transparent', 'transparent', 'rgba(0,0,0,0.2)']}
          style={styles.imageOverlay}
        />
        
        {/* Actions */}
        <View style={styles.cardActions}>
          <FavoriteButton
            isFavorite={item.isFavorite}
            onToggle={() => onToggleFavorite(item.id)}
            size={18}
          />
          {deleteMode && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => onDeleteItem(item.id, item.name)}
            >
              <Ionicons name="close-circle" size={22} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        {item.brand && item.itemType !== 'OUTFIT' && (
          <Text style={styles.itemBrand} numberOfLines={1}>{item.brand}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const getCategoryIcon = () => {
    const iconMap = {
      'Hauts': 'shirt',
      'Bas': 'man',
      'Robes': 'woman',
      'Vestes': 'snow',
      'Chaussures': 'walk',
      'Accessoires': 'glasses',
      'Tenues complètes': 'sparkles',
    };
    return iconMap[category] || 'pricetag';
  };


  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name={getCategoryIcon()} size={20} color="#6b7280" style={styles.categoryIcon} />
          <Text style={styles.sectionTitle}>{category}</Text>
          <Text style={styles.itemCount}>{items.length}</Text>
        </View>
        
        {items.length > 4 && (
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>Voir tout</Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Manrope-SemiBold',
    color: '#4a4458',
    letterSpacing: -0.3,
  },
  itemCount: {
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
    color: '#6b5b95',
    marginLeft: 8,
    backgroundColor: '#ede9f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: 'Manrope-Medium',
    color: '#6b7280',
    marginRight: 4,
  },
  carousel: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
  },
  firstCard: {
    marginLeft: 0,
  },
  lastCard: {
    marginRight: 16,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.3,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fdfcff',
    shadowColor: '#6b5b95',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: '#f5f3ff',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  cardActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 11,
  },
  cardContent: {
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  itemName: {
    fontSize: 14,
    fontFamily: 'Manrope-Medium',
    color: '#4a4458',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  itemBrand: {
    fontSize: 12,
    fontFamily: 'Manrope-Regular',
    color: '#8b7aa8',
    letterSpacing: -0.1,
  },
});