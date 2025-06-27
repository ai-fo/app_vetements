import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../auth';
import { useWardrobe } from '../hooks/useWardrobe';
import { ItemType, ClothingCategory, Season } from '../types/wardrobe.types';
import ItemDetailsModal from './ItemDetailsModal';
import FilterBar from './FilterBar';
import FavoriteButton from './FavoriteButton';

const { width } = Dimensions.get('window');

export default function WardrobeScreen({ navigation }) {
  const { user } = useAuth();
  const { items, loading, filters, applyFilters, refreshWardrobe, toggleFavorite, deleteItem } = useWardrobe(user?.id);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  // Recharger les données quand l'écran devient actif
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refreshWardrobe();
      }
    }, [user?.id, refreshWardrobe])
  );

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

  const handlePiecePress = (piece, bbox) => {
    // Navigation vers les détails de la pièce spécifique
    navigation.navigate('ClothingDetail', { 
      item: {
        id: piece.id,
        name: piece.name || piece.piece_type,
        itemType: 'SINGLE_PIECE',
        category: piece.piece_type,
        colors: piece.colors?.primary || [],
        materials: piece.material ? [piece.material] : [],
        brand: '',
        // Inclure les données de la pièce pour l'affichage détaillé
        rawData: piece
      }
    });
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


  const renderListItem = (item) => {
    const isOutfit = item.itemType === 'OUTFIT';
    
    return (
      <TouchableOpacity 
        style={[styles.listItem, isOutfit && styles.outfitItem]}
        onPress={() => navigation.navigate('ClothingDetail', { item })}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.listItemImage} />
        
        <View style={styles.listItemContent}>
          <Text style={styles.listItemName} numberOfLines={2}>{item.name}</Text>
        </View>
        
        {/* Actions à droite */}
        <View style={styles.listItemActions}>
          <FavoriteButton
            isFavorite={item.isFavorite}
            onToggle={() => toggleFavorite(item.id)}
            size={20}
          />
          {deleteMode && (
            <TouchableOpacity 
              style={styles.listDeleteButton}
              onPress={() => handleDeleteItem(item.id, item.name)}
            >
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
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
        {(() => {
          // Filtrer les items visibles (sans les tenues)
          const visibleItems = items.filter(item => item.itemType !== 'OUTFIT');
          
          // Vérifier si des filtres sont actifs
          const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== false);
          
          // Debug
          console.log('Wardrobe display debug:', {
            totalItems: items.length,
            visibleItems: visibleItems.length,
            hasActiveFilters,
            filters,
            loading
          });
          
          // Si des filtres sont actifs mais aucun résultat
          if (hasActiveFilters && items.length === 0) {
            return (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={60} color="#9ca3af" />
                <Text style={styles.noResultsTitle}>Aucun article trouvé</Text>
                <Text style={styles.noResultsText}>
                  Essayez de modifier vos filtres pour voir plus de résultats
                </Text>
                <TouchableOpacity 
                  style={styles.clearFiltersButton}
                  onPress={() => applyFilters({
                    itemType: null,
                    category: null,
                    season: null,
                    color: null,
                    brand: null,
                    isFavorite: false
                  })}
                >
                  <Text style={styles.clearFiltersButtonText}>Effacer les filtres</Text>
                </TouchableOpacity>
              </View>
            );
          }
          
          // Si aucun item et aucun filtre (garde-robe vraiment vide)
          if (items.length === 0 && !loading) {
            return renderEmptyState();
          }
          
          // Si on a des items mais tous sont des tenues (donc rien à afficher)
          if (visibleItems.length === 0 && items.length > 0) {
            return (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  Aucune pièce individuelle à afficher
                </Text>
              </View>
            );
          }
          
          // Afficher la liste normale
          return (
            <View style={styles.list}>
              {visibleItems.map((item, index) => (
                <React.Fragment key={item.id || `item-${index}`}>
                  {renderListItem(item)}
                </React.Fragment>
              ))}
            </View>
          );
        })()}
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
    width: 70,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  listDeleteButton: {
    marginLeft: 12,
    padding: 4,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  outfitItem: {
    borderColor: '#667eea',
    borderWidth: 2,
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
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  clearFiltersButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  clearFiltersButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});