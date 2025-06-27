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
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useWardrobe } from '../../virtual-wardrobe/hooks/useWardrobe';
import { useAuth } from '../../auth';
import { theme } from '../../../shared/styles/theme';

const { width: screenWidth } = Dimensions.get('window');

export default function RecommendationDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { items } = useWardrobe(user?.id);
  const { outfitId, outfit: passedOutfit, isMultiplePieces, weather, mood, events, weatherAdaptation, styleTips } = route.params || {};
  
  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reasons, setReasons] = useState([]);

  useEffect(() => {
    if (passedOutfit) {
      setOutfit(passedOutfit);
      setLoading(false);
    } else if (outfitId && items && items.length > 0) {
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
          color: theme.colors.categories.accessories,
        });
      } else if (weather.temp < 15) {
        reasonsList.push({
          icon: 'snow',
          title: 'Temps frais',
          description: `Tenue chaude pour ${weather.temp}°C`,
          color: theme.colors.categories.tops,
        });
      }
      
      if (weather.condition === 'pluvieux') {
        reasonsList.push({
          icon: 'rainy',
          title: 'Protection pluie',
          description: 'Matières résistantes à l\'eau',
          color: theme.colors.categories.outerwear,
        });
      }
    }
    
    // Raison événement
    if (events && events.length > 0) {
      reasonsList.push({
        icon: 'calendar',
        title: 'Agenda du jour',
        description: events[0].title || 'Rendez-vous professionnel',
        color: theme.colors.categories.bottoms,
      });
    } else {
      reasonsList.push({
        icon: 'home',
        title: 'Journée décontractée',
        description: 'Parfait pour une journée sans contraintes',
        color: theme.colors.success,
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
      color: theme.colors.categories.dresses,
    });
    
    // Raison favoris
    if (selectedOutfit?.isFavorite) {
      reasonsList.push({
        icon: 'heart',
        title: 'Votre favori',
        description: 'Une de vos tenues préférées',
        color: theme.colors.accent,
      });
    }
    
    setReasons(reasonsList);
  };

  if (loading || !outfit) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header flottant */}
        <View style={styles.floatingHeader}>
          <BlurView intensity={80} tint="light" style={styles.blurContainer}>
            <SafeAreaView>
              <View style={styles.headerContent}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Ionicons name="chevron-back" size={22} color={theme.colors.primaryDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recommandation du jour</Text>
                <View style={{ width: 40 }} />
              </View>
            </SafeAreaView>
          </BlurView>
        </View>

        {/* Image principale */}
        <View style={styles.imageSection}>
          {isMultiplePieces && outfit.pieces ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.piecesScroll}
              contentContainerStyle={styles.piecesScrollContent}
            >
              {outfit.pieces.map((piece, index) => (
                <View key={piece.id} style={styles.pieceCard}>
                  <Image source={{ uri: piece.imageUrl }} style={styles.pieceImage} />
                  <Text style={styles.pieceName}>{piece.name}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.mainImageContainer}>
              <Image source={{ uri: outfit.imageUrl }} style={styles.mainImage} />
              <View style={styles.outfitInfo}>
                <Text style={styles.outfitName}>{outfit.name}</Text>
                {outfit.category && (
                  <Text style={styles.outfitCategory}>{outfit.category}</Text>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          {/* Détails météo */}
          {weather && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Météo du jour</Text>
              <View style={styles.weatherCard}>
                <View style={styles.weatherMain}>
                  <View style={styles.weatherIconContainer}>
                    <Ionicons name={weather.icon} size={32} color={theme.colors.primary} />
                  </View>
                  <View style={styles.weatherMainInfo}>
                    <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
                    <Text style={styles.weatherDesc}>{weather.description}</Text>
                  </View>
                </View>
                
                <View style={styles.weatherDetailsGrid}>
                  <View style={styles.weatherDetail}>
                    <Ionicons name="water-outline" size={18} color={theme.colors.textMuted} />
                    <Text style={styles.weatherDetailValue}>{weather.humidity}%</Text>
                    <Text style={styles.weatherDetailLabel}>Humidité</Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <Ionicons name="speedometer-outline" size={18} color={theme.colors.textMuted} />
                    <Text style={styles.weatherDetailValue}>{weather.wind}km/h</Text>
                    <Text style={styles.weatherDetailLabel}>Vent</Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <Ionicons name="sunny-outline" size={18} color={theme.colors.textMuted} />
                    <Text style={styles.weatherDetailValue}>{weather.uv || 'Modéré'}</Text>
                    <Text style={styles.weatherDetailLabel}>UV</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Raisons de la recommandation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pourquoi cette tenue ?</Text>
            
            {reasons.map((reason, index) => (
              <View key={index} style={styles.reasonCard}>
                <View style={[styles.reasonIcon, { backgroundColor: reason.color + '15' }]}>
                  <Ionicons name={reason.icon} size={20} color={reason.color} />
                </View>
                <View style={styles.reasonContent}>
                  <Text style={styles.reasonTitle}>{reason.title}</Text>
                  <Text style={styles.reasonDescription}>{reason.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Adaptation météo */}
          {weatherAdaptation && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Adaptation météo</Text>
              <View style={styles.adaptationCard}>
                <View style={styles.adaptationRow}>
                  <Ionicons name="thermometer-outline" size={20} color={theme.colors.categories.tops} />
                  <Text style={styles.adaptationText}>{weatherAdaptation}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Conseils de style */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conseils de style</Text>
            <View style={styles.tipsCard}>
              {styleTips && (
                <View style={styles.tipRow}>
                  <Ionicons name="color-palette-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.tipText}>{styleTips}</Text>
                </View>
              )}
              <View style={styles.tipRow}>
                <Ionicons name="bulb-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.tipText}>
                  Accessoirisez avec une montre élégante pour un look plus sophistiqué
                </Text>
              </View>
              <View style={styles.tipRow}>
                <Ionicons name="color-filter-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.tipText}>
                  Les couleurs neutres de cette tenue s'accordent avec tous vos accessoires
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Porter cette tenue</Text>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.secondaryActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
                <Ionicons name="shuffle-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.secondaryButtonText}>Autre suggestion</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="bookmark-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.secondaryButtonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blurContainer: {
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.primaryDark,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  imageSection: {
    marginTop: 100,
    marginBottom: theme.spacing.lg,
  },
  mainImageContainer: {
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  mainImage: {
    width: '100%',
    height: 400,
    backgroundColor: theme.colors.surface,
  },
  piecesScroll: {
    paddingVertical: theme.spacing.md,
  },
  piecesScrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  pieceCard: {
    marginRight: theme.spacing.md,
    alignItems: 'center',
  },
  pieceImage: {
    width: 180,
    height: 240,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.md,
  },
  pieceName: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.text,
    textAlign: 'center',
  },
  outfitInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  outfitName: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.primaryDark,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  outfitCategory: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textMuted,
    textTransform: 'capitalize',
    marginTop: 4,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.md,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  reasonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  reasonContent: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.text,
    marginBottom: 2,
  },
  reasonDescription: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textSecondary,
  },
  weatherCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  weatherIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  weatherMainInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text,
  },
  weatherDesc: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  weatherDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  weatherDetail: {
    alignItems: 'center',
    flex: 1,
  },
  weatherDetailValue: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text,
    marginVertical: 4,
  },
  weatherDetailLabel: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textMuted,
  },
  adaptationCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  adaptationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  adaptationText: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.categories.tops,
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  tipText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text,
    lineHeight: 20,
  },
  actionsSection: {
    marginTop: theme.spacing.lg,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  primaryButtonText: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.medium,
    color: '#fff',
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.primary,
  },
});