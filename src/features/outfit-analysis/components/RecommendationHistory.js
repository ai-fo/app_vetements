import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../auth';
import { recommendationHistoryService } from '../services/recommendationHistoryService';
import { theme } from '../../../shared/styles/theme';

export default function RecommendationHistory({ navigation }) {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
    loadStats();
  }, [user?.id]);

  const loadHistory = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    const { data, error } = await recommendationHistoryService.getRecommendationHistory(user.id, 50);
    if (!error && data) {
      setHistory(data);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    if (!user?.id) return;
    
    const { data } = await recommendationHistoryService.getRecommendationStats(user.id);
    if (data) {
      setStats(data);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'single': return 'shirt-outline';
      case 'outfit': return 'body-outline';
      case 'combination': return 'git-merge-outline';
      default: return 'help-circle-outline';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'single': return 'Pièce unique';
      case 'outfit': return 'Tenue complète';
      case 'combination': return 'Combinaison';
      default: return 'Recommandation';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Chargement de l'historique...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Statistiques */}
      {stats && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Vos statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Recommandations</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.worn}</Text>
              <Text style={styles.statLabel}>Portées</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(stats.wornRate)}%</Text>
              <Text style={styles.statLabel}>Taux d'adoption</Text>
            </View>
          </View>
        </View>
      )}

      {/* Historique */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Historique des recommandations</Text>
        
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>Aucune recommandation pour le moment</Text>
          </View>
        ) : (
          history.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.historyItem}
              onPress={() => {
                if (item.item_id || item.look_id) {
                  navigation.navigate('ClothingDetailView', {
                    item: { id: item.item_id || item.look_id }
                  });
                }
              }}
            >
              {/* Image */}
              <View style={styles.imageContainer}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons 
                      name={getTypeIcon(item.recommendation_type)} 
                      size={24} 
                      color={theme.colors.textMuted} 
                    />
                  </View>
                )}
              </View>

              {/* Détails */}
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.item_name || 'Recommandation'}
                </Text>
                <View style={styles.itemMeta}>
                  <View style={styles.typeTag}>
                    <Ionicons 
                      name={getTypeIcon(item.recommendation_type)} 
                      size={12} 
                      color={theme.colors.primary} 
                    />
                    <Text style={styles.typeText}>
                      {getTypeLabel(item.recommendation_type)}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>{formatDate(item.recommended_at)}</Text>
                </View>
                {item.score && (
                  <View style={styles.scoreBar}>
                    <View style={[styles.scoreFill, { width: `${item.score}%` }]} />
                  </View>
                )}
              </View>

              {/* Statut */}
              <View style={styles.statusContainer}>
                {item.was_worn ? (
                  <View style={styles.wornBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
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
    padding: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textSecondary,
  },
  statsCard: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  statsTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  historySection: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textMuted,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  imageContainer: {
    marginRight: theme.spacing.md,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.text,
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  typeText: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.primary,
  },
  dateText: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.textMuted,
  },
  scoreBar: {
    height: 3,
    backgroundColor: theme.colors.border,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  statusContainer: {
    marginLeft: theme.spacing.sm,
  },
  wornBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${theme.colors.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});