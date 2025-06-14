import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useWardrobe } from '../features/virtual-wardrobe/hooks/useWardrobe';
import { useAuth } from '../features/auth';

const { width: screenWidth } = Dimensions.get('window');

export default function RecommendationDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { items } = useWardrobe(user?.id);
  const { outfitId, outfit: passedOutfit, isMultiplePieces, weather, mood, events } = route.params || {};
  
  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reasons, setReasons] = useState([]);

  useEffect(() => {
    if (passedOutfit) {
      // Si on a passé l'outfit complet (pour les combinaisons)
      setOutfit(passedOutfit);
      setLoading(false);
    } else if (outfitId && items && items.length > 0) {
      // Sinon, chercher dans les items
      const selectedOutfit = items.find(item => item.id === outfitId);
      if (selectedOutfit) {
        setOutfit(selectedOutfit);
        setLoading(false);
      }
    }
  }, [outfitId, passedOutfit, items]);

  useEffect(() => {
    if (outfit) {
      generateReasons(outfit);
    }
  }, [outfit, weather, mood, events]);

  const generateReasons = (selectedOutfit) => {
    if (!selectedOutfit) return;
    
    const reasonsList = [];
    
    // Raison météo
    if (weather) {
      if (weather.temp > 20) {
        reasonsList.push({
          icon: 'sunny',
          title: 'Météo favorable',
          description: `Tenue légère adaptée aux ${weather.temp}°C`,
          color: '#f59e0b',
        });
      } else if (weather.temp < 15) {
        reasonsList.push({
          icon: 'snow',
          title: 'Temps frais',
          description: `Tenue chaude pour ${weather.temp}°C`,
          color: '#3b82f6',
        });
      }
      
      if (weather.condition === 'pluvieux') {
        reasonsList.push({
          icon: 'rainy',
          title: 'Protection pluie',
          description: 'Matières résistantes à l\'eau',
          color: '#6366f1',
        });
      }
    }
    
    // Raison événement
    if (events && events.length > 0) {
      reasonsList.push({
        icon: 'calendar',
        title: 'Agenda du jour',
        description: events[0].title || 'Rendez-vous professionnel',
        color: '#8b5cf6',
      });
    } else {
      reasonsList.push({
        icon: 'home',
        title: 'Journée décontractée',
        description: 'Parfait pour une journée sans contraintes',
        color: '#10b981',
      });
    }
    
    // Raison humeur
    const moodMap = {
      energetic: { icon: 'flash', title: 'Énergie positive', desc: 'Couleurs vives pour booster votre journée' },
      relaxed: { icon: 'leaf', title: 'Zen attitude', desc: 'Confort et simplicité' },
      professional: { icon: 'briefcase', title: 'Mode pro', desc: 'Look soigné et élégant' },
      creative: { icon: 'color-palette', title: 'Créativité', desc: 'Style unique et original' },
      romantic: { icon: 'heart', title: 'Romantique', desc: 'Élégance et douceur' },
      adventurous: { icon: 'compass', title: 'Aventurier', desc: 'Prêt pour l\'aventure' },
    };
    
    const currentMood = mood || 'relaxed';
    const moodInfo = moodMap[currentMood] || moodMap.relaxed;
    
    reasonsList.push({
      icon: moodInfo.icon,
      title: moodInfo.title,
      description: moodInfo.desc,
      color: '#ec4899',
    });
    
    // Raison favoris
    if (selectedOutfit?.isFavorite) {
      reasonsList.push({
        icon: 'star',
        title: 'Votre favori',
        description: 'Une de vos tenues préférées',
        color: '#f59e0b',
      });
    }
    
    setReasons(reasonsList);
  };

  if (loading || !outfit) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recommandation du jour</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Image principale */}
        <View style={styles.imageContainer}>
          {isMultiplePieces && outfit.pieces ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.piecesScroll}
            >
              {outfit.pieces.map((piece, index) => (
                <View key={piece.id} style={styles.pieceCard}>
                  <Image source={{ uri: piece.imageUrl }} style={styles.pieceImage} />
                  <Text style={styles.pieceName}>{piece.name}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <>
              <Image source={{ uri: outfit.imageUrl }} style={styles.mainImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={styles.imageOverlay}
              />
              <View style={styles.outfitInfo}>
                <Text style={styles.outfitName}>{outfit.name}</Text>
                {outfit.category && (
                  <Text style={styles.outfitCategory}>{outfit.category}</Text>
                )}
              </View>
            </>
          )}
        </View>

        {/* Détails météo */}
        {weather && (
          <View style={styles.weatherSection}>
            <Text style={styles.sectionTitle}>Météo du jour</Text>
            <View style={styles.weatherCard}>
              <View style={styles.weatherMain}>
                <Ionicons name={weather.icon} size={48} color="#667eea" />
                <View style={styles.weatherMainInfo}>
                  <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
                  <Text style={styles.weatherFeelsLike}>Ressenti {weather.feels_like}°</Text>
                  <Text style={styles.weatherDesc}>{weather.description}</Text>
                </View>
              </View>
              
              <View style={styles.weatherDetailsGrid}>
                <View style={styles.weatherDetail}>
                  <Ionicons name="water" size={20} color="#6b7280" />
                  <Text style={styles.weatherDetailLabel}>Humidité</Text>
                  <Text style={styles.weatherDetailValue}>{weather.humidity}%</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Ionicons name="speedometer" size={20} color="#6b7280" />
                  <Text style={styles.weatherDetailLabel}>Vent</Text>
                  <Text style={styles.weatherDetailValue}>{weather.wind}km/h</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Ionicons name="sunny-outline" size={20} color="#6b7280" />
                  <Text style={styles.weatherDetailLabel}>UV</Text>
                  <Text style={styles.weatherDetailValue}>{weather.uv || 'Modéré'}</Text>
                </View>
              </View>
              
              {(weather.city || weather.location) && (
                <View style={styles.weatherLocation}>
                  <Ionicons name="location" size={16} color="#9ca3af" />
                  <Text style={styles.weatherLocationText}>{weather.city || weather.location}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Raisons de la recommandation */}
        <View style={styles.reasonsSection}>
          <Text style={styles.sectionTitle}>Pourquoi cette tenue ?</Text>
          
          {reasons.map((reason, index) => (
            <View key={index} style={styles.reasonCard}>
              <View style={[styles.reasonIcon, { backgroundColor: reason.color + '20' }]}>
                <Ionicons name={reason.icon} size={24} color={reason.color} />
              </View>
              <View style={styles.reasonContent}>
                <Text style={styles.reasonTitle}>{reason.title}</Text>
                <Text style={styles.reasonDescription}>{reason.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Conseils styling */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Conseils styling</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipRow}>
              <Ionicons name="bulb" size={20} color="#667eea" />
              <Text style={styles.tipText}>
                Accessoirisez avec une montre élégante pour un look plus sophistiqué
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="color-filter" size={20} color="#667eea" />
              <Text style={styles.tipText}>
                Les couleurs neutres de cette tenue s'accordent avec tous vos accessoires
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.primaryButton}>
            <LinearGradient
              colors={['#fff', '#f3f4f6']}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>Porter cette tenue</Text>
              <Ionicons name="checkmark-circle" size={20} color="#667eea" />
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="shuffle" size={20} color="#fff" />
              <Text style={styles.secondaryButtonText}>Autre suggestion</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="bookmark-outline" size={20} color="#fff" />
              <Text style={styles.secondaryButtonText}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  imageContainer: {
    height: 400,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  piecesScroll: {
    paddingVertical: 40,
  },
  pieceCard: {
    marginHorizontal: 10,
    alignItems: 'center',
  },
  pieceImage: {
    width: 200,
    height: 260,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pieceName: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  outfitInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  outfitName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  outfitCategory: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'capitalize',
  },
  reasonsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  reasonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reasonContent: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  reasonDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  tipsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  tipsCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 20,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  tipText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  primaryButton: {
    marginBottom: 16,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  weatherSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  weatherCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  weatherMainInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
  },
  weatherFeelsLike: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  weatherDesc: {
    fontSize: 16,
    color: '#4b5563',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  weatherDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  weatherDetail: {
    alignItems: 'center',
    flex: 1,
  },
  weatherDetailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  weatherDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  weatherLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  weatherLocationText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});