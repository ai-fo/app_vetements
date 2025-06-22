import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOOD_KEY = '@user_mood';

export const useMood = () => {
  const [mood, setMood] = useState('relaxed');
  const [loading, setLoading] = useState(true);

  const moods = [
    { id: 'energetic', label: 'Énergique', icon: 'flash', color: '#f59e0b' },
    { id: 'relaxed', label: 'Détendu', icon: 'leaf', color: '#10b981' },
    { id: 'professional', label: 'Professionnel', icon: 'briefcase', color: '#6366f1' },
    { id: 'creative', label: 'Créatif', icon: 'color-palette', color: '#ec4899' },
    { id: 'romantic', label: 'Romantique', icon: 'heart', color: '#ef4444' },
    { id: 'adventurous', label: 'Aventurier', icon: 'compass', color: '#8b5cf6' },
  ];

  useEffect(() => {
    loadMood();
  }, []);

  const loadMood = async () => {
    try {
      const savedMood = await AsyncStorage.getItem(MOOD_KEY);
      if (savedMood) {
        setMood(savedMood);
      }
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  const saveMood = async (newMood) => {
    try {
      await AsyncStorage.setItem(MOOD_KEY, newMood);
      setMood(newMood);
    } catch (error) {
      }
  };

  const getMoodInfo = (moodId) => {
    return moods.find(m => m.id === moodId) || moods[1]; // Default to relaxed
  };

  return {
    mood,
    moods,
    loading,
    saveMood,
    getMoodInfo,
  };
};