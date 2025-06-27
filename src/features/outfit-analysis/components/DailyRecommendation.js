import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWardrobe, ItemType } from '../../virtual-wardrobe';
import { useAuth } from '../../auth';
import { useMood } from '../hooks/useMood';
import { useWeather } from '../hooks/useWeather';
import { useRecommendations } from '../hooks/useRecommendations';
import { theme } from '../../../shared/styles/theme';

export default function DailyRecommendation({ analyses, navigation }) {
  const { user } = useAuth();
  const { mood } = useMood();
  const { 
    recommendations, 
    refreshRecommendations: refreshRecs,
    loading: recsLoading,
    markAsWorn
  } = useRecommendations(user?.id);
  const [recommendedOutfit, setRecommendedOutfit] = useState(null);
  const [isMultiplePieces, setIsMultiplePieces] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isWaitingForNewRecs, setIsWaitingForNewRecs] = useState(false);
  const { weather, loading: weatherLoading, error: weatherError, refreshWeather } = useWeather();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (!recsLoading && !weatherLoading && recommendations && recommendations.length > 0) {
      const firstRec = recommendations[0];
      setRecommendedOutfit(firstRec);
      setIsMultiplePieces(!!firstRec.pieces);
      setLoading(false);
      
      if (isWaitingForNewRecs && refreshing) {
        setTimeout(() => {
          setRefreshing(false);
          setIsWaitingForNewRecs(false);
        }, 500);
      }
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!recsLoading && !weatherLoading) {
      setLoading(false);
    }
  }, [recommendations, recsLoading, weatherLoading]);

  const handlePress = async (outfit) => {
    if (outfit && outfit.id) {
      await markAsWorn(outfit.id);
    }
    
    navigation.navigate('RecommendationDetail', { 
      outfitId: outfit.id,
      outfit: outfit,
      isMultiplePieces: isMultiplePieces,
      weather: weather,
      mood: mood,
      events: [],
      weatherAdaptation: outfit.weatherAdaptation,
      styleTips: outfit.styleTips
    });
  };

  const handleRefresh = async () => {
    const currentOutfitId = recommendedOutfit?.id;
    
    if (recommendedOutfit && recommendedOutfit.id) {
      await markAsWorn(recommendedOutfit.id);
    }
    
    setRefreshing(true);
    setIsWaitingForNewRecs(true);

    try {
      await refreshRecs();
      refreshWeather();
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error refreshing:', error);
      setRefreshing(false);
      setIsWaitingForNewRecs(false);
    }
  };


  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Analyse de votre style...</Text>
        </View>
      </View>
    );
  }

  if (!recommendedOutfit) {
    return (
      <TouchableOpacity 
        style={styles.container} 
        onPress={() => navigation.navigate('AddOutfit')}
        activeOpacity={0.9}
      >
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="add" size={32} color={theme.colors.primary} />
          </View>
          
          <Text style={styles.emptyTitle}>Créez votre première tenue</Text>
          <Text style={styles.emptySubtext}>
            Ajoutez des vêtements pour recevoir des recommandations personnalisées
          </Text>
          
          <View style={styles.emptyAction}>
            <Text style={styles.emptyActionText}>Commencer</Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      {/* Header avec météo */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Tenue du jour</Text>
          </View>
          <View style={styles.headerActions}>
            {weather && (
              <View style={styles.weatherSimple}>
                <Ionicons name={weather.icon} size={18} color={theme.colors.primary} />
                <Text style={styles.weatherTemp}>{weather.temp}°</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Carte de recommandation */}
      <View style={styles.recommendationCard}>
        {/* Badge de recommandation */}
        <View style={styles.recommendationBadge}>
          <View style={styles.badgeContent}>
            <Ionicons name="sparkles" size={14} color={theme.colors.accent} />
            <Text style={styles.badgeText}>Recommandé pour vous</Text>
          </View>
        </View>

        {/* Image de la tenue */}
        <View style={styles.imageContainer}>
          {isMultiplePieces ? (
            <View style={styles.piecesGrid}>
              {recommendedOutfit.pieces.map((piece, index) => (
                <View key={piece.id} style={styles.pieceContainer}>
                  <Image 
                    source={{ uri: piece.imageUrl }} 
                    style={styles.pieceImage}
                  />
                  {index < recommendedOutfit.pieces.length - 1 && (
                    <View style={styles.plusIcon}>
                      <Text style={styles.plusText}>+</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Image 
              source={{ uri: recommendedOutfit.imageUrl }} 
              style={styles.outfitImage}
            />
          )}
        </View>

        {/* Détails de la tenue */}
        <View style={styles.outfitDetails}>
          <Text style={styles.outfitName} numberOfLines={2}>
            {isMultiplePieces ? 'Ensemble recommandé' : (recommendedOutfit.name || 'Tenue recommandée')}
          </Text>
          {isMultiplePieces && (
            <Text style={styles.piecesDescription}>
              {recommendedOutfit.pieces.map(p => p.name).join(' • ')}
            </Text>
          )}
          
          {/* Raison de la recommandation */}
          {recommendedOutfit.reason && (
            <View style={styles.reasonSection}>
              <View style={styles.reasonHeader}>
                <Ionicons name="bulb-outline" size={14} color={theme.colors.accent} />
                <Text style={styles.reasonTitle}>Pourquoi cette tenue ?</Text>
              </View>
              <Text style={styles.reasonText}>{recommendedOutfit.reason}</Text>
              
              {/* Badge si récemment recommandé */}
              {recommendedOutfit.wasRecentlyRecommended && (
                <View style={styles.recentBadge}>
                  <Ionicons name="time-outline" size={12} color={theme.colors.textSecondary} />
                  <Text style={styles.recentBadgeText}>
                    Recommandé il y a {recommendedOutfit.lastRecommendedDays || 'quelques'} jour{recommendedOutfit.lastRecommendedDays > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.secondaryActionButton, refreshing && styles.disabledButton]}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Ionicons name="refresh" size={16} color={theme.colors.primary} />
              )}
              <Text style={styles.secondaryActionText}>
                {refreshing ? "Chargement..." : "Autre suggestion"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.primaryActionButton}
              onPress={() => handlePress(recommendedOutfit)}
            >
              <Text style={styles.primaryActionText}>Voir détails</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Overlay de loading */}
        {refreshing && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.overlayLoadingText}>Recherche d'une nouvelle tenue...</Text>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.primaryDark,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    gap: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  weatherTemp: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.primaryDark,
  },
  recommendationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  recommendationBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  badgeText: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.accent,
  },
  imageContainer: {
    height: 240,
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  outfitImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  piecesGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: '100%',
  },
  pieceContainer: {
    position: 'relative',
    marginHorizontal: 5,
  },
  pieceImage: {
    width: 80,
    height: 110,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  plusIcon: {
    position: 'absolute',
    right: -15,
    top: '45%',
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...theme.shadows.sm,
  },
  plusText: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.primary,
  },
  outfitDetails: {
    padding: theme.spacing.lg,
  },
  outfitName: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: 8,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  piecesDescription: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  reasonSection: {
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.15)',
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  reasonTitle: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.accent,
  },
  reasonText: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    gap: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  secondaryActionText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryActionButton: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.shadows.sm,
  },
  primaryActionText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.medium,
    color: '#fff',
  },
  loadingCard: {
    padding: 60,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  loadingText: {
    marginTop: 12,
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textSecondary,
  },
  emptyCard: {
    borderRadius: theme.borderRadius.xl,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.surface,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.primaryDark,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyActionText: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.primary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  overlayLoadingText: {
    marginTop: 16,
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  recentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    gap: 4,
  },
  recentBadgeText: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textSecondary,
  },
});