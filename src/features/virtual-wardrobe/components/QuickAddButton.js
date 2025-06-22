import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../auth';
import { useOutfitAnalysis } from '../../outfit-analysis';

export default function QuickAddButton({ onSuccess, style }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { analyzeOutfit } = useOutfitAnalysis();

  const handleQuickAdd = async () => {
    try {
      // Demander la permission pour accéder à la galerie
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Nous avons besoin de votre permission pour accéder à la galerie.'
        );
        return;
      }

      // Ouvrir la galerie
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled) {
        setIsProcessing(true);
        try {
          // Analyser l'image directement comme un vêtement
          await analyzeOutfit(result.assets[0].uri, user.id, 'clothing');
          
          // Appeler le callback de succès si fourni
          if (onSuccess) {
            await onSuccess();
          }
        } catch (error) {
          Alert.alert(
            'Erreur',
            "L'ajout du vêtement a échoué. Veuillez réessayer."
          );
        } finally {
          setIsProcessing(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de l\'ouverture de la galerie.'
      );
    }
  };

  return (
    <TouchableOpacity
      testID="quick-add-button"
      style={[styles.button, style]}
      onPress={handleQuickAdd}
      activeOpacity={0.8}
      disabled={isProcessing}
      accessibilityState={{ disabled: isProcessing }}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        {isProcessing ? (
          <ActivityIndicator 
            testID="loading-indicator"
            size="small" 
            color="#fff" 
          />
        ) : (
          <Ionicons name="add" size={28} color="#fff" />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  gradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});