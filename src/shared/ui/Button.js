import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false,
  disabled = false,
  style,
  textStyle 
}) {
  const isPrimary = variant === 'primary';
  
  if (isPrimary) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        disabled={disabled || loading}
        style={[styles.container, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={disabled ? ['#9ca3af', '#6b7280'] : ['#667eea', '#764ba2']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.text, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading}
      style={[
        styles.container, 
        styles.secondaryContainer,
        disabled && styles.disabledContainer,
        style
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#667eea' : '#ef4444'} />
      ) : (
        <Text style={[
          styles.text, 
          styles.secondaryText,
          variant === 'danger' && styles.dangerText,
          disabled && styles.disabledText,
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryContainer: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledContainer: {
    backgroundColor: '#e5e7eb',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryText: {
    color: '#667eea',
  },
  dangerText: {
    color: '#ef4444',
  },
  disabledText: {
    color: '#9ca3af',
  },
});