import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OutfitPiecesSection({ analysisId, pieces: propPieces }) {
  const [pieces, setPieces] = useState(propPieces || []);
  const [loading, setLoading] = useState(!propPieces);
  const [expandedPiece, setExpandedPiece] = useState(null);
  
  useEffect(() => {
    if (propPieces) {
      setPieces(propPieces);
      setLoading(false);
    } else {
      // Si aucune pièce n'est fournie en props, on ne charge rien
      setLoading(false);
      setPieces([]);
    }
  }, [propPieces]);

  const getTypeIcon = (type) => {
    const icons = {
      'top': 'shirt-outline',
      'bottom': 'man-outline',
      'shoes': 'footsteps-outline',
      'accessory': 'watch-outline',
      'outerwear': 'snow-outline',
      'dress': 'woman-outline',
    };
    return icons[type] || 'help-circle-outline';
  };

  const getTypeLabel = (type) => {
    const labels = {
      'top': 'Haut',
      'bottom': 'Bas',
      'shoes': 'Chaussures',
      'accessory': 'Accessoire',
      'outerwear': 'Vêtement extérieur',
      'dress': 'Robe',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#667eea" />
      </View>
    );
  }

  if (pieces.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Pièces détectées</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Aucune pièce détaillée pour cette tenue.
            {'\n'}Les nouvelles analyses incluront automatiquement les détails de chaque pièce.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Pièces détectées</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {pieces.map((piece) => (
          <TouchableOpacity
            key={piece.id}
            style={[
              styles.pieceCard,
              expandedPiece === piece.id && styles.pieceCardExpanded
            ]}
            onPress={() => setExpandedPiece(expandedPiece === piece.id ? null : piece.id)}
          >
            <View style={styles.pieceHeader}>
              <View style={styles.pieceIcon}>
                <Ionicons 
                  name={getTypeIcon(piece.type)} 
                  size={24} 
                  color="#667eea" 
                />
              </View>
              <View style={styles.pieceMainInfo}>
                <Text style={styles.pieceName}>{piece.name}</Text>
                <Text style={styles.pieceType}>{getTypeLabel(piece.type)}</Text>
              </View>
              <Ionicons 
                name={expandedPiece === piece.id ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6b7280" 
              />
            </View>

            {expandedPiece === piece.id && (
              <View style={styles.pieceDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Couleur</Text>
                    <Text style={styles.detailValue}>{piece.color}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Matière</Text>
                    <Text style={styles.detailValue}>{piece.material}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Style</Text>
                    <Text style={styles.detailValue}>{piece.style}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Coupe</Text>
                    <Text style={styles.detailValue}>{piece.fit}</Text>
                  </View>
                </View>



                {piece.confidence && (
                  <View style={styles.confidenceBar}>
                    <Text style={styles.confidenceLabel}>
                      Confiance: {Math.round(piece.confidence * 100)}%
                    </Text>
                    <View style={styles.confidenceTrack}>
                      <View 
                        style={[
                          styles.confidenceFill, 
                          { width: `${piece.confidence * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  container: {
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
  },
  pieceCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 280,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pieceCardExpanded: {
    minWidth: 320,
  },
  pieceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pieceIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#e0e7ff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pieceMainInfo: {
    flex: 1,
  },
  pieceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  pieceType: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  pieceDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  brandSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  brandText: {
    fontSize: 14,
    color: '#4b5563',
    fontStyle: 'italic',
    marginTop: 4,
  },
  confidenceBar: {
    marginTop: 16,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  confidenceTrack: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
});