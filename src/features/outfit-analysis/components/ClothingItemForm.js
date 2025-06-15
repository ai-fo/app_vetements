import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { wardrobeAPI } from '../../virtual-wardrobe/api';
import { ItemType } from '../../virtual-wardrobe/types';
import { storageService } from '../../../shared/api/storage';

export default function ClothingItemForm({ navigation, route }) {
  const { imageUri, userId } = route.params;
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload de l'image vers Supabase Storage
      const fileName = `${userId}/clothing/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const { publicUrl: imageUrl, path: imagePath } = await storageService.uploadPhoto(
        imageUri,
        fileName
      );

      // Créer l'item dans la garde-robe avec l'URL Supabase
      // Les détails seront ajoutés par l'IA plus tard
      const itemData = {
        userId,
        imageUrl, // URL publique depuis Supabase
        imagePath, // Chemin pour suppression ultérieure
        itemType: ItemType.SINGLE_PIECE,
        category: 'top', // Catégorie par défaut, sera mise à jour par l'IA
        colors: [],
        brand: '',
        name: 'Nouveau vêtement', // Nom temporaire
        tags: [],
        materials: [],
        seasons: []
      };

      const { data, error } = await wardrobeAPI.createItem(itemData);

      if (error) {
        // Si erreur, supprimer l'image uploadée
        await storageService.deletePhoto(imagePath);
        throw new Error(error);
      }

      // Naviguer directement vers la garde-robe
      navigation.navigate('WardrobeScreen');
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
          <Text style={styles.headerTitle}>Ajouter à ma garde-robe</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: imageUri }} style={styles.preview} />

          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={24} color="#667eea" />
            <Text style={styles.infoText}>
              La photo sera ajoutée à votre garde-robe. L'IA analysera automatiquement 
              les détails du vêtement (type, couleur, style) ultérieurement.
            </Text>
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
                  <Text style={styles.saveButtonText}>Enregistrer dans ma garde-robe</Text>
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f4ff',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
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