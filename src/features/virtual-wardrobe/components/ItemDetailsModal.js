import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ItemType } from '../types';
import FavoriteButton from './FavoriteButton';

const { width, height } = Dimensions.get('window');

export default function ItemDetailsModal({ item, visible, onClose, onEdit, onToggleFavorite }) {
  if (!item) return null;

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

  const getMaterialLabel = (material) => {
    const labels = {
      'cotton': 'Coton',
      'wool': 'Laine',
      'silk': 'Soie',
      'polyester': 'Polyester',
      'leather': 'Cuir',
      'denim': 'Denim',
      'linen': 'Lin',
      'cashmere': 'Cachemire',
      'other': 'Autre'
    };
    return labels[material] || material;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#4b5563" />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <View style={styles.typeIndicator}>
                <Ionicons 
                  name={item.itemType === ItemType.OUTFIT ? 'body' : 'shirt'} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.typeText}>
                  {item.itemType === ItemType.OUTFIT ? 'Tenue complète' : 'Pièce unique'}
                </Text>
              </View>
            </View>

            <View style={styles.favoriteHeaderButton}>
              <FavoriteButton
                isFavorite={item.isFavorite}
                onToggle={onToggleFavorite}
                size={24}
              />
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            
            <View style={styles.content}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemBrand}>{item.brand}</Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Couleurs</Text>
                <View style={styles.colorsList}>
                  {item.colors.map((color, index) => (
                    <View key={index} style={styles.colorItem}>
                      <View
                        style={[
                          styles.colorCircle,
                          { backgroundColor: getColorHex(color) }
                        ]}
                      />
                      <Text style={styles.colorName}>{color}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Matières</Text>
                <View style={styles.tagsList}>
                  {item.materials.map((material, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{getMaterialLabel(material)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Saisons</Text>
                <View style={styles.tagsList}>
                  {item.seasons.map((season, index) => (
                    <View key={index} style={styles.seasonTag}>
                      <Text style={styles.seasonText}>{getSeasonLabel(season)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {item.tags && item.tags.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tags</Text>
                  <View style={styles.tagsList}>
                    {item.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.dateInfo}>
                <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
                <Text style={styles.dateText}>
                  Ajouté le {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => onEdit(item)}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.editButtonGradient}
              >
                <Ionicons name="pencil" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Modifier les détails</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 4,
    width: 32,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  favoriteHeaderButton: {
    padding: 4,
    width: 32,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  image: {
    width: width,
    height: width * 1.2,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
  },
  colorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  colorName: {
    fontSize: 14,
    color: '#4b5563',
    textTransform: 'capitalize',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#4b5563',
  },
  seasonTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  seasonText: {
    fontSize: 14,
    color: '#4338ca',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 6,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  editButton: {
    width: '100%',
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});