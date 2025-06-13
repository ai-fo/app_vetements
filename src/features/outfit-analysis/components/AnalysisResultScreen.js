import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOutfitAnalysis } from '../hooks/useOutfitAnalysis';

export default function AnalysisResultScreen({ route, navigation }) {
  const { analysisId } = route.params;
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getAnalysisById } = useOutfitAnalysis();

  useEffect(() => {
    loadAnalysis();
  }, [analysisId]);

  const loadAnalysis = async () => {
    try {
      const data = await getAnalysisById(analysisId);
      setAnalysis(data);
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Analyse non trouvée</Text>
      </View>
    );
  }

  const renderColorPalette = () => {
    const allColors = [
      ...(analysis.colors?.primary || []),
      ...(analysis.colors?.secondary || []),
      ...(analysis.colors?.accent || []),
    ];

    return (
      <View style={styles.colorPalette}>
        {allColors.map((color, index) => (
          <View
            key={index}
            style={[styles.colorSwatch, { backgroundColor: color }]}
          />
        ))}
      </View>
    );
  };

  const renderRating = (rating, maxRating = 10) => {
    return (
      <View style={styles.ratingContainer}>
        {[...Array(maxRating)].map((_, index) => (
          <Ionicons
            key={index}
            name={index < rating ? 'star' : 'star-outline'}
            size={16}
            color={index < rating ? '#fbbf24' : '#e5e7eb'}
          />
        ))}
        <Text style={styles.ratingText}>{rating}/10</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analyse de tenue</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image de la tenue */}
        <Image source={{ uri: analysis.image_url }} style={styles.outfitImage} />

        {/* Palette de couleurs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Palette de couleurs</Text>
          {renderColorPalette()}
        </View>

        {/* Caractéristiques générales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caractéristiques</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Catégorie</Text>
              <Text style={styles.infoValue}>{analysis.category}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Style</Text>
              <Text style={styles.infoValue}>{analysis.style}</Text>
            </View>
          </View>
        </View>

        {/* Évaluations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Évaluations</Text>
          <View style={styles.ratingItem}>
            <Text style={styles.ratingLabel}>Formalité</Text>
            {renderRating(analysis.formality)}
          </View>
          <View style={styles.ratingItem}>
            <Text style={styles.ratingLabel}>Polyvalence</Text>
            {renderRating(analysis.versatility)}
          </View>
          {analysis.comfort?.rating && (
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Confort</Text>
              {renderRating(analysis.comfort.rating)}
            </View>
          )}
        </View>

        {/* Occasions */}
        {analysis.occasions?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Occasions</Text>
            <View style={styles.tagContainer}>
              {analysis.occasions.map((occasion, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{occasion}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Saisons */}
        {analysis.seasons?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saisons</Text>
            <View style={styles.tagContainer}>
              {analysis.seasons.map((season, index) => (
                <View key={index} style={[styles.tag, styles.seasonTag]}>
                  <Text style={styles.tagText}>{season}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Température recommandée */}
        {analysis.weather?.temperature && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Température recommandée</Text>
            <View style={styles.temperatureContainer}>
              <Ionicons name="thermometer-outline" size={24} color="#667eea" />
              <Text style={styles.temperatureText}>
                {analysis.weather.temperature.min}°C - {analysis.weather.temperature.max}°C
              </Text>
            </View>
          </View>
        )}

        {/* Vêtements détectés */}
        {analysis.items?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vêtements détectés</Text>
            {analysis.items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <Text style={styles.itemType}>{item.type}</Text>
                <Text style={styles.itemDetails}>
                  {item.color} {item.material && `• ${item.material}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Suggestions */}
        {analysis.matching_suggestions?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggestions d'association</Text>
            {analysis.matching_suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Ionicons name="bulb-outline" size={20} color="#667eea" />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Améliorations */}
        {analysis.improvements?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Améliorations possibles</Text>
            {analysis.improvements.map((improvement, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Ionicons name="trending-up-outline" size={20} color="#f59e0b" />
                <Text style={styles.suggestionText}>{improvement}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Bouton sauvegarder */}
        <TouchableOpacity style={styles.saveButton}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.saveGradient}
          >
            <Ionicons name="bookmark-outline" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>Sauvegarder dans ma garde-robe</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  shareButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  outfitImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 10,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  ratingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#4b5563',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#6b7280',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  seasonTag: {
    backgroundColor: '#dbeafe',
  },
  tagText: {
    fontSize: 14,
    color: '#4338ca',
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  temperatureText: {
    fontSize: 16,
    color: '#4b5563',
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 5,
  },
  itemDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  suggestionItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  saveButton: {
    margin: 20,
    marginBottom: 40,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 25,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});