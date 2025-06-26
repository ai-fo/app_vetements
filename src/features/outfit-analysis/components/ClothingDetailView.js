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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ItemAttributesEditor from '../../virtual-wardrobe/components/ItemAttributesEditor';

export default function ClothingDetailView({ route, navigation }) {
  const { item: initialItem } = route.params;
  const [item, setItem] = useState(initialItem);
  const [showEditor, setShowEditor] = useState(false);
  
  // Déterminer si c'est une pièce unique ou une tenue complète
  const isSinglePiece = item.capture_type === 'single_piece' || item.itemType === 'SINGLE_PIECE';
  
  // Fonction pour obtenir l'icône de saison
  const getSeasonIcon = (season) => {
    switch(season) {
      case 'spring': return '🌸';
      case 'summer': return '☀️';
      case 'fall': return '🍂';
      case 'winter': return '❄️';
      default: return '📅';
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
                  <Ionicons name="pricetag" size={14} color="#8b5cf6" style={styles.tagIcon} />
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
                  <Ionicons name="calendar-outline" size={14} color="#667eea" style={styles.tagIcon} />
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
                  <Text style={styles.seasonIcon}>{getSeasonIcon(season)}</Text>
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
                  <Text style={styles.seasonIcon}>{getSeasonIcon(season)}</Text>
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isSinglePiece ? 'Détails du vêtement' : 'Détails de la tenue'}
        </Text>
        {isSinglePiece && (
          <TouchableOpacity onPress={() => setShowEditor(true)}>
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        {!isSinglePiece && <View style={{ width: 28 }} />}
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    aspectRatio: 3/4,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  largeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  itemType: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  colorRow: {
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
    fontWeight: '500',
  },
  colorList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorChip: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    minWidth: 80,
    alignItems: 'center',
  },
  secondaryColor: {
    backgroundColor: '#9ca3af',
  },
  accentColor: {
    backgroundColor: '#f59e0b',
  },
  colorText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: 'rgba(102,126,234,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  styleTag: {
    backgroundColor: 'rgba(139,92,246,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailTag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
  },
  patternTag: {
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  tagText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  styleTagText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
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
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  seasonIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  seasonText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  layeringIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  layeringDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  layeringDotActive: {
    backgroundColor: '#667eea',
  },
  pieceCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pieceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pieceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  pieceColors: {
    flexDirection: 'row',
    gap: 6,
  },
  miniColorChip: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  miniColorText: {
    fontSize: 12,
    color: '#1f2937',
  },
  pieceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pieceDetail: {
    fontSize: 14,
    color: '#6b7280',
  },
  dateInfo: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  wearText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});