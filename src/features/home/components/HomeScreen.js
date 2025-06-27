import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../auth';
import { useOutfitAnalysis } from '../../outfit-analysis';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../shared/styles/theme';
import DailyRecommendation from '../../outfit-analysis/components/DailyRecommendation';

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
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.greeting}>Bonjour{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}</Text>
              <Text style={styles.headerTitle}>Découvrez vos tenues</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={styles.profileIconContainer}>
                <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <DailyRecommendation analyses={analyses} navigation={navigation} />
          </Animated.View>
        </SafeAreaView>
      </ScrollView>
      
      {/* Floating Action Buttons */}
      <View style={styles.floatingButtonsContainer}>
        <TouchableOpacity 
          style={styles.wardrobeButton} 
          onPress={() => navigation.navigate('WardrobeScreen')}
          activeOpacity={0.8}
        >
          <View style={styles.wardrobeButtonInner}>
            <Ionicons name="shirt-outline" size={22} color={theme.colors.primary} />
            <Text style={styles.wardrobeButtonText}>Garde-robe</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddOutfit}
          activeOpacity={0.8}
        >
          <View style={styles.addButtonInner}>
            <Ionicons name="camera" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textMuted,
    letterSpacing: theme.typography.letterSpacing.normal,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.primaryDark,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  profileButton: {
    marginLeft: theme.spacing.md,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  wardrobeButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  wardrobeButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  wardrobeButtonText: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.primary,
    marginLeft: 8,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  addButton: {
    ...theme.shadows.xl,
  },
  addButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});