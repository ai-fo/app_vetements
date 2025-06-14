import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useWardrobe } from '../../virtual-wardrobe/hooks/useWardrobe';
import { useAuth } from '../../auth';
import { ItemType } from '../../virtual-wardrobe/types';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;

export default function DailyRecommendation({ analyses, navigation }) {
  const { user } = useAuth();
  const { items, loading: wardrobeLoading } = useWardrobe(user?.id);
  const [recommendedOutfits, setRecommendedOutfits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;
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

  const getWeatherIcon = (condition) => {
    const icons = {
      'ensoleillé': 'sunny',
      'nuageux': 'cloud',
      'pluvieux': 'rainy',
      'neigeux': 'snow',
      'orageux': 'thunderstorm'
    };
    return icons[condition] || 'partly-sunny';
  };

  const getWeatherData = () => {
    // TODO: Activer quand le backend est prêt
    // const weatherData = await weatherAPI.getCurrentWeather();
    
    // Simulation de différentes conditions météo
    const conditions = [
      { temp: 22, condition: 'ensoleillé', description: 'Ciel dégagé' },
      { temp: 18, condition: 'nuageux', description: 'Partiellement nuageux' },
      { temp: 15, condition: 'pluvieux', description: 'Pluie légère' },
      { temp: 8, condition: 'neigeux', description: 'Neige' },
    ];
    
    const randomWeather = conditions[Math.floor(Math.random() * conditions.length)];
    return {
      ...randomWeather,
      icon: getWeatherIcon(randomWeather.condition),
      humidity: Math.floor(Math.random() * 40) + 40,
      wind: Math.floor(Math.random() * 20) + 5,
    };
  };

  useEffect(() => {
    if (!wardrobeLoading) {
      setTimeout(() => {
        const weatherData = getWeatherData();
        setWeather(weatherData);

        if (items && items.length > 0) {
          // Filtrer les tenues selon la météo simulée
          let filteredItems = items;
          
          // Pour la démo, on prend max 3 recommandations
          const maxRecommendations = 3;
          const recommendations = [];
          
          // D'abord les tenues complètes
          const outfits = filteredItems.filter(item => item.itemType === ItemType.OUTFIT);
          recommendations.push(...outfits.slice(0, maxRecommendations));
          
          // Si pas assez de tenues, ajouter des items individuels
          if (recommendations.length < maxRecommendations) {
            const otherItems = filteredItems.filter(item => item.itemType !== ItemType.OUTFIT);
            recommendations.push(...otherItems.slice(0, maxRecommendations - recommendations.length));
          }
          
          setRecommendedOutfits(recommendations);
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
  }, [items, wardrobeLoading]);

  const handlePress = (outfit) => {
    navigation.navigate('WardrobeScreen', { selectedItemId: outfit.id });
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

    // Changer l'ordre des recommandations
    setRecommendedOutfits(prev => [...prev.slice(1), prev[0]]);
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

  if (!recommendedOutfits.length) {
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
        <View style={styles.titleSection}>
          <Text style={styles.title}>Tenue du jour</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>
        
        {weather && (
          <View style={styles.weatherCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.weatherGradient}
            >
              <Ionicons name={weather.icon} size={24} color="#667eea" />
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
                <Text style={styles.weatherDesc}>{weather.description}</Text>
              </View>
              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetail}>
                  <Ionicons name="water" size={14} color="#9ca3af" />
                  <Text style={styles.weatherDetailText}>{weather.humidity}%</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Ionicons name="speedometer" size={14} color="#9ca3af" />
                  <Text style={styles.weatherDetailText}>{weather.wind}km/h</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* Carrousel de recommandations */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
          setCurrentIndex(newIndex);
        }}
      >
        {recommendedOutfits.map((outfit, index) => (
          <TouchableOpacity 
            key={outfit.id}
            onPress={() => handlePress(outfit)}
            activeOpacity={0.95}
          >
            <Animated.View
              style={[
                styles.recommendationCard,
                {
                  transform: [{
                    scale: scrollX.interpolate({
                      inputRange: [
                        (index - 1) * CARD_WIDTH,
                        index * CARD_WIDTH,
                        (index + 1) * CARD_WIDTH
                      ],
                      outputRange: [0.9, 1, 0.9],
                      extrapolate: 'clamp'
                    })
                  }]
                }
              ]}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.cardGradient}
              >
                {/* Badge de recommandation */}
                <View style={styles.recommendationBadge}>
                  <View style={styles.badgeBlur}>
                    <Ionicons name="sparkles" size={16} color="#fff" />
                    <Text style={styles.badgeText}>
                      {index === 0 ? 'Meilleur choix' : 'Alternative'}
                    </Text>
                  </View>
                </View>

                {/* Image de la tenue */}
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: outfit.imageUrl }} 
                    style={styles.outfitImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.imageOverlay}
                  />
                </View>

                {/* Détails de la tenue */}
                <View style={styles.outfitDetails}>
                  <Text style={styles.outfitName} numberOfLines={1}>
                    {outfit.name || 'Tenue recommandée'}
                  </Text>
                  <Text style={styles.outfitBrand} numberOfLines={1}>
                    {outfit.brand || outfit.category || 'Style du jour'}
                  </Text>

                  {/* Tags */}
                  <View style={styles.tagContainer}>
                    {outfit.seasons && outfit.seasons.length > 0 && (
                      outfit.seasons.slice(0, 2).map((season, idx) => (
                        <View key={idx} style={styles.tag}>
                          <Text style={styles.tagText}>{getSeasonLabel(season)}</Text>
                        </View>
                      ))
                    )}
                    {outfit.isFavorite && (
                      <View style={[styles.tag, styles.favoriteTag]}>
                        <Ionicons name="star" size={12} color="#fbbf24" />
                        <Text style={styles.tagText}>Favori</Text>
                      </View>
                    )}
                  </View>

                  {/* Actions */}
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="heart-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="share-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
                      <Text style={styles.primaryActionText}>Porter</Text>
                      <Ionicons name="arrow-forward" size={16} color="#667eea" />
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Indicateurs de pagination */}
      {recommendedOutfits.length > 1 && (
        <View style={styles.pagination}>
          {recommendedOutfits.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
    marginTop: 50,
  },
  header: {
    marginBottom: 15,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  weatherCard: {
    marginTop: 5,
  },
  weatherGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    gap: 12,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  weatherDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  weatherDetails: {
    gap: 8,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherDetailText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  recommendationCard: {
    width: CARD_WIDTH,
    marginRight: 15,
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
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  outfitBrand: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  favoriteTag: {
    backgroundColor: 'rgba(251,191,36,0.2)',
  },
  tagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    flexDirection: 'row',
    width: 'auto',
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#fff',
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