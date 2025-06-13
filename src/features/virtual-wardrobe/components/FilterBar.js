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
import { ItemType, ClothingCategory, Season } from '../types';

export default function FilterBar({ filters, onFiltersChange }) {
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const activeFiltersCount = Object.values(filters).filter(v => v !== null).length;

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
    { key: 'itemType', value: ItemType.OUTFIT, label: '👔 Tenues' },
    { key: 'itemType', value: ItemType.SINGLE_PIECE, label: '👕 Pièces' },
    { key: 'season', value: Season.SUMMER, label: '☀️ Été' },
    { key: 'season', value: Season.WINTER, label: '❄️ Hiver' },
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
            <Ionicons name="options" size={18} color={activeFiltersCount > 0 ? '#fff' : '#667eea'} />
            <Text style={[styles.filterButtonText, activeFiltersCount > 0 && styles.filterButtonTextActive]}>
              Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Text>
          </TouchableOpacity>

          {quickFilters.map((filter, index) => {
            const isActive = filters[filter.key] === filter.value;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.quickFilter, isActive && styles.quickFilterActive]}
                onPress={() => {
                  onFiltersChange({
                    ...filters,
                    [filter.key]: isActive ? null : filter.value
                  });
                }}
              >
                <Text style={[styles.quickFilterText, isActive && styles.quickFilterTextActive]}>
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
                <Ionicons name="close" size={24} color="#4b5563" />
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
    'top': 'Hauts',
    'bottom': 'Bas',
    'dress': 'Robes',
    'outerwear': 'Vestes',
    'shoes': 'Chaussures',
    'accessory': 'Accessoires',
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
  },
  filterButtonText: {
    color: '#667eea',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  quickFilter: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  quickFilterActive: {
    backgroundColor: '#667eea',
  },
  quickFilterText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '500',
  },
  quickFilterTextActive: {
    color: '#fff',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 10,
  },
  clearButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: '#667eea',
  },
  filterOptionText: {
    color: '#4b5563',
    fontSize: 14,
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
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
    backgroundColor: '#f3f4f6',
  },
  modalButtonPrimary: {
    backgroundColor: '#667eea',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  modalButtonTextPrimary: {
    color: '#fff',
  },
});