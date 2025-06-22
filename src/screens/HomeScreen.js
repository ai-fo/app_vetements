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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../features/auth';
import { useOutfitAnalysis } from '../features/outfit-analysis';
import { useNavigation } from '@react-navigation/native';
import DailyRecommendation from '../features/outfit-analysis/components/DailyRecommendation';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { analyses, getUserAnalyses } = useOutfitAnalysis();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
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
        </Animated.View>
      </ScrollView>
      
      {/* Floating Action Buttons */}
      <View style={styles.floatingButtonsContainer}>
        <TouchableOpacity 
          style={styles.floatingButton} 
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <View style={styles.profileButtonInner}>
            <Ionicons name="person" size={22} color="#667eea" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.rightButtonsContainer}>
          <TouchableOpacity 
            style={styles.wardrobeFloatingButton} 
            onPress={() => navigation.navigate('WardrobeScreen')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.wardrobeFloatingButtonGradient}
            >
              <Ionicons name="shirt" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddOutfit}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Ajouter un vêtement</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 100, // Espace pour les boutons flottants
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
  rightButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wardrobeFloatingButton: {
    width: 56,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  wardrobeFloatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});