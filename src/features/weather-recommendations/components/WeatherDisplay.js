import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const getWeatherIcon = (weatherCode) => {
  if (weatherCode === 0 || weatherCode === 1) return 'sunny';
  if (weatherCode === 2) return 'partly-sunny';
  if (weatherCode === 3) return 'cloud';
  if (weatherCode >= 45 && weatherCode <= 48) return 'cloudy';
  if (weatherCode >= 51 && weatherCode <= 67) return 'rainy';
  if (weatherCode >= 71 && weatherCode <= 77) return 'snow';
  if (weatherCode >= 80 && weatherCode <= 82) return 'rainy';
  if (weatherCode >= 95) return 'thunderstorm';
  return 'partly-sunny';
};

export default function WeatherDisplay({ weatherData }) {
  if (!weatherData) return null;

  const { current, daily, city, country } = weatherData;
  const weatherIcon = getWeatherIcon(current.weather_code);

  return (
    <View style={styles.container}>
      <View style={styles.locationRow}>
        <Ionicons name="location" size={20} color="#667eea" />
        <Text style={styles.location}>{city}, {country}</Text>
      </View>

      <View style={styles.mainWeather}>
        <View style={styles.tempContainer}>
          <Ionicons name={weatherIcon} size={48} color="#667eea" />
          <Text style={styles.temperature}>{Math.round(current.temperature)}°C</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detail}>
              <Ionicons name="thermometer-outline" size={18} color="#6b7280" />
              <Text style={styles.detailText}>
                {Math.round(daily.min_temp)}° / {Math.round(daily.max_temp)}°
              </Text>
            </View>
            <View style={styles.detail}>
              <Ionicons name="water-outline" size={18} color="#6b7280" />
              <Text style={styles.detailText}>{current.humidity}%</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detail}>
              <Ionicons name="rainy-outline" size={18} color="#6b7280" />
              <Text style={styles.detailText}>{current.precipitation} mm</Text>
            </View>
            <View style={styles.detail}>
              <Ionicons name="speedometer-outline" size={18} color="#6b7280" />
              <Text style={styles.detailText}>{Math.round(current.wind_speed)} km/h</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  mainWeather: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  temperature: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1f2937',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
});