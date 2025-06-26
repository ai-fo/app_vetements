import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWardrobe } from '../hooks/useWardrobe';

// Options prédéfinies pour chaque attribut
const PREDEFINED_OPTIONS = {
  piece_types: [
    { value: 'tshirt', label: 'T-shirt' },
    { value: 'shirt', label: 'Chemise' },
    { value: 'blouse', label: 'Blouse' },
    { value: 'top', label: 'Haut' },
    { value: 'tank', label: 'Débardeur' },
    { value: 'sweater', label: 'Pull' },
    { value: 'hoodie', label: 'Sweat à capuche' },
    { value: 'jacket', label: 'Veste' },
    { value: 'blazer', label: 'Blazer' },
    { value: 'coat', label: 'Manteau' },
    { value: 'vest', label: 'Gilet' },
    { value: 'pants', label: 'Pantalon' },
    { value: 'jeans', label: 'Jean' },
    { value: 'shorts', label: 'Short' },
    { value: 'skirt', label: 'Jupe' },
    { value: 'dress', label: 'Robe' },
    { value: 'shoes', label: 'Chaussures' },
    { value: 'sneakers', label: 'Baskets' },
    { value: 'boots', label: 'Bottes' },
    { value: 'sandals', label: 'Sandales' },
    { value: 'bag', label: 'Sac' },
    { value: 'belt', label: 'Ceinture' },
    { value: 'hat', label: 'Chapeau' },
    { value: 'scarf', label: 'Écharpe' },
  ],
  
  colors: [
    { value: 'white', label: 'Blanc', hex: '#FFFFFF' },
    { value: 'black', label: 'Noir', hex: '#000000' },
    { value: 'grey', label: 'Gris', hex: '#6B7280' },
    { value: 'light-grey', label: 'Gris clair', hex: '#E5E7EB' },
    { value: 'dark-grey', label: 'Gris foncé', hex: '#374151' },
    { value: 'navy', label: 'Marine', hex: '#1E3A8A' },
    { value: 'blue', label: 'Bleu', hex: '#3B82F6' },
    { value: 'light-blue', label: 'Bleu clair', hex: '#93C5FD' },
    { value: 'red', label: 'Rouge', hex: '#EF4444' },
    { value: 'burgundy', label: 'Bordeaux', hex: '#7F1D1D' },
    { value: 'pink', label: 'Rose', hex: '#EC4899' },
    { value: 'green', label: 'Vert', hex: '#10B981' },
    { value: 'khaki', label: 'Kaki', hex: '#78716C' },
    { value: 'olive', label: 'Olive', hex: '#65A30D' },
    { value: 'yellow', label: 'Jaune', hex: '#FCD34D' },
    { value: 'orange', label: 'Orange', hex: '#F97316' },
    { value: 'purple', label: 'Violet', hex: '#9333EA' },
    { value: 'brown', label: 'Marron', hex: '#92400E' },
    { value: 'beige', label: 'Beige', hex: '#D4A574' },
    { value: 'cream', label: 'Crème', hex: '#FEF3C7' },
  ],
  
  materials: [
    { value: 'coton', label: 'Coton' },
    { value: 'laine', label: 'Laine' },
    { value: 'denim', label: 'Denim' },
    { value: 'cuir', label: 'Cuir' },
    { value: 'synthétique', label: 'Synthétique' },
    { value: 'lin', label: 'Lin' },
    { value: 'soie', label: 'Soie' },
    { value: 'velours', label: 'Velours' },
    { value: 'cachemire', label: 'Cachemire' },
    { value: 'polyester', label: 'Polyester' },
    { value: 'nylon', label: 'Nylon' },
    { value: 'viscose', label: 'Viscose' },
    { value: 'laine-mérinos', label: 'Laine mérinos' },
    { value: 'modal', label: 'Modal' },
    { value: 'tencel', label: 'Tencel' },
  ],
  
  patterns: [
    { value: 'uni', label: 'Uni' },
    { value: 'rayé', label: 'Rayé' },
    { value: 'carreaux', label: 'Carreaux' },
    { value: 'fleuri', label: 'Fleuri' },
    { value: 'pois', label: 'À pois' },
    { value: 'imprimé', label: 'Imprimé' },
    { value: 'graphique', label: 'Graphique' },
    { value: 'camouflage', label: 'Camouflage' },
    { value: 'géométrique', label: 'Géométrique' },
    { value: 'paisley', label: 'Paisley' },
    { value: 'animal', label: 'Animal' },
    { value: 'tie-dye', label: 'Tie-dye' },
  ],
  
  fits: [
    { value: 'slim', label: 'Ajusté' },
    { value: 'regular', label: 'Normal' },
    { value: 'loose', label: 'Ample' },
    { value: 'oversized', label: 'Oversized' },
    { value: 'skinny', label: 'Moulant' },
    { value: 'relaxed', label: 'Décontracté' },
    { value: 'straight', label: 'Droit' },
    { value: 'tapered', label: 'Fuselé' },
  ],
  
  styles: [
    { value: 'casual', label: 'Décontracté' },
    { value: 'formel', label: 'Formel' },
    { value: 'sportif', label: 'Sportif' },
    { value: 'streetwear', label: 'Streetwear' },
    { value: 'chic', label: 'Chic' },
    { value: 'bohème', label: 'Bohème' },
    { value: 'minimaliste', label: 'Minimaliste' },
    { value: 'rock', label: 'Rock' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'preppy', label: 'Preppy' },
    { value: 'workwear', label: 'Workwear' },
    { value: 'glamour', label: 'Glamour' },
  ],
  
  occasions: [
    { value: 'travail', label: 'Travail' },
    { value: 'soirée', label: 'Soirée' },
    { value: 'weekend', label: 'Weekend' },
    { value: 'sport', label: 'Sport' },
    { value: 'casual', label: 'Casual' },
    { value: 'cérémonie', label: 'Cérémonie' },
    { value: 'vacances', label: 'Vacances' },
    { value: 'quotidien', label: 'Quotidien' },
    { value: 'cocktail', label: 'Cocktail' },
    { value: 'business', label: 'Business' },
  ],
  
  seasons: [
    { value: 'spring', label: 'Printemps', icon: '🌸' },
    { value: 'summer', label: 'Été', icon: '☀️' },
    { value: 'fall', label: 'Automne', icon: '🍂' },
    { value: 'winter', label: 'Hiver', icon: '❄️' },
  ],
};

export default function ItemAttributesEditor({ visible, item, onClose, onSave }) {
  const { updateItem } = useWardrobe();
  const [loading, setLoading] = useState(false);
  
  // États pour chaque attribut
  const [pieceType, setPieceType] = useState(item?.category || item?.piece_type || '');
  const [primaryColors, setPrimaryColors] = useState(item?.colors || []);
  const [secondaryColors, setSecondaryColors] = useState(item?.secondaryColors || []);
  const [material, setMaterial] = useState(item?.materials?.[0] || item?.material || '');
  const [pattern, setPattern] = useState(item?.pattern || 'uni');
  const [fit, setFit] = useState(item?.fit || 'regular');
  const [details, setDetails] = useState(item?.details?.join(', ') || '');
  const [styleTags, setStyleTags] = useState(item?.styleTags || []);
  const [occasionTags, setOccasionTags] = useState(item?.tags || item?.occasion_tags || []);
  const [seasonality, setSeasonality] = useState(item?.seasons || item?.seasonality || []);
  const [brand, setBrand] = useState(item?.brand || '');
  const [name, setName] = useState(item?.name || '');
  
  useEffect(() => {
    if (item) {
      setPieceType(item.category || item.piece_type || '');
      setPrimaryColors(item.colors || []);
      setSecondaryColors(item.secondaryColors || []);
      setMaterial(item.materials?.[0] || item.material || '');
      setPattern(item.pattern || 'uni');
      setFit(item.fit || 'regular');
      setDetails(item.details?.join(', ') || '');
      setStyleTags(item.styleTags || []);
      setOccasionTags(item.tags || item.occasion_tags || []);
      setSeasonality(item.seasons || item.seasonality || []);
      setBrand(item.brand || '');
      setName(item.name || '');
    }
  }, [item]);
  
  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = {
        name: name || pieceType,
        brand,
        colors: primaryColors,
        secondaryColors,
        materials: material ? [material] : [],
        pattern,
        fit,
        details: details ? details.split(',').map(d => d.trim()).filter(Boolean) : [],
        styleTags,
        tags: occasionTags,
        seasons: seasonality,
      };
      
      const result = await updateItem(item.id, updates);
      
      if (result.success) {
        Alert.alert('Succès', 'Les modifications ont été enregistrées');
        onSave(result.data);
        onClose();
      } else {
        Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
      }
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleSelection = (value, currentSelection, setSelection, multiSelect = true) => {
    if (multiSelect) {
      if (currentSelection.includes(value)) {
        setSelection(currentSelection.filter(v => v !== value));
      } else {
        setSelection([...currentSelection, value]);
      }
    } else {
      setSelection(value);
    }
  };
  
  const renderOptionGrid = (options, selectedValues, onToggle, multiSelect = true) => {
    const isSelected = (value) => {
      if (multiSelect) {
        return selectedValues.includes(value);
      }
      return selectedValues === value;
    };
    
    return (
      <View style={styles.optionGrid}>
        {options.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionChip,
              isSelected(option.value) && styles.optionChipSelected
            ]}
            onPress={() => onToggle(option.value, selectedValues, onToggle === setPieceType ? setPieceType : onToggle === setMaterial ? setMaterial : onToggle === setPattern ? setPattern : onToggle === setFit ? setFit : null, multiSelect)}
          >
            {option.hex && (
              <View style={[styles.colorPreview, { backgroundColor: option.hex }]} />
            )}
            {option.icon && <Text style={styles.optionIcon}>{option.icon}</Text>}
            <Text style={[
              styles.optionText,
              isSelected(option.value) && styles.optionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier les attributs</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? (
              <Text style={styles.saveText}>...</Text>
            ) : (
              <Text style={styles.saveText}>Enregistrer</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Nom personnalisé */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nom personnalisé</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Mon t-shirt préféré"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            {/* Marque */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Marque</Text>
              <TextInput
                style={styles.textInput}
                value={brand}
                onChangeText={setBrand}
                placeholder="Ex: Nike, Zara, H&M..."
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            {/* Type de vêtement */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Type de vêtement</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {renderOptionGrid(PREDEFINED_OPTIONS.piece_types, pieceType, (value) => setPieceType(value), false)}
              </ScrollView>
            </View>
            
            {/* Couleurs principales */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Couleurs principales</Text>
              {renderOptionGrid(PREDEFINED_OPTIONS.colors, primaryColors, (value) => toggleSelection(value, primaryColors, setPrimaryColors))}
            </View>
            
            {/* Couleurs secondaires */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Couleurs secondaires</Text>
              {renderOptionGrid(PREDEFINED_OPTIONS.colors, secondaryColors, (value) => toggleSelection(value, secondaryColors, setSecondaryColors))}
            </View>
            
            {/* Matière */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Matière</Text>
              {renderOptionGrid(PREDEFINED_OPTIONS.materials, material, (value) => setMaterial(value), false)}
            </View>
            
            {/* Motif */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Motif</Text>
              {renderOptionGrid(PREDEFINED_OPTIONS.patterns, pattern, (value) => setPattern(value), false)}
            </View>
            
            {/* Coupe */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Coupe</Text>
              {renderOptionGrid(PREDEFINED_OPTIONS.fits, fit, (value) => setFit(value), false)}
            </View>
            
            {/* Détails (champ libre) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Détails</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={details}
                onChangeText={setDetails}
                placeholder="Ex: poches, boutons dorés, broderie, cropped..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>
            
            {/* Styles */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Styles</Text>
              {renderOptionGrid(PREDEFINED_OPTIONS.styles, styleTags, (value) => toggleSelection(value, styleTags, setStyleTags))}
            </View>
            
            {/* Occasions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Occasions</Text>
              {renderOptionGrid(PREDEFINED_OPTIONS.occasions, occasionTags, (value) => toggleSelection(value, occasionTags, setOccasionTags))}
            </View>
            
            {/* Saisonnalité */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Saisonnalité</Text>
              {renderOptionGrid(PREDEFINED_OPTIONS.seasons, seasonality, (value) => toggleSelection(value, seasonality, setSeasonality))}
            </View>
            
            <View style={styles.bottomPadding} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
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
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1f2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginRight: 10,
    marginBottom: 10,
  },
  optionChipSelected: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  optionText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#667eea',
    fontWeight: '600',
  },
  optionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bottomPadding: {
    height: 50,
  },
});