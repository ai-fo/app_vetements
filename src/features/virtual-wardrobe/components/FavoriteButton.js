import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function FavoriteButton({ isFavorite, onToggle, size = 24, style }) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {isFavorite ? (
          <LinearGradient
            colors={['#f59e0b', '#f97316']}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="star" size={size} color="#fff" />
          </LinearGradient>
        ) : (
          <View style={styles.outlineBackground}>
            <Ionicons name="star-outline" size={size} color="#9ca3af" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBackground: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBackground: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});