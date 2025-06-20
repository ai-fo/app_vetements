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
  RefreshControl,
  Alert
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
  const { items, loading, filters, applyFilters, refreshWardrobe, toggleFavorite, deleteItem } = useWardrobe(user?.id);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWardrobe();
    setRefreshing(false);
  };

  const handleDeleteItem = async (itemId, itemName) => {
    Alert.alert(
      'Supprimer cet article',
      `Êtes-vous sûr de vouloir supprimer "${itemName}" de votre garde-robe ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            const success = await deleteItem(itemId);
            if (!success) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'article');
            }
          }
        },
      ]
    );
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


  const renderListItem = (item) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => setSelectedItem(item)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.listItemImage} />
      
      <View style={styles.listItemContent}>
        <View style={styles.listItemHeader}>
          <Text style={styles.listItemName}>{item.name}</Text>
          <View style={styles.listItemActions}>
            <FavoriteButton
              isFavorite={item.isFavorite}
              onToggle={() => toggleFavorite(item.id)}
              size={16}
            />
            {deleteMode && (
              <TouchableOpacity 
                style={styles.listDeleteButton}
                onPress={() => handleDeleteItem(item.id, item.name)}
              >
                <Ionicons name="trash" size={18} color="#ef4444" />
              </TouchableOpacity>
            )}
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
          
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={() => setDeleteMode(!deleteMode)}
              style={[styles.headerButton, deleteMode && styles.headerButtonActive]}
            >
              <Ionicons 
                name={deleteMode ? 'close' : 'trash-outline'} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
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
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {renderListItem(item)}
              </React.Fragment>
            ))}
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  headerButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
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
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listDeleteButton: {
    marginLeft: 12,
    padding: 4,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
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