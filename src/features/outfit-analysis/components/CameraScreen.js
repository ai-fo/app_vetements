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
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../auth';
import { useOutfitAnalysis } from '../hooks/useOutfitAnalysis';

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(CameraType.back);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef(null);
  const { user } = useAuth();
  const { analyzeOutfit } = useOutfitAnalysis();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setCapturedImage(photo);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de prendre la photo');
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0]);
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeOutfit(capturedImage.uri, user.id);
      
      // Naviguer vers l'écran de résultats
      navigation.navigate('AnalysisResult', { analysisId: result.id });
    } catch (error) {
      Alert.alert(
        'Erreur',
        "L'analyse a échoué. Veuillez réessayer."
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
      <View style={styles.container}>
        <Text style={styles.noPermissionText}>
          Pas d'accès à la caméra
        </Text>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>
            Choisir depuis la galerie
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={retakePicture}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analyser la tenue</Text>
          <View style={{ width: 28 }} />
        </View>

        <Image source={{ uri: capturedImage.uri }} style={styles.preview} />

        <View style={styles.bottomContainer}>
          {isAnalyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.analyzingText}>
                Analyse en cours...
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
                    Analyser la tenue
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
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        ref={cameraRef}
      >
        <View style={styles.cameraHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => {
              setType(
                type === CameraType.back
                  ? CameraType.front
                  : CameraType.back
              );
            }}
          >
            <Ionicons name="camera-reverse" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.overlay}>
          <View style={styles.overlayBorder} />
          <Text style={styles.overlayText}>
            Cadrez votre tenue complète
          </Text>
        </View>
      </Camera>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={pickImage}
        >
          <Ionicons name="images" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={takePicture}
        >
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <View style={{ width: 32 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  flipButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayBorder: {
    width: 250,
    height: 350,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    padding: 5,
  },
  captureInner: {
    flex: 1,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
  },
  galleryButton: {
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#000',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#000',
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
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});