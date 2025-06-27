import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { theme } from '../styles/theme';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon
}) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  
  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator 
          color={isPrimary ? '#fff' : theme.colors.primary} 
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[
            styles.text,
            isPrimary && styles.primaryText,
            isSecondary && styles.secondaryText,
            isDanger && styles.dangerText,
            disabled && styles.disabledText,
            textStyle
          ]}>
            {title}
          </Text>
        </View>
      )}
    </>
  );

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading}
      style={[
        styles.container,
        isPrimary && styles.primaryContainer,
        isSecondary && styles.secondaryContainer,
        isDanger && styles.dangerContainer,
        disabled && styles.disabledContainer,
        style
      ]}
      activeOpacity={0.7}
    >
      {buttonContent}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.full,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  primaryContainer: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.md,
  },
  secondaryContainer: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  dangerContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1.5,
    borderColor: theme.colors.error,
  },
  disabledContainer: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },
  text: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.medium,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: theme.colors.primary,
  },
  dangerText: {
    color: theme.colors.error,
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
});