import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8045';

// API endpoints for AI services
export const API_ENDPOINTS = {
  ANALYZE_OUTFIT: '/analyze-outfit',
  GENERATE_SUGGESTIONS: '/generate-outfit-suggestions',
  MATCH_OUTFIT: '/match-outfit',
  DAILY_RECOMMENDATIONS: '/daily-recommendations',
};

class APIClient {
  constructor() {
    this.baseURL = API_URL;
    this.token = null;
  }

  async setAuthToken(token) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem('authToken', token);
    } else {
      await AsyncStorage.removeItem('authToken');
    }
  }

  async getAuthToken() {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('authToken');
    }
    return this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async uploadFile(endpoint, file, additionalData = {}) {
    const token = await this.getAuthToken();
    const formData = new FormData();
    
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.name || 'photo.jpg',
    });

    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const config = {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
}

export const apiClient = new APIClient();
export default apiClient;