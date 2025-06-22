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
import OutfitPiecesSection from '../../virtual-wardrobe/components/OutfitPiecesSection';

export default function AnalysisResultScreen({ route, navigation }) {
  const { analysisId } = route.params;
  const { getAnalysisById, deleteAnalysis } = useOutfitAnalysis();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, [analysisId]);

  const loadAnalysis = async () => {
    try {
      const data = await getAnalysisById(analysisId);
      console.log('Analysis data loaded:', data);
      console.log('Outfit pieces:', data?.outfit_pieces);
      console.log('Number of pieces:', data?.outfit_pieces?.length);
      setAnalysis(data);
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAnalysis(analysisId);
      navigation.goBack();
    } catch (error) {
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Analyse non trouvée</Text>
      </View>
    );
  }

  const isProcessing = analysis.processing_status === 'pending';
  const hasFailed = analysis.processing_status === 'failed';

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la tenue</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: analysis.image_url }} style={styles.image} />

        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.processingText}>Analyse en cours...</Text>
          </View>
        )}

        {hasFailed && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.errorText}>L'analyse a échoué</Text>
            {analysis.error_message && (
              <Text style={styles.errorDetails}>{analysis.error_message}</Text>
            )}
          </View>
        )}

        {analysis.processing_status === 'completed' && (
          <View style={styles.content}>
            <OutfitPiecesSection analysisId={analysisId} pieces={analysis.outfit_pieces} />
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informations générales</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Style</Text>
                  <Text style={styles.infoValue}>{analysis.style || 'Non défini'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Catégorie</Text>
                  <Text style={styles.infoValue}>{analysis.category || 'Non défini'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Formalité</Text>
                  <View style={styles.scoreBar}>
                    <View style={[styles.scoreFill, { width: `${(analysis.formality || 0) * 10}%` }]} />
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Polyvalence</Text>
                  <View style={styles.scoreBar}>
                    <View style={[styles.scoreFill, { width: `${(analysis.versatility || 0) * 10}%` }]} />
                  </View>
                </View>
              </View>
            </View>

            {analysis.colors && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Couleurs</Text>
                <View style={styles.colorSection}>
                  <Text style={styles.colorLabel}>Principales</Text>
                  <View style={styles.colorList}>
                    {analysis.colors.primary?.map((color, index) => (
                      <View key={index} style={styles.colorChip}>
                        <Text style={styles.colorText}>{color}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {analysis.occasions && analysis.occasions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Occasions</Text>
                <View style={styles.tagList}>
                  {analysis.occasions.map((occasion, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{occasion}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {analysis.seasons && analysis.seasons.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Saisons</Text>
                <View style={styles.tagList}>
                  {analysis.seasons.map((season, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{season}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.dateInfo}>
              <Text style={styles.dateText}>
                Ajoutée le {new Date(analysis.created_at).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  processingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#667eea',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 20,
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '600',
  },
  errorDetails: {
    marginTop: 10,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginLeft: 20,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  colorSection: {
    marginBottom: 15,
  },
  colorLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
  },
  colorList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorChip: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  colorText: {
    fontSize: 14,
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: 'rgba(102,126,234,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  dateInfo: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});