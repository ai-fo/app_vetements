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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useWardrobe } from '../../virtual-wardrobe/hooks/useWardrobe';
import { useAuth } from '../../auth';
import { ItemType } from '../../virtual-wardrobe/types';
import { useMood } from '../hooks/useMood';
import { useWeather } from '../hooks/useWeather';
import { useRecommendations } from '../hooks/useRecommendations';
import NeedsInputPortal from './NeedsInputPortal';

export default function DailyRecommendation({ analyses, navigation }) {
  const { user } = useAuth();
  const { mood } = useMood();
  const { 
    recommendations, 
    generateNeedsBasedRecommendation,
    refreshRecommendations: refreshRecs,
    loading: recsLoading,
    markAsWorn
  } = useRecommendations(user?.id);
  const [recommendedOutfit, setRecommendedOutfit] = useState(null);
  const [isMultiplePieces, setIsMultiplePieces] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNeedsInput, setShowNeedsInput] = useState(false);
  const [userNeeds, setUserNeeds] = useState(null);
  const [showStyleTips, setShowStyleTips] = useState(false);
  const { weather, loading: weatherLoading, error: weatherError, refreshWeather } = useWeather();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const getSeasonLabel = (season) => {
    const labels = {
      'spring': 'Printemps',
      'summer': 'Été',
      'fall': 'Automne',
      'winter': 'Hiver',
      'all_season': 'Toutes saisons'
    };
    return labels[season] || season;
  };


  useEffect(() => {
    if (!recsLoading && !weatherLoading && recommendations && recommendations.length > 0) {
      // Utiliser la première recommandation
      const firstRec = recommendations[0];
      setRecommendedOutfit(firstRec);
      setIsMultiplePieces(!!firstRec.pieces);
      setLoading(false);
      
      // Animations d'entrée
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
    // Marquer comme portée quand l'utilisateur clique pour voir les détails
    if (outfit && outfit.id) {
      await markAsWorn(outfit.id);
      console.log('Marked as worn when viewing details:', outfit.id);
    }
    
    // Passer les informations nécessaires à la page de détail
    navigation.navigate('RecommendationDetail', { 
      outfitId: outfit.id,
      outfit: outfit, // Passer l'objet complet pour les combinaisons
      isMultiplePieces: isMultiplePieces,
      weather: weather,
      mood: mood,
      events: [] // TODO: Intégrer avec le calendrier
    });
  };


  const handleRefresh = async () => {
    // Marquer la tenue actuelle comme portée AVANT de demander une nouvelle
    if (recommendedOutfit && recommendedOutfit.id) {
      await markAsWorn(recommendedOutfit.id);
      console.log('Marked as worn:', recommendedOutfit.id);
    }
    
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Rafraîchir les recommandations et la météo
    await refreshRecs();
    refreshWeather();
    
    // Réinitialiser les besoins utilisateur
    setUserNeeds(null);
  };

  const handleNeedsSubmit = async (needs) => {
    setUserNeeds(needs);
    setShowNeedsInput(false);
    
    // Afficher un état de chargement
    setLoading(true);
    
    // Animation de transition
    Animated.timing(fadeAnim, {
      toValue: 0.5,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    try {
      // Générer une recommandation basée sur les besoins
      const recommendation = await generateNeedsBasedRecommendation(needs);
      
      if (recommendation) {
        // Vérifier si c'est une combinaison de pièces
        setIsMultiplePieces(!!recommendation.isMultiplePieces);
        setRecommendedOutfit(recommendation);
        
        // Animation d'apparition
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
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
          ]),
        ]).start();
      }
    } catch (error) {
      console.error('Error generating needs-based recommendation:', error);
      // Fallback sur une recommandation normale
      handleRefresh();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#667eea" />
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
        <LinearGradient
          colors={['rgba(102,126,234,0.05)', 'rgba(118,75,162,0.05)']}
          style={styles.emptyCard}
        >
          <View style={styles.emptyIconContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.emptyIconGradient}
            >
              <Ionicons name="add" size={32} color="#fff" />
            </LinearGradient>
          </View>
          
          <Text style={styles.emptyTitle}>Créez votre première tenue</Text>
          <Text style={styles.emptySubtext}>
            Ajoutez des vêtements pour recevoir des recommandations personnalisées
          </Text>
          
          <View style={styles.emptyAction}>
            <Text style={styles.emptyActionText}>Commencer</Text>
            <Ionicons name="arrow-forward" size={20} color="#667eea" />
          </View>
        </LinearGradient>
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
      {/* En-tête avec météo simplifiée */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Tenue du jour</Text>
            {userNeeds && (
              <View style={styles.needsBadge}>
                <Ionicons name="chatbubble" size={12} color="#667eea" />
                <Text style={styles.needsText} numberOfLines={1}>{userNeeds}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.needsButton}
              onPress={() => setShowNeedsInput(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
            </TouchableOpacity>
            {weather && (
              <View style={styles.weatherSimple}>
                <Ionicons name={weather.icon} size={20} color="#fff" />
                <Text style={styles.weatherTemp}>{weather.temp}°</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Carte de recommandation unique */}
      <View>
        <View style={styles.recommendationCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.cardGradient}
          >
            {/* Badge de recommandation */}
            <View style={styles.recommendationBadge}>
              <View style={styles.badgeBlur}>
                <Ionicons name="sparkles" size={16} color="#fff" />
                <Text style={styles.badgeText}>Recommandé pour vous</Text>
                {recommendedOutfit.score && (
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>{recommendedOutfit.score}%</Text>
                  </View>
                )}
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
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.imageOverlay}
              />
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
                    <Ionicons name="bulb-outline" size={16} color="#fbbf24" />
                    <Text style={styles.reasonTitle}>Pourquoi cette tenue ?</Text>
                  </View>
                  <Text style={styles.reasonText}>{recommendedOutfit.reason}</Text>
                </View>
              )}
              
              {/* Adaptation météo */}
              {recommendedOutfit.weatherAdaptation && (
                <View style={styles.weatherAdaptSection}>
                  <View style={styles.weatherAdaptHeader}>
                    <Ionicons name="thermometer-outline" size={16} color="#60a5fa" />
                    <Text style={styles.weatherAdaptTitle}>Adaptation météo</Text>
                  </View>
                  <Text style={styles.weatherAdaptText}>{recommendedOutfit.weatherAdaptation}</Text>
                </View>
              )}
              
              {/* Conseils de style (extensible) */}
              {recommendedOutfit.styleTips && (
                <TouchableOpacity 
                  style={styles.styleTipsToggle}
                  onPress={() => setShowStyleTips(!showStyleTips)}
                  activeOpacity={0.8}
                >
                  <View style={styles.styleTipsHeader}>
                    <Ionicons name="color-palette-outline" size={16} color="#a78bfa" />
                    <Text style={styles.styleTipsTitle}>Conseils de style</Text>
                    <Ionicons 
                      name={showStyleTips ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#a78bfa" 
                    />
                  </View>
                  {showStyleTips && (
                    <Text style={styles.styleTipsText}>{recommendedOutfit.styleTips}</Text>
                  )}
                </TouchableOpacity>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.secondaryActionButton}
                  onPress={handleRefresh}
                >
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.secondaryActionText}>Nouvelle suggestion</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.primaryAction]}
                  onPress={() => handlePress(recommendedOutfit)}
                >
                  <Text style={styles.primaryActionText}>Voir détails</Text>
                  <Ionicons name="arrow-forward" size={16} color="#667eea" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
      
      {/* Composant de saisie des besoins */}
      <NeedsInputPortal 
        isVisible={showNeedsInput}
        onSubmit={handleNeedsSubmit}
        onClose={() => setShowNeedsInput(false)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    marginTop: 20,
  },
  header: {
    marginBottom: 15,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  needsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 8,
    gap: 6,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  needsText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  needsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  weatherSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  weatherTemp: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  recommendationCard: {
    width: '100%',
  },
  cardGradient: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  recommendationBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 10,
  },
  badgeBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  scoreContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  imageContainer: {
    height: 280,
    position: 'relative',
  },
  outfitImage: {
    width: '100%',
    height: '100%',
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
    width: 90,
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  plusIcon: {
    position: 'absolute',
    right: -15,
    top: '45%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  plusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  outfitDetails: {
    padding: 20,
    paddingTop: 15,
  },
  outfitName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 26,
  },
  piecesDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  reasonSection: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  reasonTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fbbf24',
  },
  reasonText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  weatherAdaptSection: {
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  weatherAdaptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  weatherAdaptTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#60a5fa',
  },
  weatherAdaptText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  styleTipsToggle: {
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  styleTipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  styleTipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a78bfa',
    flex: 1,
  },
  styleTipsText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  actionButton: {
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  primaryAction: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    gap: 8,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  loadingCard: {
    padding: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  emptyCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(102,126,234,0.2)',
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
});