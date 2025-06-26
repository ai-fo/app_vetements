import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ItemCard({ item, onPress, onFavorite, deleteMode, onDelete }) {
  const translateTerm = (term) => {
    const translations = {
      'cotton': 'Coton',
      'wool': 'Laine',
      'synthetic': 'Synthétique',
      'leather': 'Cuir',
      'denim': 'Denim',
      'silk': 'Soie',
      'linen': 'Lin',
      'uni': 'Uni',
      'stripes': 'Rayé',
      'plaid': 'Carreaux',
      'floral': 'Fleuri',
      'print': 'Imprimé',
      'slim': 'Ajusté',
      'regular': 'Normal',
      'loose': 'Ample',
      'oversized': 'Oversized',
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

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name || 'Sans nom'}
        </Text>
        
        <View style={styles.attributes}>
          {item.materials?.[0] && (
            <View style={styles.attributeChip}>
              <Ionicons name="shirt-outline" size={12} color="#6b7280" />
              <Text style={styles.attributeText}>{translateTerm(item.materials[0])}</Text>
            </View>
          )}
          
          {item.pattern && (
            <View style={styles.attributeChip}>
              <Ionicons name="color-palette-outline" size={12} color="#6b7280" />
              <Text style={styles.attributeText}>{translateTerm(item.pattern)}</Text>
            </View>
          )}
          
          {item.fit && (
            <View style={styles.attributeChip}>
              <Ionicons name="resize-outline" size={12} color="#6b7280" />
              <Text style={styles.attributeText}>{translateTerm(item.fit)}</Text>
            </View>
          )}
        </View>

        {item.colors?.length > 0 && (
          <View style={styles.colorRow}>
            {item.colors.slice(0, 3).map((color, index) => (
              <View key={index} style={styles.colorDot}>
                <Text style={styles.colorText}>{translateTerm(color)}</Text>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.footer}>
          {item.styleTags?.length > 0 && (
            <Text style={styles.styleTag}>
              {translateTerm(item.styleTags[0])}
            </Text>
          )}
          
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onFavorite(item.id)}>
              <Ionicons 
                name={item.isFavorite ? "heart" : "heart-outline"} 
                size={20} 
                color={item.isFavorite ? "#ef4444" : "#9ca3af"}
              />
            </TouchableOpacity>
            
            {deleteMode && (
              <TouchableOpacity onPress={() => onDelete(item.id, item.name)}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  attributes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  attributeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  attributeText: {
    fontSize: 11,
    color: '#6b7280',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  colorDot: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  colorText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  styleTag: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
});