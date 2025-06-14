import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY || '';
const OPENWEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY = 'weather_cache';

class WeatherService {
  constructor() {
    this.apiKey = WEATHER_API_KEY;
  }

  // Obtenir la position actuelle de l'utilisateur
  async getCurrentLocation() {
    try {
      // Demander la permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission de localisation refusée');
        // Retourner Paris par défaut
        return { latitude: 48.8566, longitude: 2.3522 };
      }

      // Obtenir la position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      // Retourner Paris par défaut
      return { latitude: 48.8566, longitude: 2.3522 };
    }
  }

  // Vérifier le cache
  async getCachedWeather() {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        // Vérifier si le cache est encore valide
        if (now - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    } catch (error) {
      console.error('Erreur de lecture du cache:', error);
    }
    return null;
  }

  // Sauvegarder en cache
  async cacheWeather(data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erreur de sauvegarde du cache:', error);
    }
  }

  // Mapper les conditions météo
  mapWeatherCondition(weatherMain) {
    const conditionMap = {
      'Clear': { condition: 'ensoleillé', icon: 'sunny' },
      'Clouds': { condition: 'nuageux', icon: 'cloud' },
      'Rain': { condition: 'pluvieux', icon: 'rainy' },
      'Drizzle': { condition: 'pluvieux', icon: 'rainy' },
      'Thunderstorm': { condition: 'orageux', icon: 'thunderstorm' },
      'Snow': { condition: 'neigeux', icon: 'snow' },
      'Mist': { condition: 'brumeux', icon: 'partly-sunny' },
      'Fog': { condition: 'brumeux', icon: 'partly-sunny' },
    };

    return conditionMap[weatherMain] || { condition: 'nuageux', icon: 'cloud' };
  }

  // Obtenir la météo actuelle
  async getCurrentWeather(useCache = true) {
    try {
      // Vérifier le cache d'abord
      if (useCache) {
        const cachedData = await this.getCachedWeather();
        if (cachedData) {
          return cachedData;
        }
      }

      // Si pas d'API key configurée, retourner des données mock
      if (!this.apiKey || this.apiKey === '' || this.apiKey === 'your-openweathermap-api-key') {
        console.log('API key météo non configurée, utilisation de données mock');
        return {
          temp: 20,
          condition: 'ensoleillé',
          description: 'Ciel dégagé',
          icon: 'sunny',
          humidity: 65,
          wind: 12,
          city: 'Paris (mode démo)',
          feels_like: 19,
          temp_min: 17,
          temp_max: 23,
        };
      }

      // Obtenir la localisation
      const location = await this.getCurrentLocation();

      // Appeler l'API OpenWeatherMap
      const url = `${OPENWEATHER_API_URL}/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${this.apiKey}&units=metric&lang=fr`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur API météo: ${response.status}`);
      }

      const data = await response.json();

      // Mapper les données
      const weatherCondition = this.mapWeatherCondition(data.weather[0].main);
      const weatherData = {
        temp: Math.round(data.main.temp),
        condition: weatherCondition.condition,
        description: data.weather[0].description,
        icon: weatherCondition.icon,
        humidity: data.main.humidity,
        wind: Math.round(data.wind.speed * 3.6), // Convertir m/s en km/h
        city: data.name,
        feels_like: Math.round(data.main.feels_like),
        temp_min: Math.round(data.main.temp_min),
        temp_max: Math.round(data.main.temp_max),
      };

      // Mettre en cache
      await this.cacheWeather(weatherData);

      return weatherData;
    } catch (error) {
      console.error('Erreur lors de la récupération de la météo:', error);
      
      // Retourner des données par défaut en cas d'erreur
      return {
        temp: 20,
        condition: 'nuageux',
        description: 'Partiellement nuageux',
        icon: 'cloud',
        humidity: 60,
        wind: 10,
        city: 'Localisation inconnue',
      };
    }
  }

  // Obtenir les prévisions météo
  async getWeatherForecast(days = 5) {
    try {
      if (!this.apiKey || this.apiKey === '' || this.apiKey === 'your-openweathermap-api-key') {
        console.log('API key météo non configurée pour les prévisions');
        // Retourner des prévisions mockées
        const today = new Date();
        return Array.from({ length: days }, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          const temps = [18, 22, 19, 21, 20];
          const conditions = ['sunny', 'cloud', 'partly-sunny', 'cloud', 'sunny'];
          const conditionLabels = ['ensoleillé', 'nuageux', 'partiellement nuageux', 'nuageux', 'ensoleillé'];
          
          return {
            date,
            temp: temps[i % temps.length],
            condition: conditionLabels[i % conditionLabels.length],
            icon: conditions[i % conditions.length],
          };
        });
      }

      const location = await this.getCurrentLocation();
      const url = `${OPENWEATHER_API_URL}/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${this.apiKey}&units=metric&lang=fr&cnt=${days * 8}`; // 8 points par jour (toutes les 3h)
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur API météo forecast: ${response.status}`);
      }

      const data = await response.json();

      // Grouper par jour et prendre la moyenne
      const dailyForecasts = {};
      
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = {
            temps: [],
            conditions: [],
            date: new Date(item.dt * 1000),
          };
        }
        
        dailyForecasts[date].temps.push(item.main.temp);
        dailyForecasts[date].conditions.push(item.weather[0].main);
      });

      // Calculer les moyennes
      return Object.values(dailyForecasts).map(day => {
        const avgTemp = Math.round(day.temps.reduce((a, b) => a + b) / day.temps.length);
        const mainCondition = day.conditions.sort((a,b) =>
          day.conditions.filter(v => v===a).length - day.conditions.filter(v => v===b).length
        ).pop();
        
        const weatherCondition = this.mapWeatherCondition(mainCondition);
        
        return {
          date: day.date,
          temp: avgTemp,
          condition: weatherCondition.condition,
          icon: weatherCondition.icon,
        };
      }).slice(0, days);
    } catch (error) {
      console.error('Erreur lors de la récupération des prévisions:', error);
      return [];
    }
  }

  // Obtenir des recommandations vestimentaires basées sur la météo
  getClothingRecommendations(weather) {
    const recommendations = [];
    
    // Recommandations basées sur la température
    if (weather.temp < 5) {
      recommendations.push('Manteau épais', 'Écharpe', 'Gants', 'Bonnet');
    } else if (weather.temp < 15) {
      recommendations.push('Veste', 'Pull', 'Pantalon');
    } else if (weather.temp < 25) {
      recommendations.push('T-shirt', 'Chemise légère', 'Jean ou pantalon léger');
    } else {
      recommendations.push('T-shirt', 'Short', 'Robe légère');
    }

    // Recommandations basées sur les conditions
    if (weather.condition === 'pluvieux' || weather.condition === 'orageux') {
      recommendations.push('Imperméable', 'Parapluie');
    }
    
    if (weather.condition === 'neigeux') {
      recommendations.push('Bottes', 'Vêtements imperméables');
    }

    if (weather.condition === 'ensoleillé' && weather.temp > 20) {
      recommendations.push('Lunettes de soleil', 'Chapeau');
    }

    // Recommandations basées sur le vent
    if (weather.wind > 30) {
      recommendations.push('Coupe-vent');
    }

    return recommendations;
  }
}

export const weatherService = new WeatherService();
export default weatherService;