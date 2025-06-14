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
import WeatherWidget from './WeatherWidget';

export default function DailyRecommendation({ analyses, navigation }) {
  const { user } = useAuth();
  const { items, loading: wardrobeLoading } = useWardrobe(user?.id);
  const { mood } = useMood();
  const [recommendedOutfit, setRecommendedOutfit] = useState(null);
  const [isMultiplePieces, setIsMultiplePieces] = useState(false);
  const [loading, setLoading] = useState(true);
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

  // La fonction getWeatherIcon n'est plus nécessaire car le service retourne déjà l'icône

  // getWeatherData n'est plus nécessaire, on utilise le hook useWeather

  const generateRecommendation = () => {
    if (!items || items.length === 0) return;
    
    const outfits = items.filter(item => item.itemType === ItemType.OUTFIT);
    const tops = items.filter(item => item.category?.toLowerCase().includes('haut') || 
                                     item.category?.toLowerCase().includes('shirt') ||
                                     item.category?.toLowerCase().includes('pull'));
    const bottoms = items.filter(item => item.category?.toLowerCase().includes('pantalon') || 
                                        item.category?.toLowerCase().includes('jean') ||
                                        item.category?.toLowerCase().includes('jupe'));
    const shoes = items.filter(item => item.category?.toLowerCase().includes('chaussure') ||
                                      item.category?.toLowerCase().includes('basket'));
    
    // Décider aléatoirement si on prend une tenue complète ou des pièces séparées
    const useCompleteOutfit = outfits.length > 0 && Math.random() > 0.5;
    
    if (useCompleteOutfit) {
      // Tenue complète
      const randomIndex = Math.floor(Math.random() * outfits.length);
      setRecommendedOutfit(outfits[randomIndex]);
      setIsMultiplePieces(false);
    } else if (tops.length > 0 && bottoms.length > 0) {
      // Combinaison de pièces
      const combination = {
        id: 'combination-' + Date.now(),
        name: 'Ensemble recommandé',
        pieces: []
      };
      
      // Sélectionner un haut
      const topIndex = Math.floor(Math.random() * tops.length);
      combination.pieces.push(tops[topIndex]);
      
      // Sélectionner un bas
      const bottomIndex = Math.floor(Math.random() * bottoms.length);
      combination.pieces.push(bottoms[bottomIndex]);
      
      // Ajouter des chaussures si disponibles
      if (shoes.length > 0) {
        const shoeIndex = Math.floor(Math.random() * shoes.length);
        combination.pieces.push(shoes[shoeIndex]);
      }
      
      setRecommendedOutfit(combination);
      setIsMultiplePieces(true);
    } else {
      // Fallback: n'importe quel item
      const randomIndex = Math.floor(Math.random() * items.length);
      setRecommendedOutfit(items[randomIndex]);
      setIsMultiplePieces(false);
    }
  };

  useEffect(() => {
    if (!wardrobeLoading && !weatherLoading) {
      setTimeout(() => {
        if (items && items.length > 0) {
          // Simple sélection aléatoire pour l'instant
          const outfits = items.filter(item => item.itemType === ItemType.OUTFIT);
          
          if (outfits.length > 0) {
            const randomIndex = Math.floor(Math.random() * outfits.length);
            setRecommendedOutfit(outfits[randomIndex]);
            setIsMultiplePieces(false);
          } else {
            // Si pas de tenues complètes, prendre n'importe quel item
            const randomIndex = Math.floor(Math.random() * items.length);
            setRecommendedOutfit(items[randomIndex]);
            setIsMultiplePieces(false);
          }
        }
        
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
      }, 1000);
    }
  }, [items, wardrobeLoading, weatherLoading]);

  const handlePress = (outfit) => {
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


  const handleRefresh = () => {
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

    // Générer une nouvelle recommandation
    if (items && items.length > 0) {
      // Simple sélection aléatoire pour l'instant
      const outfits = items.filter(item => item.itemType === ItemType.OUTFIT);
      
      if (outfits.length > 0) {
        const randomIndex = Math.floor(Math.random() * outfits.length);
        setRecommendedOutfit(outfits[randomIndex]);
        setIsMultiplePieces(false);
      } else {
        const randomIndex = Math.floor(Math.random() * items.length);
        setRecommendedOutfit(items[randomIndex]);
        setIsMultiplePieces(false);
      }
      
      // Rafraîchir la météo
      refreshWeather();
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
      {/* En-tête avec météo */}
      <View style={styles.header}>
        <Text style={styles.title}>Tenue du jour</Text>
        
        <WeatherWidget 
          weather={weather}
          loading={weatherLoading}
          error={weatherError}
          onRefresh={refreshWeather}
        />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
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
    marginBottom: 20,
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