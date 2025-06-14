import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function WeatherWidget({ weather, loading, error, onRefresh }) {
  // État de chargement
  if (loading && !weather) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
          style={[styles.gradient, styles.loadingContainer]}
        >
          <ActivityIndicator size="small" color="#667eea" />
          <Text style={styles.loadingText}>Chargement météo...</Text>
        </LinearGradient>
      </View>
    );
  }

  // État d'erreur
  if (error && !weather) {
    return (
      <TouchableOpacity style={styles.container} onPress={onRefresh}>
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
          style={[styles.gradient, styles.errorContainer]}
        >
          <Ionicons name="cloud-offline" size={24} color="#ef4444" />
          <View style={styles.errorInfo}>
            <Text style={styles.errorText}>Météo indisponible</Text>
            <Text style={styles.errorSubtext}>Toucher pour réessayer</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Pas de données
  if (!weather) {
    return null;
  }

  // Affichage normal
  return (
    <TouchableOpacity style={styles.container} onPress={onRefresh} activeOpacity={0.8}>
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
        style={styles.gradient}
      >
        <View style={styles.mainContent}>
          <Ionicons name={weather.icon} size={28} color="#667eea" />
          <View style={styles.weatherInfo}>
            <View style={styles.tempContainer}>
              <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
              {weather.feels_like && weather.feels_like !== weather.temp && (
                <Text style={styles.feelsLike}>Ressenti {weather.feels_like}°</Text>
              )}
            </View>
            <Text style={styles.weatherDesc}>{weather.description}</Text>
            {weather.city && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-sharp" size={12} color="#9ca3af" />
                <Text style={styles.weatherCity}>{weather.city}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.weatherDetails}>
          <View style={styles.weatherDetail}>
            <Ionicons name="water" size={14} color="#9ca3af" />
            <Text style={styles.weatherDetailText}>{weather.humidity}%</Text>
          </View>
          <View style={styles.weatherDetail}>
            <Ionicons name="speedometer" size={14} color="#9ca3af" />
            <Text style={styles.weatherDetailText}>{weather.wind}km/h</Text>
          </View>
          {weather.temp_min && weather.temp_max && (
            <View style={styles.weatherDetail}>
              <Ionicons name="thermometer" size={14} color="#9ca3af" />
              <Text style={styles.weatherDetailText}>
                {weather.temp_min}°/{weather.temp_max}°
              </Text>
            </View>
          )}
        </View>

        {/* Indicateur de rafraîchissement */}
        <View style={styles.refreshIndicator}>
          <Ionicons name="refresh" size={12} color="#cbd5e1" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    position: 'relative',
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  weatherInfo: {
    flex: 1,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  weatherTemp: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  feelsLike: {
    fontSize: 14,
    color: '#6b7280',
  },
  weatherDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  weatherCity: {
    fontSize: 12,
    color: '#9ca3af',
  },
  weatherDetails: {
    gap: 6,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherDetailText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  refreshIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  errorInfo: {
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  errorSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
});