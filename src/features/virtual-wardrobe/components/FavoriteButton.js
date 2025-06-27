import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FavoriteButton({ isFavorite, onToggle, size = 20, style }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFavorite) {
      // Animation lors de l'ajout aux favoris
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animation
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
      rotateAnim.setValue(0);
    }
  }, [isFavorite]);

  const handlePress = () => {
    // Animation de pression
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { scale: scaleAnim },
              { rotate: spin },
            ],
          },
        ]}
      >
        {isFavorite ? (
          <View style={styles.filledBackground}>
            <Ionicons name="heart" size={size} color="#fbbf24" />
          </View>
        ) : (
          <View style={styles.outlineBackground}>
            <Ionicons name="heart-outline" size={size} color="#9ca3af" />
          </View>
        )}
      </Animated.View>
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
  filledBackground: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBackground: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});