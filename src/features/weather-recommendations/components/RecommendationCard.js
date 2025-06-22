import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const getPieceIcon = (type) => {
  const icons = {
    'top': 'shirt-outline',
    'bottom': 'man-outline',
    'outerwear': 'snow-outline',
    'shoes': 'footsteps-outline',
    'accessory': 'watch-outline',
    'dress': 'woman-outline',
  };
  return icons[type] || 'help-circle-outline';
};

export default function RecommendationCard({ recommendation, index }) {
  const [expanded, setExpanded] = useState(false);

  const colors = ['#667eea', '#ec4899', '#10b981'];
  const color = colors[index % colors.length];

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={[styles.header, { borderLeftColor: color }]}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{recommendation.name}</Text>
          <Text style={styles.description}>{recommendation.description}</Text>
          
          <View style={styles.tagsContainer}>
            {recommendation.style_tags.map((tag, i) => (
              <View key={i} style={[styles.tag, { backgroundColor: `${color}20` }]}>
                <Text style={[styles.tagText, { color }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#6b7280" 
        />
      </View>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="happy-outline" size={20} color="#667eea" />
              <Text style={styles.statLabel}>Confort</Text>
              <Text style={styles.statValue}>{recommendation.comfort_level}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="cloud-outline" size={20} color="#667eea" />
              <Text style={styles.statLabel}>Météo</Text>
              <Text style={styles.statValue}>{recommendation.weather_appropriateness}</Text>
            </View>
          </View>

          <View style={styles.piecesSection}>
            <Text style={styles.piecesTitle}>Pièces de la tenue</Text>
            {recommendation.pieces.map((piece, i) => (
              <View key={i} style={styles.pieceCard}>
                <View style={styles.pieceIcon}>
                  <Ionicons name={getPieceIcon(piece.type)} size={20} color="#667eea" />
                </View>
                <View style={styles.pieceContent}>
                  <Text style={styles.pieceDescription}>{piece.description}</Text>
                  <Text style={styles.pieceWhy}>{piece.why}</Text>
                </View>
              </View>
            ))}
          </View>

          {recommendation.tips && (
            <View style={styles.tipsSection}>
              <View style={styles.tipIcon}>
                <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.tipsText}>{recommendation.tips}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    padding: 16,
    borderLeftWidth: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  expandedContent: {
    padding: 16,
    paddingTop: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  piecesSection: {
    marginBottom: 16,
  },
  piecesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
  },
  pieceCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  pieceIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#e0e7ff',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceContent: {
    flex: 1,
  },
  pieceDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  pieceWhy: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  tipsSection: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginTop: 2,
  },
  tipsText: {
    flex: 1,
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
});