import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import ItemAttributesEditor from '../../virtual-wardrobe/components/ItemAttributesEditor';
import { theme } from '../../../shared/styles/theme';

export default function ClothingDetailView({ route, navigation }) {
  const { item: initialItem } = route.params;
  const [item, setItem] = useState(initialItem);
  const [showEditor, setShowEditor] = useState(false);
  
  // Déterminer si c'est une pièce unique ou une tenue complète
  const isSinglePiece = item.capture_type === 'single_piece' || item.itemType === 'SINGLE_PIECE';
  
  // Fonction pour obtenir l'icône de saison
  const getSeasonIcon = (season) => {
    switch(season) {
      case 'spring': return 'flower';
      case 'summer': return 'sunny';
      case 'fall': return 'leaf';
      case 'winter': return 'snow';
      default: return 'calendar';
    }
  };

  // Fonction pour traduire les termes
  const translateTerm = (term) => {
    const translations = {
      // Pièces
      'shirt': 'Chemise',
      'tshirt': 'T-shirt',
      't-shirt': 'T-shirt',
      'top': 'Haut',
      'blouse': 'Blouse',
      'tank': 'Débardeur',
      'pants': 'Pantalon',
      'jeans': 'Jean',
      'trousers': 'Pantalon',
      'jacket': 'Veste',
      'blazer': 'Blazer',
      'coat': 'Manteau',
      'vest': 'Gilet',
      'dress': 'Robe',
      'skirt': 'Jupe',
      'shorts': 'Short',
      'sweater': 'Pull',
      'pullover': 'Pull',
      'hoodie': 'Sweat à capuche',
      'sweatshirt': 'Sweat',
      'shoes': 'Chaussures',
      'sneakers': 'Baskets',
      'boots': 'Bottes',
      'sandals': 'Sandales',
      'bag': 'Sac',
      'belt': 'Ceinture',
      'hat': 'Chapeau',
      'scarf': 'Écharpe',
      // Matières
      'cotton': 'Coton',
      'wool': 'Laine',
      'synthetic': 'Synthétique',
      'leather': 'Cuir',
      'denim': 'Denim',
      'silk': 'Soie',
      'linen': 'Lin',
      // Patterns
      'uni': 'Uni',
      'stripes': 'Rayé',
      'plaid': 'Carreaux',
      'floral': 'Fleuri',
      'print': 'Imprimé',
      // Fits
      'slim': 'Ajusté',
      'regular': 'Normal',
      'loose': 'Ample',
      'oversized': 'Oversized',
      // Styles
      'casual': 'Décontracté',
      'formal': 'Formel',
      'sportif': 'Sportif',
      'chic': 'Chic',
      'streetwear': 'Streetwear',
      // Occasions
      'work': 'Travail',
      'weekend': 'Weekend',
      'sport': 'Sport',
      'soirée': 'Soirée',
      'quotidien': 'Quotidien',
      // Saisons
      'spring': 'Printemps',
      'summer': 'Été',
      'fall': 'Automne',
      'winter': 'Hiver',
      'all_season': 'Toutes saisons',
      // Couleurs
      'black': 'Noir',
      'white': 'Blanc',
      'grey': 'Gris',
      'navy': 'Marine',
      'blue': 'Bleu',
      'red': 'Rouge',
      'green': 'Vert',
      'yellow': 'Jaune',
      'orange': 'Orange',
      'pink': 'Rose',
      'purple': 'Violet',
      'brown': 'Marron',
      'beige': 'Beige',
      'cream': 'Crème'
    };
    return translations[term?.toLowerCase()] || term;
  };

  const renderSinglePiece = () => {
    // Gérer les différents formats de données
    const piece = item.pieces?.[0] || item.rawData || item;
    const attributes = piece.attributes || {
      colors: { 
        primary: item.colors || [], 
        secondary: item.secondaryColors || []
      },
      material: item.materials?.[0] || item.material,
      pattern: item.pattern,
      fit: item.fit,
      details: item.details || []
    };
    
    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.infoCard}>
            <Text style={styles.largeText}>{piece.name || item.name || translateTerm(piece.piece_type || item.category)}</Text>
            <Text style={styles.itemType}>Type: {translateTerm(piece.piece_type || item.category)}</Text>
            {item.brand && (
              <Text style={styles.itemBrand}>Marque: {item.brand}</Text>
            )}
          </View>
        </View>

        {attributes.colors && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Couleurs</Text>
            <View style={styles.infoCard}>
              {attributes.colors.primary?.length > 0 && (
                <View style={styles.colorRow}>
                  <Text style={styles.colorLabel}>Principales:</Text>
                  <View style={styles.colorList}>
                    {attributes.colors.primary.map((color, index) => (
                      <View key={index} style={styles.colorChip}>
                        <Text style={styles.colorText}>{translateTerm(color)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {attributes.colors.secondary?.length > 0 && (
                <View style={styles.colorRow}>
                  <Text style={styles.colorLabel}>Secondaires:</Text>
                  <View style={styles.colorList}>
                    {attributes.colors.secondary.map((color, index) => (
                      <View key={index} style={[styles.colorChip, styles.secondaryColor]}>
                        <Text style={styles.colorText}>{translateTerm(color)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caractéristiques</Text>
          <View style={styles.infoCard}>
            {attributes.material && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Matière</Text>
                <Text style={styles.infoValue}>{translateTerm(attributes.material)}</Text>
              </View>
            )}
            {attributes.pattern && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Motif</Text>
                <Text style={styles.infoValue}>{translateTerm(attributes.pattern)}</Text>
              </View>
            )}
            {attributes.fit && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Coupe</Text>
                <Text style={styles.infoValue}>{translateTerm(attributes.fit)}</Text>
              </View>
            )}
          </View>
        </View>

        {attributes.details?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détails</Text>
            <View style={styles.tagList}>
              {attributes.details.map((detail, index) => (
                <View key={index} style={styles.detailTag}>
                  <Text style={styles.tagText}>{detail}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {(piece.style_tags?.length > 0 || item.styleTags?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Styles</Text>
            <View style={styles.tagList}>
              {(piece.style_tags || item.styleTags || []).map((style, index) => (
                <View key={index} style={styles.styleTag}>
                  <Ionicons name="pricetag-outline" size={14} color={theme.colors.categories.bottoms} style={styles.tagIcon} />
                  <Text style={styles.styleTagText}>{translateTerm(style)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {(piece.occasion_tags?.length > 0 || item.tags?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Occasions</Text>
            <View style={styles.tagList}>
              {(piece.occasion_tags || item.tags || []).map((occasion, index) => (
                <View key={index} style={styles.tag}>
                  <Ionicons name="calendar-outline" size={14} color={theme.colors.primary} style={styles.tagIcon} />
                  <Text style={styles.tagText}>{translateTerm(occasion)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {(piece.seasonality?.length > 0 || item.seasons?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saisonnalité</Text>
            <View style={styles.seasonList}>
              {(piece.seasonality || item.seasons || []).map((season, index) => (
                <View key={index} style={styles.seasonChip}>
                  <Ionicons name={getSeasonIcon(season)} size={18} color={theme.colors.primary} />
                  <Text style={styles.seasonText}>{translateTerm(season)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </>
    );
  };

  const renderCompleteLook = () => {
    // Gérer les deux formats : depuis l'analyse directe (look_meta) ou depuis la garde-robe (données dans item)
    const lookMeta = item.look_meta || item;
    const dominantStyle = lookMeta.dominant_style || item.styleTags;
    const silhouette = lookMeta.silhouette || item.silhouette;
    const layeringLevel = lookMeta.layering_level || item.layeringLevel;
    const patternMix = lookMeta.pattern_mix || item.patternMix;
    const occasionTags = lookMeta.occasion_tags || item.tags;
    const seasonality = lookMeta.seasonality || item.seasons;
    
    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyse de la tenue</Text>
          <View style={styles.infoCard}>
            {dominantStyle?.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Style dominant</Text>
                <Text style={styles.infoValue}>{translateTerm(dominantStyle[0])}</Text>
              </View>
            )}
          </View>
        </View>

        {(lookMeta.color_palette_global || item.colors) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Palette de couleurs</Text>
            <View style={styles.infoCard}>
              {(lookMeta.color_palette_global?.primary || item.colors)?.length > 0 && (
                <View style={styles.colorRow}>
                  <Text style={styles.colorLabel}>Principales:</Text>
                  <View style={styles.colorList}>
                    {(lookMeta.color_palette_global?.primary || item.colors || []).map((color, index) => (
                      <View key={index} style={styles.colorChip}>
                        <Text style={styles.colorText}>{translateTerm(color)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {lookMeta.color_palette_global?.accent?.length > 0 && (
                <View style={styles.colorRow}>
                  <Text style={styles.colorLabel}>Accents:</Text>
                  <View style={styles.colorList}>
                    {lookMeta.color_palette_global.accent.map((color, index) => (
                      <View key={index} style={[styles.colorChip, styles.accentColor]}>
                        <Text style={styles.colorText}>{translateTerm(color)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {patternMix?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mélange de motifs</Text>
            <View style={styles.tagList}>
              {patternMix.map((pattern, index) => (
                <View key={index} style={styles.patternTag}>
                  <Text style={styles.tagText}>{translateTerm(pattern)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {item.pieces?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pièces de la tenue ({item.pieces.length})</Text>
            {item.pieces.map((piece, index) => (
              <View key={index} style={styles.pieceCard}>
                <View style={styles.pieceHeader}>
                  <Text style={styles.pieceTitle}>{translateTerm(piece.piece_type)}</Text>
                  <View style={styles.pieceColors}>
                    {piece.attributes?.colors?.primary?.map((color, colorIndex) => (
                      <View key={colorIndex} style={styles.miniColorChip}>
                        <Text style={styles.miniColorText}>{translateTerm(color)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.pieceDetails}>
                  {piece.attributes?.material && (
                    <Text style={styles.pieceDetail}>• {translateTerm(piece.attributes.material)}</Text>
                  )}
                  {piece.attributes?.fit && (
                    <Text style={styles.pieceDetail}>• {translateTerm(piece.attributes.fit)}</Text>
                  )}
                  {piece.style_tags?.[0] && (
                    <Text style={styles.pieceDetail}>• {translateTerm(piece.style_tags[0])}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {occasionTags?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Occasions</Text>
            <View style={styles.tagList}>
              {occasionTags.map((occasion, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{translateTerm(occasion)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {seasonality?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saisonnalité</Text>
            <View style={styles.seasonList}>
              {seasonality.map((season, index) => (
                <View key={index} style={styles.seasonChip}>
                  <Ionicons name={getSeasonIcon(season)} size={18} color={theme.colors.primary} />
                  <Text style={styles.seasonText}>{translateTerm(season)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </>
    );
  };

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
                <Text style={styles.headerTitle}>
                  {isSinglePiece ? 'Détails du vêtement' : 'Détails de la tenue'}
                </Text>
                <View style={styles.headerActions}>
                  {isSinglePiece && (
                    <TouchableOpacity onPress={() => setShowEditor(true)} style={styles.actionButton}>
                      <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  )}
                  {!isSinglePiece && (
                    <TouchableOpacity 
                      onPress={() => navigation.navigate('ClothingZoomView', { 
                        item: item, 
                        pieces: item.pieces || [] 
                      })}
                      style={styles.actionButton}
                    >
                      <Ionicons name="search-outline" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </SafeAreaView>
          </BlurView>
        </View>

        {/* Image */}
        <View style={styles.imageSection}>
          {item.imageUrl && (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          )}
        </View>

        <View style={styles.content}>
          {isSinglePiece ? renderSinglePiece() : renderCompleteLook()}

          {item.createdAt && (
            <View style={styles.dateInfo}>
              <Text style={styles.dateText}>
                Ajouté le {new Date(item.createdAt).toLocaleDateString('fr-FR')}
              </Text>
              {item.wearCount > 0 && (
                <Text style={styles.wearText}>
                  Porté {item.wearCount} fois
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Éditeur d'attributs */}
      <ItemAttributesEditor
        visible={showEditor}
        item={item}
        onClose={() => setShowEditor(false)}
        onSave={(updatedItem) => {
          setItem(updatedItem);
          setShowEditor(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  imageSection: {
    marginTop: 100,
  },
  image: {
    width: '100%',
    aspectRatio: 3/4,
    resizeMode: 'cover',
    backgroundColor: theme.colors.surface,
  },
  content: {
    padding: theme.spacing.lg,
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
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  largeText: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text,
    textAlign: 'center',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  itemType: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  colorRow: {
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.textSecondary,
    marginBottom: 10,
  },
  colorList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorChip: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    minWidth: 80,
    alignItems: 'center',
  },
  secondaryColor: {
    backgroundColor: theme.colors.textMuted,
  },
  accentColor: {
    backgroundColor: theme.colors.accent,
  },
  colorText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.medium,
    color: '#ffffff',
    textAlign: 'center',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  styleTag: {
    backgroundColor: `${theme.colors.categories.bottoms}15`,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailTag: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  patternTag: {
    backgroundColor: `${theme.colors.accent}15`,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
  },
  tagText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.primary,
  },
  styleTagText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.categories.bottoms,
  },
  tagIcon: {
    marginRight: 6,
  },
  seasonList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  seasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    gap: 8,
    ...theme.shadows.sm,
  },
  seasonText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.text,
  },
  pieceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pieceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pieceTitle: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  pieceColors: {
    flexDirection: 'row',
    gap: 6,
  },
  miniColorChip: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  miniColorText: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text,
  },
  pieceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pieceDetail: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textSecondary,
  },
  dateInfo: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  dateText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textSecondary,
  },
  wearText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});