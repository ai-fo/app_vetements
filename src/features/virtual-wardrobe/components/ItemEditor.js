import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWardrobe } from '../hooks/useWardrobe';
import { ItemType, ClothingCategory, Season, Material } from '../types';

export default function ItemEditor({ navigation, route }) {
  const { item } = route.params;
  const { updateItem, deleteItem } = useWardrobe();
  
  const [formData, setFormData] = useState({
    name: item.name,
    brand: item.brand,
    itemType: item.itemType,
    category: item.category,
    colors: item.colors,
    materials: item.materials,
    seasons: item.seasons,
    tags: item.tags || [],
    isFavorite: item.isFavorite || false,
  });
  
  const [loading, setLoading] = useState(false);
  const [newColor, setNewColor] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleSave = async () => {
    setLoading(true);
    const success = await updateItem(item.id, formData);
    setLoading(false);
    
    if (success) {
      Alert.alert('Succès', 'Les modifications ont été enregistrées');
      navigation.goBack();
    } else {
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer cet article',
      'Êtes-vous sûr de vouloir supprimer cet article de votre garde-robe ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const success = await deleteItem(item.id);
            setLoading(false);
            
            if (success) {
              navigation.navigate('WardrobeScreen');
            } else {
              Alert.alert('Erreur', 'Impossible de supprimer l\'article');
            }
          }
        },
      ]
    );
  };

  const addColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData({
        ...formData,
        colors: [...formData.colors, newColor.trim()]
      });
      setNewColor('');
    }
  };

  const removeColor = (color) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter(c => c !== color)
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const toggleSelection = (key, value) => {
    const current = formData[key];
    let updated;
    
    if (Array.isArray(current)) {
      updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
    } else {
      updated = current === value ? null : value;
    }
    
    setFormData({ ...formData, [key]: updated });
  };

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
          
          <Text style={styles.headerTitle}>Modifier l'article</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => setFormData({ ...formData, isFavorite: !formData.isFavorite })}
              style={{ marginRight: 16 }}
            >
              <Ionicons 
                name={formData.isFavorite ? 'star' : 'star-outline'} 
                size={24} 
                color={formData.isFavorite ? '#f59e0b' : '#fff'} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom de l'article</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ex: Robe d'été fleurie"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Marque</Text>
            <TextInput
              style={styles.input}
              value={formData.brand}
              onChangeText={(text) => setFormData({ ...formData, brand: text })}
              placeholder="Ex: Zara, H&M, etc."
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type d'article</Text>
            <View style={styles.optionsRow}>
              {Object.values(ItemType).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.option,
                    formData.itemType === type && styles.optionActive
                  ]}
                  onPress={() => setFormData({ ...formData, itemType: type })}
                >
                  <Ionicons 
                    name={type === ItemType.OUTFIT ? 'body' : 'shirt'} 
                    size={20} 
                    color={formData.itemType === type ? '#fff' : '#667eea'}
                  />
                  <Text style={[
                    styles.optionText,
                    formData.itemType === type && styles.optionTextActive
                  ]}>
                    {type === ItemType.OUTFIT ? 'Tenue complète' : 'Pièce unique'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catégorie</Text>
            <View style={styles.optionsGrid}>
              {Object.entries(ClothingCategory).map(([key, value]) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.gridOption,
                    formData.category === value && styles.gridOptionActive
                  ]}
                  onPress={() => setFormData({ ...formData, category: value })}
                >
                  <Text style={[
                    styles.gridOptionText,
                    formData.category === value && styles.gridOptionTextActive
                  ]}>
                    {getCategoryLabel(value)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Couleurs</Text>
            <View style={styles.colorsList}>
              {formData.colors.map((color, index) => (
                <View key={index} style={styles.colorTag}>
                  <Text style={styles.colorTagText}>{color}</Text>
                  <TouchableOpacity onPress={() => removeColor(color)}>
                    <Ionicons name="close-circle" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput
                style={styles.addInput}
                value={newColor}
                onChangeText={setNewColor}
                placeholder="Ajouter une couleur"
                onSubmitEditing={addColor}
              />
              <TouchableOpacity style={styles.addButton} onPress={addColor}>
                <Ionicons name="add" size={24} color="#667eea" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Matières</Text>
            <View style={styles.optionsGrid}>
              {Object.entries(Material).map(([key, value]) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.gridOption,
                    formData.materials.includes(value) && styles.gridOptionActive
                  ]}
                  onPress={() => toggleSelection('materials', value)}
                >
                  <Text style={[
                    styles.gridOptionText,
                    formData.materials.includes(value) && styles.gridOptionTextActive
                  ]}>
                    {getMaterialLabel(value)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saisons</Text>
            <View style={styles.optionsGrid}>
              {Object.entries(Season).map(([key, value]) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.gridOption,
                    formData.seasons.includes(value) && styles.gridOptionActive
                  ]}
                  onPress={() => toggleSelection('seasons', value)}
                >
                  <Text style={[
                    styles.gridOptionText,
                    formData.seasons.includes(value) && styles.gridOptionTextActive
                  ]}>
                    {getSeasonLabel(value)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsList}>
              {formData.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <Ionicons name="close-circle" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput
                style={styles.addInput}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Ajouter un tag"
                onSubmitEditing={addTag}
              />
              <TouchableOpacity style={styles.addButton} onPress={addTag}>
                <Ionicons name="add" size={24} color="#667eea" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.saveButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getCategoryLabel = (category) => {
  const labels = {
    'top': 'Haut',
    'bottom': 'Bas',
    'dress': 'Robe',
    'outerwear': 'Veste',
    'shoes': 'Chaussures',
    'accessory': 'Accessoire',
    'full_outfit': 'Tenue complète'
  };
  return labels[category] || category;
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
  },
  optionActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  optionText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  optionTextActive: {
    color: '#fff',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridOption: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
  },
  gridOptionActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  gridOptionText: {
    color: '#4b5563',
    fontSize: 14,
  },
  gridOptionTextActive: {
    color: '#fff',
  },
  colorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  colorTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  colorTagText: {
    color: '#4338ca',
    fontSize: 14,
    marginRight: 6,
    textTransform: 'capitalize',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#4b5563',
    fontSize: 14,
    marginRight: 6,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    width: '100%',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});