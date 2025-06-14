import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { wardrobeAPI } from '../../virtual-wardrobe/api';
import { ItemType } from '../../virtual-wardrobe/types';

const clothingTypes = [
  { id: 'top', label: 'Haut', icon: 'shirt-outline' },
  { id: 'bottom', label: 'Bas', icon: 'woman-outline' },
  { id: 'shoes', label: 'Chaussures', icon: 'footsteps-outline' },
  { id: 'dress', label: 'Robe', icon: 'body-outline' },
  { id: 'outerwear', label: 'Veste', icon: 'snow-outline' },
  { id: 'accessory', label: 'Accessoire', icon: 'glasses-outline' },
];

const commonColors = [
  { name: 'Noir', value: '#000000' },
  { name: 'Blanc', value: '#FFFFFF' },
  { name: 'Gris', value: '#808080' },
  { name: 'Bleu', value: '#0000FF' },
  { name: 'Rouge', value: '#FF0000' },
  { name: 'Vert', value: '#00FF00' },
  { name: 'Jaune', value: '#FFFF00' },
  { name: 'Rose', value: '#FFC0CB' },
  { name: 'Beige', value: '#F5DEB3' },
  { name: 'Marron', value: '#8B4513' },
];

export default function ClothingItemForm({ navigation, route }) {
  const { imageUri, userId } = route.params;
  const [selectedType, setSelectedType] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedType) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type de vêtement');
      return;
    }

    setSaving(true);
    try {
      // Créer l'item dans la garde-robe
      const itemData = {
        userId,
        imageUrl: imageUri, // L'image sera uploadée par le backend
        itemType: ItemType.SINGLE_PIECE,
        category: selectedType,
        colors: selectedColor ? [selectedColor] : [],
        brand: brand.trim() || '',
        name: name.trim() || '',
        tags: [],
        materials: [],
        seasons: []
      };

      const { data, error } = await wardrobeAPI.createItem(itemData);

      if (error) throw new Error(error);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer le vêtement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={['#f9fafb', '#fff']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#667eea" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails du vêtement</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: imageUri }} style={styles.preview} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type de vêtement *</Text>
            <View style={styles.typeGrid}>
              {clothingTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    selectedType === type.id && styles.typeCardSelected
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Ionicons 
                    name={type.icon} 
                    size={32} 
                    color={selectedType === type.id ? '#fff' : '#667eea'} 
                  />
                  <Text style={[
                    styles.typeLabel,
                    selectedType === type.id && styles.typeLabelSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Couleur principale</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.colorList}>
                {commonColors.map((color) => (
                  <TouchableOpacity
                    key={color.name}
                    style={[
                      styles.colorOption,
                      selectedColor === color.name && styles.colorOptionSelected
                    ]}
                    onPress={() => setSelectedColor(color.name)}
                  >
                    <View 
                      style={[
                        styles.colorCircle, 
                        { backgroundColor: color.value },
                        color.value === '#FFFFFF' && styles.whiteColor
                      ]} 
                    />
                    <Text style={styles.colorName}>{color.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Marque (optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Zara, H&M, Nike..."
              placeholderTextColor="#9ca3af"
              value={brand}
              onChangeText={setBrand}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nom du vêtement (optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Chemise bleue, Jean noir..."
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.saveButtonGradient}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  scrollView: {
    flex: 1,
  },
  preview: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  typeLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
    fontWeight: '500',
  },
  typeLabelSelected: {
    color: '#fff',
  },
  colorList: {
    flexDirection: 'row',
    gap: 15,
  },
  colorOption: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  colorOptionSelected: {
    transform: [{ scale: 1.1 }],
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
  },
  whiteColor: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  colorName: {
    fontSize: 12,
    color: '#6b7280',
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  saveButton: {
    margin: 20,
    marginTop: 10,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});