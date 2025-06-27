import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ItemType, ClothingCategory, Season } from '../types/wardrobe.types';

export default function FilterBar({ filters, onFiltersChange }) {
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'isFavorite') return value === true;
    return value !== null;
  }).length;

  const clearFilters = () => {
    onFiltersChange({
      itemType: null,
      category: null,
      season: null,
      color: null,
      brand: null
    });
  };

  const quickFilters = [
    { key: 'isFavorite', value: true, label: 'Favoris', icon: 'heart', color: '#f59e0b', special: true },
    { key: 'category', value: 'top', label: 'Hauts', icon: 'shirt', color: '#3b82f6' },
    { key: 'category', value: 'bottom', label: 'Bas', icon: 'md-menu', color: '#8b5cf6' },
    { key: 'category', value: 'dress', label: 'Robes', icon: 'woman', color: '#ec4899' },
    { key: 'category', value: 'outerwear', label: 'Vestes', icon: 'snow', color: '#06b6d4' },
    { key: 'category', value: 'shoes', label: 'Chaussures', icon: 'walk', color: '#10b981' },
    { key: 'category', value: 'accessory', label: 'Accessoires', icon: 'glasses', color: '#f59e0b' },
  ];

  return (
    <>
      <View style={styles.container}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity 
            style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options" size={16} color={activeFiltersCount > 0 ? '#fff' : '#6b7280'} />
            <Text style={[styles.filterButtonText, activeFiltersCount > 0 && styles.filterButtonTextActive]}>
              Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Text>
          </TouchableOpacity>

          {quickFilters.map((filter, index) => {
            const isActive = filter.key === 'isFavorite' 
              ? filters.isFavorite === true  
              : filters[filter.key] === filter.value;
            
            if (filter.special && isActive) {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.quickFilterSpecialContainer}
                  onPress={() => {
                    onFiltersChange({
                      ...filters,
                      isFavorite: false
                    });
                  }}
                >
                  <View style={[styles.quickFilterSpecialGradient, { backgroundColor: filter.color }]}>
                    <Ionicons name={filter.icon} size={16} color="#fff" />
                    <Text style={[styles.quickFilterTextSpecial, { color: '#fff' }]}>
                      {filter.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickFilter, 
                  isActive && styles.quickFilterActive,
                  isActive && { backgroundColor: filter.color }
                ]}
                onPress={() => {
                  if (filter.key === 'isFavorite') {
                    onFiltersChange({
                      ...filters,
                      isFavorite: !filters.isFavorite
                    });
                  } else {
                    onFiltersChange({
                      ...filters,
                      [filter.key]: isActive ? null : filter.value
                    });
                  }
                }}
              >
                <Ionicons 
                  name={filter.icon} 
                  size={16} 
                  color={isActive ? '#fff' : filter.color} 
                />
                <Text style={[
                  styles.quickFilterText, 
                  isActive && styles.quickFilterTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {activeFiltersCount > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Effacer</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres avancés</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Type d'article</Text>
                <View style={styles.filterOptions}>
                  {Object.values(ItemType).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterOption,
                        filters.itemType === type && styles.filterOptionActive
                      ]}
                      onPress={() => {
                        onFiltersChange({
                          ...filters,
                          itemType: filters.itemType === type ? null : type
                        });
                      }}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.itemType === type && styles.filterOptionTextActive
                      ]}>
                        {type === ItemType.OUTFIT ? 'Tenues complètes' : 'Pièces uniques'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Catégorie</Text>
                <View style={styles.filterOptions}>
                  {Object.entries(ClothingCategory).map(([key, value]) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.filterOption,
                        filters.category === value && styles.filterOptionActive
                      ]}
                      onPress={() => {
                        onFiltersChange({
                          ...filters,
                          category: filters.category === value ? null : value
                        });
                      }}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.category === value && styles.filterOptionTextActive
                      ]}>
                        {getCategoryLabel(value)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Saison</Text>
                <View style={styles.filterOptions}>
                  {Object.entries(Season).map(([key, value]) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.filterOption,
                        filters.season === value && styles.filterOptionActive
                      ]}
                      onPress={() => {
                        onFiltersChange({
                          ...filters,
                          season: filters.season === value ? null : value
                        });
                      }}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.season === value && styles.filterOptionTextActive
                      ]}>
                        {getSeasonLabel(value)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => {
                  clearFilters();
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.modalButtonText}>Réinitialiser</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  Appliquer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const getCategoryLabel = (category) => {
  const labels = {
    // Hauts
    'top': 'Hauts',
    't-shirt': 'T-shirts',
    'shirt': 'Chemises',
    'blouse': 'Blouses',
    'sweater': 'Pulls',
    'hoodie': 'Sweats',
    'tank_top': 'Débardeurs',
    
    // Bas
    'bottom': 'Bas',
    'pants': 'Pantalons',
    'jeans': 'Jeans',
    'shorts': 'Shorts',
    'skirt': 'Jupes',
    'leggings': 'Leggings',
    
    // Pièces complètes
    'dress': 'Robes',
    'jumpsuit': 'Combinaisons',
    'overall': 'Salopettes',
    
    // Vêtements d'extérieur
    'outerwear': 'Vestes',
    'jacket': 'Vestes',
    'coat': 'Manteaux',
    'vest': 'Gilets',
    'blazer': 'Blazers',
    
    // Chaussures
    'shoes': 'Chaussures',
    'sneakers': 'Baskets',
    'boots': 'Bottes',
    'sandals': 'Sandales',
    'heels': 'Talons',
    
    // Accessoires
    'accessory': 'Accessoires',
    'bag': 'Sacs',
    'hat': 'Chapeaux',
    'scarf': 'Écharpes',
    'belt': 'Ceintures',
    'jewelry': 'Bijoux',
    'sunglasses': 'Lunettes',
    
    'full_outfit': 'Tenue complète'
  };
  return labels[category] || category;
};

const getSeasonLabel = (season) => {
  const labels = {
    'spring': 'Printemps',
    'summer': 'Été',
    'fall': 'Automne',
    'winter': 'Hiver',
    'all_season': 'Toutes saisons'
  };
  return labels[season] || season;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f3ff',
    paddingBottom: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#d8d0e8',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterButtonActive: {
    backgroundColor: '#1a1a1a',
    borderColor: 'transparent',
  },
  filterButtonText: {
    color: '#6b5b95',
    marginLeft: 6,
    fontSize: 13,
    fontFamily: 'Manrope-Medium',
    letterSpacing: -0.2,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  quickFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#d8d0e8',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickFilterActive: {
    borderColor: 'transparent',
  },
  quickFilterText: {
    color: '#6b5b95',
    fontSize: 13,
    fontFamily: 'Manrope-Medium',
    letterSpacing: -0.2,
    marginLeft: 6,
  },
  quickFilterTextActive: {
    color: '#fff',
    fontFamily: 'Manrope-SemiBold',
  },
  quickFilterSpecialContainer: {
    marginRight: 10,
  },
  quickFilterSpecialGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickFilterTextSpecial: {
    fontSize: 13,
    fontFamily: 'Manrope-SemiBold',
    letterSpacing: -0.2,
    marginLeft: 6,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 10,
  },
  clearButtonText: {
    color: '#6b5b95',
    fontSize: 13,
    fontFamily: 'Manrope-Medium',
    letterSpacing: -0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fdfcff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Manrope-SemiBold',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 15,
    fontFamily: 'Manrope-SemiBold',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: 'transparent',
  },
  filterOptionActive: {
    backgroundColor: '#1a1a1a',
    borderColor: 'transparent',
  },
  filterOptionText: {
    color: '#4b5563',
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: 'transparent',
  },
  modalButtonPrimary: {
    backgroundColor: '#1a1a1a',
    borderColor: 'transparent',
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: 'Manrope-Medium',
    color: '#6b7280',
    letterSpacing: -0.2,
  },
  modalButtonTextPrimary: {
    color: '#fff',
  },
});