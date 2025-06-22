import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWeatherRecommendations } from '../hooks';
import RecommendationCard from './RecommendationCard';
import WeatherDisplay from './WeatherDisplay';

export default function WeatherRecommendations({ visible, onClose }) {
  const [city, setCity] = useState('Paris');
  const [occasion, setOccasion] = useState('quotidien');
  const [style, setStyle] = useState('casual');
  const [showSettings, setShowSettings] = useState(true);
  
  const { loading, error, recommendations, getRecommendations, clearRecommendations } = useWeatherRecommendations();

  const occasions = [
    { value: 'quotidien', label: '🏠 Quotidien', icon: 'home' },
    { value: 'travail', label: '💼 Travail', icon: 'briefcase' },
    { value: 'sport', label: '🏃 Sport', icon: 'fitness' },
    { value: 'soirée', label: '🎉 Soirée', icon: 'moon' },
    { value: 'weekend', label: '🌴 Weekend', icon: 'sunny' },
  ];

  const styles_preference = [
    { value: 'casual', label: 'Décontracté' },
    { value: 'formel', label: 'Formel' },
    { value: 'streetwear', label: 'Streetwear' },
    { value: 'chic', label: 'Chic' },
    { value: 'sportif', label: 'Sportif' },
  ];

  const handleGetRecommendations = async () => {
    const params = {
      city,
      occasion,
      stylePreference: style,
    };
    
    const result = await getRecommendations(params);
    if (result) {
      setShowSettings(false);
    }
  };

  const handleReset = () => {
    clearRecommendations();
    setShowSettings(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#4b5563" />
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <View style={styles.titleContainer}>
                  <Ionicons name="partly-sunny" size={24} color="#667eea" />
                  <Text style={styles.headerTitle}>Recommandations Météo</Text>
                </View>
              </View>

              {recommendations && (
                <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                  <Ionicons name="refresh" size={24} color="#667eea" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {showSettings ? (
                <View style={styles.settingsContainer}>
                  <Text style={styles.sectionTitle}>Où êtes-vous ?</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="location" size={20} color="#667eea" />
                    <TextInput
                      style={styles.input}
                      value={city}
                      onChangeText={setCity}
                      placeholder="Entrez votre ville"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <Text style={styles.sectionTitle}>Pour quelle occasion ?</Text>
                  <View style={styles.optionsGrid}>
                    {occasions.map((occ) => (
                      <TouchableOpacity
                        key={occ.value}
                        style={[
                          styles.optionCard,
                          occasion === occ.value && styles.optionCardSelected
                        ]}
                        onPress={() => setOccasion(occ.value)}
                      >
                        <Ionicons 
                          name={occ.icon} 
                          size={24} 
                          color={occasion === occ.value ? '#fff' : '#667eea'} 
                        />
                        <Text style={[
                          styles.optionText,
                          occasion === occ.value && styles.optionTextSelected
                        ]}>
                          {occ.label.split(' ')[1]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.sectionTitle}>Votre style préféré</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {styles_preference.map((st) => (
                      <TouchableOpacity
                        key={st.value}
                        style={[
                          styles.styleChip,
                          style === st.value && styles.styleChipSelected
                        ]}
                        onPress={() => setStyle(st.value)}
                      >
                        <Text style={[
                          styles.styleChipText,
                          style === st.value && styles.styleChipTextSelected
                        ]}>
                          {st.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <TouchableOpacity 
                    style={styles.getRecommendationsButton}
                    onPress={handleGetRecommendations}
                    disabled={loading || !city}
                  >
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.gradientButton}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="sparkles" size={20} color="#fff" />
                          <Text style={styles.buttonText}>Obtenir des recommandations</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {error && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={20} color="#ef4444" />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.recommendationsContainer}>
                  {recommendations && (
                    <>
                      <WeatherDisplay weatherData={recommendations.weather_data} />
                      
                      <View style={styles.summaryCard}>
                        <Text style={styles.summaryText}>
                          {recommendations.weather_summary}
                        </Text>
                      </View>

                      <Text style={styles.recommendationsTitle}>
                        Tenues recommandées pour vous
                      </Text>

                      {recommendations.recommendations.map((rec, index) => (
                        <RecommendationCard 
                          key={index} 
                          recommendation={rec} 
                          index={index}
                        />
                      ))}

                      {recommendations.general_tips && recommendations.general_tips.length > 0 && (
                        <View style={styles.tipsContainer}>
                          <Text style={styles.tipsTitle}>💡 Conseils du jour</Text>
                          {recommendations.general_tips.map((tip, index) => (
                            <View key={index} style={styles.tipRow}>
                              <Text style={styles.tipBullet}>•</Text>
                              <Text style={styles.tipText}>{tip}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardView: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 4,
  },
  resetButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  settingsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    gap: 8,
  },
  optionCardSelected: {
    backgroundColor: '#667eea',
  },
  optionText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
  },
  styleChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  styleChipSelected: {
    backgroundColor: '#667eea',
  },
  styleChipText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  styleChipTextSelected: {
    color: '#fff',
  },
  getRecommendationsButton: {
    marginTop: 30,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
  },
  recommendationsContainer: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#e0e7ff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  summaryText: {
    fontSize: 15,
    color: '#4338ca',
    lineHeight: 22,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  tipsContainer: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    color: '#92400e',
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    color: '#78350f',
    fontSize: 14,
    lineHeight: 20,
  },
});