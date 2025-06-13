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
      
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={signOut}
      >
        <Ionicons name="log-out-outline" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Bonjour,</Text>
              <Text style={styles.userName}>{user?.email?.split('@')[0]}</Text>
            </View>
            <View style={{ width: 50 }} />
          </View>

          <DailyRecommendation analyses={analyses} navigation={navigation} />

          <TouchableOpacity 
            style={styles.wardrobeButton}
            onPress={() => navigation.navigate('WardrobeScreen')}
          >
            <LinearGradient
              colors={['rgba(102,126,234,0.1)', 'rgba(118,75,162,0.1)']}
              style={styles.wardrobeButtonGradient}
            >
              <View style={styles.wardrobeButtonContent}>
                <Ionicons name="shirt-outline" size={32} color="#667eea" />
                <View style={styles.wardrobeButtonText}>
                  <Text style={styles.wardrobeButtonTitle}>Ma Garde-robe</Text>
                  <Text style={styles.wardrobeButtonSubtitle}>Gérez votre collection</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#667eea" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mes tenues</Text>
              {analyses.length > 0 && (
                <TouchableOpacity onPress={loadAnalyses}>
                  <Ionicons name="refresh" size={20} color="#667eea" />
                </TouchableOpacity>
              )}
            </View>

            {analyses.length === 0 ? (
              <View style={styles.emptyState}>
                <LinearGradient
                  colors={['rgba(102,126,234,0.1)', 'rgba(118,75,162,0.1)']}
                  style={styles.emptyStateGradient}
                >
                  <Ionicons name="images-outline" size={48} color="#667eea" />
                  <Text style={styles.emptyStateText}>Votre garde-robe est vide</Text>
                  <Text style={styles.emptyStateSubtext}>Utilisez le bouton caméra pour ajouter vos tenues</Text>
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.outfitGrid}>
                {analyses.map((analysis) => (
                  <TouchableOpacity
                    key={analysis.id}
                    style={styles.outfitCard}
                    onPress={() => handleOutfitPress(analysis.id)}
                  >
                    <Image
                      source={{ uri: analysis.image_url }}
                      style={styles.outfitImage}
                    />
                    {analysis.processing_status === 'completed' && (
                      <View style={styles.outfitBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={handleAddOutfit}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.floatingButtonGradient}
        >
          <Ionicons name="camera" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 90,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyState: {
    marginTop: 20,
  },
  emptyStateGradient: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
    marginTop: 20,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  outfitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -7.5,
  },
  outfitCard: {
    width: '50%',
    paddingHorizontal: 7.5,
    marginBottom: 15,
  },
  outfitImage: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  outfitBadge: {
    position: 'absolute',
    top: 10,
    right: 17.5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 2,
  },
  wardrobeButton: {
    marginVertical: 20,
  },
  wardrobeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
  },
  wardrobeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wardrobeButtonText: {
    marginLeft: 16,
  },
  wardrobeButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
  },
  wardrobeButtonSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
});