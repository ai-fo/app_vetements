import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../features/auth';
import { useOutfitAnalysis } from '../features/outfit-analysis';
import { useNavigation } from '@react-navigation/native';
import DailyRecommendation from '../features/outfit-analysis/components/DailyRecommendation';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { analyses, getUserAnalyses, analyzeOutfit } = useOutfitAnalysis();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAnalyses();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadAnalyses = async () => {
    if (user?.id) {
      setRefreshing(true);
      try {
        await getUserAnalyses(user.id);
      } catch (error) {
        console.error('Error loading analyses:', error);
      }
      setRefreshing(false);
    }
  };

  const handleAddOutfit = () => {
    navigation.navigate('AddOutfit');
  };

  const handleQuickAddFromGallery = async () => {
    try {
      // Demander la permission pour accéder à la galerie
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Nous avons besoin de votre permission pour accéder à la galerie.'
        );
        return;
      }

      // Ouvrir la galerie
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled) {
        setIsProcessing(true);
        try {
          // Analyser l'image directement comme un vêtement
          await analyzeOutfit(result.assets[0].uri, user.id, 'clothing');
          
          // Aller directement à la garde-robe
          navigation.navigate('WardrobeScreen');
        } catch (error) {
          Alert.alert(
            'Erreur',
            "L'ajout du vêtement a échoué. Veuillez réessayer."
          );
        } finally {
          setIsProcessing(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de l\'ouverture de la galerie.'
      );
    }
  };

  const handleOutfitPress = (analysisId) => {
    navigation.navigate('AnalysisResult', { analysisId });
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <DailyRecommendation analyses={analyses} navigation={navigation} />

          <TouchableOpacity 
            style={styles.wardrobeButton}
            onPress={() => navigation.navigate('WardrobeScreen')}
            activeOpacity={0.9}
          >
            <View style={styles.wardrobeButtonShadow}>
              <LinearGradient
                colors={['#fff', '#f8fafc']}
                style={styles.wardrobeButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.wardrobeButtonInner}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="shirt" size={28} color="#fff" />
                  </LinearGradient>
                  
                  <View style={styles.wardrobeButtonText}>
                    <Text style={styles.wardrobeButtonTitle}>Ma Garde-robe</Text>
                    <Text style={styles.wardrobeButtonSubtitle}>Découvrez votre collection complète</Text>
                  </View>
                  
                  <View style={styles.arrowContainer}>
                    <Ionicons name="arrow-forward" size={24} color="#667eea" />
                  </View>
                </View>
                
                <View style={styles.liquidAccent} />
                <View style={styles.liquidAccent2} />
              </LinearGradient>
            </View>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
      
      {/* Floating Action Buttons */}
      <View style={styles.floatingButtonsContainer}>
        <TouchableOpacity 
          testID="floating-button-profile"
          style={styles.floatingButton} 
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <View style={styles.profileButtonInner}>
            <Ionicons name="person" size={22} color="#667eea" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          testID="floating-button-camera"
          style={styles.floatingButton} 
          onPress={handleAddOutfit}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.floatingButtonGradient}
          >
            <Ionicons name="camera" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleQuickAddFromGallery}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.addButtonGradient}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="images" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Ajouter un vêtement</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Overlay de traitement */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.processingText}>
              Ajout à votre garde-robe...
            </Text>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Espace supplémentaire pour les boutons flottants et un peu de scroll
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  profileButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonGradient: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  wardrobeButton: {
    marginVertical: 10,
    marginHorizontal: -5,
  },
  wardrobeButtonShadow: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  wardrobeButtonGradient: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  wardrobeButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingVertical: 28,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  wardrobeButtonText: {
    flex: 1,
    marginLeft: 20,
  },
  wardrobeButtonTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  wardrobeButtonSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 4,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liquidAccent: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
    transform: [{ scale: 1.5 }],
  },
  liquidAccent2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(118, 75, 162, 0.06)',
    transform: [{ scale: 1.3 }],
  },
  processingOverlay: {
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
  processingContainer: {
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
  processingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
});