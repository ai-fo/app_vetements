import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function DailyRecommendation({ analyses, navigation }) {
  const [recommendedOutfit, setRecommendedOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    // Simuler la récupération de la météo et la recommandation
    setTimeout(() => {
      // TODO: Activer quand le backend est prêt
      // const recommendation = await getAIRecommendation(analyses, weather);
      
      // Mock de la météo du jour
      const mockWeather = {
        temp: 22,
        condition: 'ensoleillé',
        icon: 'sunny-outline'
      };
      setWeather(mockWeather);

      // Sélection aléatoire d'une tenue pour la simulation
      if (analyses && analyses.length > 0) {
        const completedOutfits = analyses.filter(a => a.processing_status === 'completed');
        if (completedOutfits.length > 0) {
          const randomIndex = Math.floor(Math.random() * completedOutfits.length);
          setRecommendedOutfit(completedOutfits[randomIndex]);
        }
      }
      
      setLoading(false);
    }, 1000);
  }, [analyses]);

  const handlePress = () => {
    if (recommendedOutfit) {
      navigation.navigate('AnalysisResult', { analysisId: recommendedOutfit.id });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(102,126,234,0.1)', 'rgba(118,75,162,0.1)']}
          style={styles.loadingCard}
        >
          <ActivityIndicator size="small" color="#667eea" />
        </LinearGradient>
      </View>
    );
  }

  if (!recommendedOutfit) {
    return (
      <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('AddOutfit')}>
        <LinearGradient
          colors={['rgba(102,126,234,0.1)', 'rgba(118,75,162,0.1)']}
          style={styles.emptyCard}
        >
          <Ionicons name="shirt-outline" size={32} color="#667eea" />
          <Text style={styles.emptyTitle}>Aucune tenue disponible</Text>
          <Text style={styles.emptySubtext}>Ajoutez des tenues pour recevoir des recommandations</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.recommendationCard}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Tenue du jour</Text>
              <View style={styles.weatherInfo}>
                <Ionicons name={weather.icon} size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.weatherText}>{weather.temp}°C - {weather.condition}</Text>
              </View>
            </View>
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Ionicons name="sparkles" size={16} color="#667eea" />
                <Text style={styles.badgeText}>Recommandé</Text>
              </View>
            </View>
          </View>

          <View style={styles.outfitContainer}>
            <Image 
              source={{ uri: recommendedOutfit.image_url }} 
              style={styles.outfitImage}
            />
            <View style={styles.outfitDetails}>
              <Text style={styles.outfitStyle}>{recommendedOutfit.style || 'Style moderne'}</Text>
              <Text style={styles.outfitCategory}>{recommendedOutfit.category || 'Casual'}</Text>
              
              {recommendedOutfit.occasions && recommendedOutfit.occasions.length > 0 && (
                <View style={styles.occasionTags}>
                  {recommendedOutfit.occasions.slice(0, 2).map((occasion, index) => (
                    <View key={index} style={styles.occasionTag}>
                      <Text style={styles.occasionText}>{occasion}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.matchScore}>
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Text style={styles.scoreText}>Parfait pour aujourd'hui</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>Toucher pour voir les détails</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
  },
  recommendationCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingCard: {
    borderRadius: 20,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  weatherText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  outfitContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  outfitImage: {
    width: 100,
    height: 133,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  outfitDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  outfitStyle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  outfitCategory: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  occasionTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  occasionTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  occasionText: {
    fontSize: 12,
    color: '#fff',
    textTransform: 'capitalize',
  },
  matchScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  scoreText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 5,
    textAlign: 'center',
  },
});