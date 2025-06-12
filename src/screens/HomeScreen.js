import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setTimeout(() => {
        rippleAnim.setValue(0);
        opacityAnim.setValue(0);
      }, 300);
    });
  };

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 2],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.2, 0],
  });

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={signOut}
      >
        <Ionicons name="log-out-outline" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Liquid Design</Text>
        <Text style={styles.subtitle}>
          Bienvenue, {user?.email?.split('@')[0]}
        </Text>

        <View style={styles.buttonContainer}>
          <Animated.View
            style={[
              styles.ripple,
              {
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
            }}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={handlePress}
              activeOpacity={0.8}
            >
              <Ionicons name="shirt-outline" size={40} color="#667eea" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.Text
          style={[
            styles.message,
            {
              opacity: opacityAnim,
            },
          ]}
        >
          Tenue sélectionnée
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 50,
    textAlign: 'center',
  },
  buttonContainer: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ripple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
  },
  message: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '500',
  },
});