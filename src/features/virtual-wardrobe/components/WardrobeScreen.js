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
  Alert,
  Animated,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../auth';
import { useWardrobe } from '../hooks/useWardrobe';
import { ItemType, ClothingCategory, Season } from '../types/wardrobe.types';
import ItemDetailsModal from './ItemDetailsModal';
import FilterBar from './FilterBar';
import FavoriteButton from './FavoriteButton';
import CategoryCarousel from './CategoryCarousel';

const { width } = Dimensions.get('window');

export default function WardrobeScreen({ navigation }) {
  const { user } = useAuth();
  const { items, loading, filters, applyFilters, refreshWardrobe, toggleFavorite, deleteItem } = useWardrobe(user?.id);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showMenu, setShowMenu] = useState(false);

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
      <Ionicons name="shirt-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyStateTitle}>Votre garde-robe est vide</Text>
      <Text style={styles.emptyStateText}>
        Commencez à ajouter des vêtements en utilisant l'appareil photo
      </Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddOutfit')}
      >
        <View style={styles.addButtonGradient}>
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter une tenue</Text>
        </View>
      </TouchableOpacity>
    </View>
  );


  const groupItemsByCategory = (items) => {
    const grouped = {};
    const categoryOrder = ['Hauts', 'Bas', 'Robes', 'Vestes', 'Chaussures', 'Accessoires'];
    
    // Initialiser toutes les catégories
    categoryOrder.forEach(cat => {
      grouped[cat] = [];
    });
    
    // Grouper les items
    items.forEach(item => {
      if (item.itemType === 'OUTFIT') return; // Skip outfits
      
      const category = getCategoryLabel(item.category);
      if (grouped[category]) {
        grouped[category].push(item);
      }
    });
    
    // Retourner seulement les catégories non vides dans l'ordre
    return categoryOrder
      .filter(cat => grouped[cat].length > 0)
      .map(cat => ({ category: cat, items: grouped[cat] }));
  };
  
  const getCategoryLabel = (category) => {
    const categoryMap = {
      'top': 'Hauts',
      't-shirt': 'Hauts',
      'shirt': 'Hauts',
      'blouse': 'Hauts',
      'sweater': 'Hauts',
      'hoodie': 'Hauts',
      'tank_top': 'Hauts',
      
      'bottom': 'Bas',
      'pants': 'Bas',
      'jeans': 'Bas',
      'shorts': 'Bas',
      'skirt': 'Bas',
      'leggings': 'Bas',
      
      'dress': 'Robes',
      'jumpsuit': 'Robes',
      'overall': 'Robes',
      
      'outerwear': 'Vestes',
      'jacket': 'Vestes',
      'coat': 'Vestes',
      'vest': 'Vestes',
      'blazer': 'Vestes',
      
      'shoes': 'Chaussures',
      'sneakers': 'Chaussures',
      'boots': 'Chaussures',
      'sandals': 'Chaussures',
      'heels': 'Chaussures',
      
      'accessory': 'Accessoires',
      'bag': 'Accessoires',
      'hat': 'Accessoires',
      'scarf': 'Accessoires',
      'belt': 'Accessoires',
      'jewelry': 'Accessoires',
      'sunglasses': 'Accessoires',
    };
    return categoryMap[category?.toLowerCase()] || 'Accessoires';
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
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Espace pour le contenu sous le header flottant */}
        <View style={{ height: 120 }} />
        
        {/* Stats */}
        <View style={styles.searchSection}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{items.filter(item => item.itemType !== 'OUTFIT').length}</Text>
              <Text style={styles.statLabel}>Pièces</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{items.filter(item => item.itemType === 'OUTFIT').length}</Text>
              <Text style={styles.statLabel}>Tenues</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{items.filter(i => i.isFavorite).length}</Text>
              <Text style={styles.statLabel}>Favoris</Text>
            </View>
          </View>
        </View>

        {deleteMode && (
          <View style={styles.deleteModeBar}>
            <Text style={styles.deleteModeText}>Mode suppression activé</Text>
            <TouchableOpacity onPress={() => setDeleteMode(false)}>
              <Text style={styles.deleteModeCancel}>Terminer</Text>
            </TouchableOpacity>
          </View>
        )}
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        {(() => {
          // Filtrer les items visibles (sans les tenues)
          const visibleItems = items.filter(item => item.itemType !== 'OUTFIT');
          
          // Vérifier si des filtres sont actifs
          const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== false);
          
          // Si des filtres sont actifs mais aucun résultat
          if (hasActiveFilters && items.length === 0) {
            return (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={48} color="#d1d5db" />
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
          
          // Séparer les tenues complètes et les pièces individuelles
          const outfits = items.filter(item => item.itemType === 'OUTFIT');
          const individualItems = visibleItems;
          const groupedItems = groupItemsByCategory(individualItems);
          
          return (
            <View style={styles.carouselContainer}>
              {/* Section Tenues complètes si il y en a */}
              {outfits.length > 0 && (
                <CategoryCarousel
                  category="Tenues complètes"
                  items={outfits}
                  onItemPress={(item) => navigation.navigate('ClothingDetail', { item })}
                  onToggleFavorite={toggleFavorite}
                  deleteMode={deleteMode}
                  onDeleteItem={handleDeleteItem}
                />
              )}
              
              {/* Sections par catégorie pour les pièces individuelles */}
              {groupedItems.map(({ category, items }) => (
                <CategoryCarousel
                  key={category}
                  category={category}
                  items={items}
                  onItemPress={(item) => navigation.navigate('ClothingDetail', { item })}
                  onToggleFavorite={toggleFavorite}
                  deleteMode={deleteMode}
                  onDeleteItem={handleDeleteItem}
                />
              ))}
            </View>
          );
        })()}
        </Animated.View>
      </ScrollView>
      
      {/* Header flottant */}
      <View style={styles.floatingHeader}>
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={22} color="#4a4458" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleWrapper}>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitlePrefix}>Ma</Text>
                <Text style={styles.headerTitle}>Garde-robe</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              onPress={() => setShowMenu(true)}
              style={styles.menuButton}
            >
              <Ionicons 
                name="ellipsis-horizontal" 
                size={20} 
                color="#6b5b95" 
              />
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

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
          <View style={styles.floatingButtonGradient}>
            <Ionicons name="add" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      )}

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setDeleteMode(true);
                setShowMenu(false);
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={styles.menuItemText}>Mode suppression</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                // TODO: Implement sort functionality
                setShowMenu(false);
              }}
            >
              <Ionicons name="swap-vertical-outline" size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>Trier</Text>
            </TouchableOpacity>
            
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blurContainer: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(139, 122, 168, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  headerTitlePrefix: {
    fontSize: 18,
    fontFamily: 'Manrope-Regular',
    color: '#8b7aa8',
    letterSpacing: -0.3,
    marginRight: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Manrope-SemiBold',
    color: '#4a4458',
    letterSpacing: -0.3,
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
    fontSize: 20,
    fontFamily: 'Manrope-SemiBold',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
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
    backgroundColor: '#1a1a1a',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Manrope-Medium',
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  carouselContainer: {
    paddingTop: 8,
    paddingBottom: 100,
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
    backgroundColor: '#b794f4',
    shadowColor: '#b794f4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontFamily: 'Manrope-SemiBold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  noResultsText: {
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  clearFiltersButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  clearFiltersButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Manrope-Medium',
    letterSpacing: -0.2,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: '#fdfcff',
    borderRadius: 16,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 15,
    fontFamily: 'Manrope-Regular',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  deleteModeBar: {
    backgroundColor: '#fff5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fed0d0',
  },
  deleteModeText: {
    fontSize: 13,
    fontFamily: 'Manrope-Medium',
    color: '#ef4444',
  },
  deleteModeCancel: {
    fontSize: 13,
    fontFamily: 'Manrope-SemiBold',
    color: '#ef4444',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Manrope-SemiBold',
    color: '#4a4458',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Manrope-Regular',
    color: '#8b7aa8',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#d8d0e8',
    marginHorizontal: 20,
  },
});