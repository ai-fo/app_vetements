import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../auth';
import { useOutfitAnalysis } from '../hooks/useOutfitAnalysis';
import { storageService } from '../../../shared/api/storage';
import { wardrobeAPI } from '../../virtual-wardrobe/api';
import { ItemType } from '../../virtual-wardrobe/types';

// Import Camera conditionnellement
let Camera = null;
try {
  const ExpoCamera = require('expo-camera');
  Camera = ExpoCamera.Camera;
} catch (error) {
  console.log('expo-camera not available');
}

export default function CameraScreen({ navigation, route }) {
  const itemType = route.params?.itemType || 'outfit';
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState('back');
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef(null);
  const { user } = useAuth();
  const { analyzeOutfit } = useOutfitAnalysis();

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setHasPermission(cameraStatus === 'granted' && mediaStatus === 'granted');
      }
    })();
  }, []);

  const takePictureWithImagePicker = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Pour tous les types (clothing et outfit), passer par l'analyse
      setCapturedImage(result.assets[0]);
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    try {
      // Utiliser l'analyse OpenAI pour les deux types (outfit et clothing)
      const result = await analyzeOutfit(capturedImage.uri, user.id);
      
      if (itemType === 'outfit') {
        navigation.navigate('AnalysisResult', { analysisId: result.id });
      } else {
        // Pour les vêtements individuels, aller directement à la garde-robe après l'analyse
        navigation.reset({
          index: 1,
          routes: [
            { name: 'Home' },
            { name: 'WardrobeScreen' }
          ],
        });
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        "L'enregistrement a échoué. Veuillez réessayer."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="camera-off" size={64} color="#999" />
          <Text style={styles.noPermissionText}>
            Pas d'accès à la caméra
          </Text>
          <Text style={styles.noPermissionSubtext}>
            Veuillez autoriser l'accès dans les paramètres
          </Text>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>
              Choisir depuis la galerie
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (capturedImage) {
    return (
      <LinearGradient
        colors={['#f9fafb', '#fff']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.captureHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={retakePicture}
            >
              <Ionicons name="arrow-back" size={24} color="#667eea" />
            </TouchableOpacity>
          </View>

        <Image source={{ uri: capturedImage.uri }} style={styles.preview} />

        <View style={styles.bottomContainer}>
          {isAnalyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.analyzingText}>
                {itemType === 'outfit' ? 'Analyse en cours...' : 'Traitement en cours...'}
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.analyzeButton}
                onPress={analyzeImage}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.gradient}
                >
                  <Ionicons name="sparkles" size={24} color="#fff" />
                  <Text style={styles.analyzeButtonText}>
                    Enregistrer
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.retakeButton}
                onPress={retakePicture}
              >
                <Text style={styles.retakeButtonText}>
                  Reprendre la photo
                </Text>
              </TouchableOpacity>
            </>
          )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Interface principale - choix entre caméra et galerie
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color="#667eea" />
        </TouchableOpacity>
        
        {/* Overlay de chargement pour l'upload depuis la galerie */}
        {isAnalyzing && (
          <View style={styles.uploadingOverlay}>
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.uploadingText}>
                Ajout à votre garde-robe...
              </Text>
            </View>
          </View>
        )}

        <View style={styles.mainContent}>
          <Text style={styles.mainTitle}>
            {itemType === 'outfit' ? 'Ajouter une tenue' : 'Ajouter un vêtement'}
          </Text>
          <Text style={styles.mainSubtitle}>
            {itemType === 'outfit' 
              ? 'Photographiez votre tenue complète'
              : 'Photographiez un vêtement seul sur fond neutre'}
          </Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={takePictureWithImagePicker}
              activeOpacity={0.8}
            >
              <View style={styles.optionCard}>
                <Ionicons name="camera" size={48} color="#667eea" />
                <Text style={styles.optionText}>Prendre une photo</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <View style={styles.optionCard}>
                <Ionicons name="images" size={48} color="#667eea" />
                <Text style={styles.optionText}>Choisir de la galerie</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Conseils pour une bonne photo</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color="rgba(255,255,255,0.8)" />
                <Text style={styles.tipText}>Cadrez la tenue complète</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color="rgba(255,255,255,0.8)" />
                <Text style={styles.tipText}>Bon éclairage</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color="rgba(255,255,255,0.8)" />
                <Text style={styles.tipText}>Fond neutre de préférence</Text>
              </View>
            </View>
          </View>
        </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainContent: {
    flex: 1,
    paddingTop: 120,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 50,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 60,
  },
  optionButton: {
    width: 150,
  },
  optionCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 35,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  optionText: {
    color: '#667eea',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 25,
    marginTop: 'auto',
    marginBottom: 40,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  captureHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(103,126,234,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  analyzeButton: {
    marginBottom: 15,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  retakeButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#999',
    fontSize: 16,
  },
  analyzingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  analyzingText: {
    color: '#667eea',
    fontSize: 16,
    marginTop: 15,
  },
  noPermissionText: {
    color: '#1f2937',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  noPermissionSubtext: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  uploadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  uploadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
});