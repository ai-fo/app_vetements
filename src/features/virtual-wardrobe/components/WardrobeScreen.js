import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../auth';
import { useWardrobe } from '../hooks/useWardrobe';
import { ItemType, ClothingCategory, Season } from '../types';
import ItemDetailsModal from './ItemDetailsModal';
import FilterBar from './FilterBar';
import FavoriteButton from './FavoriteButton';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2;

export default function WardrobeScreen({ navigation }) {
  const { user } = useAuth();
  const { items, loading, filters, applyFilters, refreshWardrobe, toggleFavorite } = useWardrobe(user?.id);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWardrobe();
    setRefreshing(false);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="shirt-outline" size={80} color="#667eea" />
      <Text style={styles.emptyStateTitle}>Votre garde-robe est vide</Text>
      <Text style={styles.emptyStateText}>
        Commencez à ajouter des vêtements en utilisant l'appareil photo
      </Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddOutfit')}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.addButtonGradient}
        >
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter une tenue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderItemCard = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.itemCard}
      onPress={() => setSelectedItem(item)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      
      <View style={styles.itemTypeIndicator}>
        <Ionicons 
          name={item.itemType === ItemType.OUTFIT ? 'body' : 'shirt'} 
          size={16} 
          color="#fff" 
        />
      </View>

      <View style={styles.favoriteButton}>
        <FavoriteButton
          isFavorite={item.isFavorite}
          onToggle={() => toggleFavorite(item.id)}
          size={20}
        />
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.itemDetails}>
          <Text style={styles.itemBrand}>{item.brand}</Text>
          <View style={styles.itemColors}>
            {item.colors.slice(0, 3).map((color, index) => (
              <View
                key={index}
                style={[
                  styles.colorDot,
                  { backgroundColor: getColorHex(color) }
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.listItem}
      onPress={() => setSelectedItem(item)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.listItemImage} />
      
      <View style={styles.listItemContent}>
        <View style={styles.listItemHeader}>
          <Text style={styles.listItemName}>{item.name}</Text>
          <View style={styles.listItemHeaderRight}>
            {item.isFavorite && (
              <Ionicons 
                name="star" 
                size={16} 
                color="#f59e0b" 
                style={{ marginRight: 8 }}
              />
            )}
            <View style={[styles.itemTypeIndicator, styles.listItemTypeIndicator]}>
              <Ionicons 
                name={item.itemType === ItemType.OUTFIT ? 'body' : 'shirt'} 
                size={14} 
                color="#fff" 
              />
            </View>
          </View>
        </View>
        
        <Text style={styles.listItemBrand}>{item.brand}</Text>
        
        <View style={styles.listItemTags}>
          {item.seasons.map((season, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{getSeasonLabel(season)}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={{ padding: 8 }}>
        <FavoriteButton
          isFavorite={item.isFavorite}
          onToggle={() => toggleFavorite(item.id)}
          size={20}
        />
      </View>
    </TouchableOpacity>
  );

  const getColorHex = (colorName) => {
    const colors = {
      'noir': '#000000',
      'blanc': '#FFFFFF',
      'bleu': '#3B82F6',
      'rouge': '#EF4444',
      'vert': '#10B981',
      'jaune': '#F59E0B',
      'gris': '#6B7280',
      'rose': '#EC4899',
      'marron': '#92400E',
      'beige': '#D4A574'
    };
    return colors[colorName.toLowerCase()] || '#9CA3AF';
  };

  const getSeasonLabel = (season) => {
    const labels = {
      'spring': '🌸 Printemps',
      'summer': '☀️ Été',
      'fall': '🍂 Automne',
      'winter': '❄️ Hiver',
      'all_season': '🌍 Toutes saisons'
    };
    return labels[season] || season;
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Ma Garde-robe</Text>
          
          <TouchableOpacity onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            <Ionicons 
              name={viewMode === 'grid' ? 'list' : 'grid'} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FilterBar filters={filters} onFiltersChange={applyFilters} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {items.length === 0 ? (
          renderEmptyState()
        ) : viewMode === 'grid' ? (
          <View style={styles.grid}>
            {items.map(renderItemCard)}
          </View>
        ) : (
          <View style={styles.list}>
            {items.map(renderListItem)}
          </View>
        )}
      </ScrollView>

      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          visible={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={(item) => {
            navigation.navigate('ItemEditor', { item });
            setSelectedItem(null);
          }}
          onToggleFavorite={() => {
            toggleFavorite(selectedItem.id);
            setSelectedItem({
              ...selectedItem,
              isFavorite: !selectedItem.isFavorite
            });
          }}
        />
      )}

      {items.length > 0 && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => navigation.navigate('AddOutfit')}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.floatingButtonGradient}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  addButton: {
    marginTop: 20,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  itemCard: {
    width: ITEM_WIDTH,
    marginBottom: 20,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: ITEM_WIDTH * 1.3,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  itemTypeIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
    borderRadius: 20,
    padding: 6,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemBrand: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemColors: {
    flexDirection: 'row',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  listItemHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemTypeIndicator: {
    marginLeft: 8,
  },
  listItemBrand: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  listItemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#4b5563',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});