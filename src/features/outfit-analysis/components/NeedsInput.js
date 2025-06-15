import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { height: screenHeight } = Dimensions.get('window');

export default function NeedsInput({ onSubmit, isVisible, onClose }) {
  const [inputText, setInputText] = useState('');
  const [suggestions] = useState([
    'Entretien pro',
    'Soirée casual',
    'Sport',
    'Rendez-vous',
  ]);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleSubmit = () => {
    if (inputText.trim()) {
      onSubmit(inputText.trim());
      setInputText('');
      Keyboard.dismiss();
    }
  };

  const handleSuggestion = (suggestion) => {
    setInputText(suggestion);
  };

  if (!isVisible) return null;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.View 
        style={[
          StyleSheet.absoluteFillObject, 
          { opacity: fadeAnim }
        ]}
      >
        <BlurView
          intensity={80}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFillObject} 
            onPress={onClose}
            activeOpacity={1}
          />
        </BlurView>
      </Animated.View>

      <Animated.View 
        style={[
          styles.inputContainer,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.dragIndicator} />
            <View style={styles.header}>
              <Text style={styles.title}>Qu'avez-vous prévu aujourd'hui ?</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={26} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              Dites-moi vos besoins et je vous suggère la tenue parfaite
            </Text>

            {/* Suggestions rapides */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsScroll}
              contentContainerStyle={styles.suggestionsContainer}
            >
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestion(suggestion)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Zone de saisie */}
            <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: J'ai un déjeuner d'affaires puis du sport..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={200}
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSubmit}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={inputText.trim() ? ['#fff', '#f3f4f6'] : ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.3)']}
                style={styles.sendButtonGradient}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={inputText.trim() ? '#667eea' : 'rgba(255,255,255,0.5)'} 
                />
              </LinearGradient>
            </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: '25%',
  },
  gradient: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  safeArea: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    paddingRight: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
    lineHeight: 20,
  },
  suggestionsScroll: {
    marginBottom: 24,
    marginHorizontal: -20,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  suggestionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingTop: 14,
    fontSize: 16,
    color: '#fff',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sendButton: {
    width: 44,
    height: 44,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginBottom: 16,
  },
});