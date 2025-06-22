import { useState, useEffect } from 'react';
import { useWardrobe } from '../../virtual-wardrobe';
import { ItemType, ClothingCategory } from '../../virtual-wardrobe';
import { dailyRecommendationService } from '../services/dailyRecommendationService';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useRecommendations = (userId) => {
  const { items = [], loading: wardrobeLoading } = useWardrobe(userId);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('Paris');
  const [preferenceHistory, setPreferenceHistory] = useState([]);
  const [lastRecommendedIds, setLastRecommendedIds] = useState([]);

  // Charger l'historique des vêtements portés
  const loadWearHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(`wear_history_${userId}`);
      if (history) {
        const parsed = JSON.parse(history);
        // Garder seulement les 30 derniers jours
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const recentHistory = parsed.filter(item => item.timestamp > thirtyDaysAgo);
        setPreferenceHistory(recentHistory);
        return recentHistory;
      }
    } catch (error) {
      }
    return [];
  };

  // Charger les dernières recommandations
  const loadLastRecommendations = async () => {
    try {
      const lastRecs = await AsyncStorage.getItem(`last_recommendations_${userId}`);
      if (lastRecs) {
        const parsed = JSON.parse(lastRecs);
        // Garder seulement les recommandations des dernières 24h
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        if (parsed.timestamp > oneDayAgo) {
          setLastRecommendedIds(parsed.ids || []);
          return parsed.ids || [];
        }
      }
    } catch (error) {
      }
    return [];
  };

  // Sauvegarder l'historique
  const saveWearHistory = async (newHistory) => {
    try {
      await AsyncStorage.setItem(`wear_history_${userId}`, JSON.stringify(newHistory));
    } catch (error) {
      }
  };

  // Sauvegarder les dernières recommandations
  const saveLastRecommendations = async (ids) => {
    try {
      await AsyncStorage.setItem(`last_recommendations_${userId}`, JSON.stringify({
        ids: ids,
        timestamp: Date.now()
      }));
    } catch (error) {
      }
  };

  // Obtenir les IDs récemment portés (derniers 7 jours)
  const getRecentlyWornIds = (history) => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return history
      .filter(item => item.timestamp > sevenDaysAgo)
      .map(item => item.itemId);
  };

  // Obtenir la saison actuelle
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };

  // Catégoriser les vêtements par type
  const categorizeItems = (items) => {
    const categorized = {
      tops: [],
      bottoms: [],
      dresses: [],
      outerwear: [],
      shoes: [],
      accessories: []
    };
    
    items.forEach(item => {
      const category = (item.category || '').toLowerCase();
      const name = (item.name || '').toLowerCase();
      
      // Catégorisation basée sur le type ou le nom
      if (category === ClothingCategory.TOP || 
          name.includes('t-shirt') || name.includes('shirt') || 
          name.includes('top') || name.includes('blouse') ||
          name.includes('chemise') || name.includes('débardeur') ||
          name.includes('crop')) {
        categorized.tops.push(item);
      } else if (category === ClothingCategory.BOTTOM || 
                 name.includes('pantalon') || name.includes('short') || 
                 name.includes('jupe') || name.includes('jean') ||
                 name.includes('legging')) {
        categorized.bottoms.push(item);
      } else if (category === ClothingCategory.DRESS || 
                 name.includes('robe')) {
        categorized.dresses.push(item);
      } else if (category === ClothingCategory.OUTERWEAR || 
                 name.includes('veste') || name.includes('manteau') ||
                 name.includes('blouson') || name.includes('cardigan') ||
                 name.includes('pull')) {
        categorized.outerwear.push(item);
      } else if (category === ClothingCategory.SHOES || 
                 name.includes('chaussure') || name.includes('basket') ||
                 name.includes('sandale') || name.includes('botte')) {
        categorized.shoes.push(item);
      } else if (category === ClothingCategory.ACCESSORY || 
                 name.includes('sac') || name.includes('chapeau') ||
                 name.includes('écharpe') || name.includes('ceinture') ||
                 name.includes('lunette')) {
        categorized.accessories.push(item);
      }
    });
    
    return categorized;
  };

  // Créer une tenue complète
  const createCompleteOutfit = (availableItems, temp, weatherCondition, excludeIds = []) => {
    const categorized = categorizeItems(availableItems);
    const outfit = {
      pieces: [],
      isComplete: false,
      hasLayering: false
    };
    
    // Filtrer les items exclus
    const filterExcluded = (items) => items.filter(item => !excludeIds.includes(item.id));
    
    // 1. Choisir soit une robe, soit haut + bas
    const availableDresses = filterExcluded(categorized.dresses);
    const availableTops = filterExcluded(categorized.tops);
    const availableBottoms = filterExcluded(categorized.bottoms);
    
    if (availableDresses.length > 0 && Math.random() > 0.7) {
      // 30% de chance de choisir une robe
      const dress = availableDresses[Math.floor(Math.random() * availableDresses.length)];
      outfit.pieces.push(dress);
    } else {
      // Sinon, haut + bas
      if (availableTops.length > 0) {
        const top = availableTops[Math.floor(Math.random() * availableTops.length)];
        outfit.pieces.push(top);
      }
      
      if (availableBottoms.length > 0) {
        const bottom = availableBottoms[Math.floor(Math.random() * availableBottoms.length)];
        outfit.pieces.push(bottom);
      }
    }
    
    // 2. Ajouter une couche externe si nécessaire (température < 20°C)
    if (temp < 20) {
      const availableOuterwear = filterExcluded(categorized.outerwear);
      if (availableOuterwear.length > 0) {
        const outerwear = availableOuterwear[Math.floor(Math.random() * availableOuterwear.length)];
        outfit.pieces.push(outerwear);
        outfit.hasLayering = true;
      }
    }
    
    // 3. Ajouter des accessoires (optionnel)
    const availableAccessories = filterExcluded(categorized.accessories);
    if (availableAccessories.length > 0 && Math.random() > 0.5) {
      const accessory = availableAccessories[Math.floor(Math.random() * availableAccessories.length)];
      outfit.pieces.push(accessory);
    }
    
    // Vérifier si la tenue est complète (au moins haut + bas ou robe)
    const hasTop = outfit.pieces.some(p => categorized.tops.includes(p));
    const hasBottom = outfit.pieces.some(p => categorized.bottoms.includes(p));
    const hasDress = outfit.pieces.some(p => categorized.dresses.includes(p));
    
    outfit.isComplete = (hasTop && hasBottom) || hasDress;
    
    return outfit;
  };

  // Obtenir la localisation de l'utilisateur
  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return 'Paris'; // Valeur par défaut
      }

      let location = await Location.getCurrentPositionAsync({});
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const city = reverseGeocode[0].city || reverseGeocode[0].subregion || 'Paris';
        setCity(city);
        return city;
      }
    } catch (error) {
      }
    return 'Paris';
  };

  // Générer des recommandations via l'API
  const generateRecommendations = async () => {
    setLoading(true);
    
    try {
      if (!items || items.length === 0) {
        setRecommendations([]);
        setWeather(null);
        return;
      }

      // Obtenir la ville de l'utilisateur
      const userCity = await getUserLocation();
      const currentSeason = getCurrentSeason();
      
      // Charger l'historique et obtenir les IDs récemment portés
      const history = await loadWearHistory();
      const recentlyWornIds = getRecentlyWornIds(history);
      
      // Charger les dernières recommandations
      const lastRecs = await loadLastRecommendations();
      
      // Préparer les données de la garde-robe pour l'API
      const wardrobeData = items.map(item => ({
        id: item.id,
        name: item.name || '',
        brand: item.brand || '',
        category: item.category || '',
        itemType: item.itemType,
        colors: item.colors || [],
        materials: item.materials || [],
        seasons: item.seasons || [],
        tags: item.tags || [],
        imageUrl: item.imageUrl,
        isFavorite: item.isFavorite || false,
        style: item.style || '',
        description: item.description || ''
      }));

      // Appeler l'API pour obtenir les recommandations
      console.log('Items in wardrobe:', wardrobeData.map(i => ({ id: i.id, name: i.name })));
      console.log('Recently worn IDs:', recentlyWornIds);
      console.log('Last recommended IDs:', lastRecs);
      
      const { data, error } = await dailyRecommendationService.getDailyRecommendations({
        city: userCity,
        wardrobeItems: wardrobeData,
        currentSeason: currentSeason,
        recentlyWornIds: recentlyWornIds,
        lastRecommendedIds: lastRecs,
        forceNewRecommendation: lastRecs.length > 0 // Forcer de nouvelles recommandations si on en a déjà
      });

      if (error) {
        // Fallback sur des recommandations basiques avec variabilité
        setWeather({
          temp: 20,
          condition: 'nuageux',
          description: 'Partiellement nuageux',
          icon: 'partly-sunny',
          humidity: 50,
          wind: 10
        });
        
        // Filtrer les items déjà recommandés et récemment portés
        const availableItems = items.filter(item => 
          !lastRecs.includes(item.id) && 
          !recentlyWornIds.includes(item.id)
        );
        
        // Prendre 3 items aléatoires parmi les disponibles
        const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
        const basicRecs = shuffled.slice(0, 3);
        
        // Si pas assez d'items disponibles, prendre parmi tous les items
        if (basicRecs.length < 3) {
          const allShuffled = [...items].sort(() => 0.5 - Math.random());
          const additionalRecs = allShuffled
            .filter(item => !basicRecs.find(rec => rec.id === item.id))
            .slice(0, 3 - basicRecs.length);
          basicRecs.push(...additionalRecs);
        }
        
        setRecommendations(basicRecs);
        return;
      }

      if (data) {
        // Mettre à jour la météo
        setWeather(data.weather);
        
        // Fonction de validation météo
        const isWeatherAppropriate = (item, temperature, weatherCondition) => {
          const itemName = (item.name || '').toLowerCase();
          const itemCategory = (item.category || '').toLowerCase();
          const materials = (item.materials || []).map(m => m.toLowerCase());
          
          // Si température >= 30°C, rejeter les vêtements chauds
          if (temperature >= 30) {
            const warmClothes = ['pull', 'sweat', 'veste', 'manteau', 'doudoune', 'cardigan épais'];
            const warmMaterials = ['laine', 'cachemire', 'velours', 'polaire'];
            
            for (const warm of warmClothes) {
              if (itemName.includes(warm) || itemCategory.includes(warm)) {
                return false;
              }
            }
            
            for (const material of materials) {
              if (warmMaterials.some(warm => material.includes(warm))) {
                return false;
              }
            }
          }
          
          // Si température 20-29°C, rejeter les vêtements très chauds
          if (temperature >= 20 && temperature < 30) {
            const veryWarmClothes = ['pull épais', 'doudoune', 'manteau', 'parka'];
            for (const warm of veryWarmClothes) {
              if (itemName.includes(warm)) {
                return false;
              }
            }
          }
          
          // Si température < 10°C, rejeter les vêtements trop légers
          if (temperature < 10) {
            const lightClothes = ['short', 'débardeur', 'sandales'];
            for (const light of lightClothes) {
              if (itemName.includes(light) || itemCategory.includes(light)) {
                return false;
              }
            }
          }
          
          // Si pluie, privilégier certains matériaux
          if (weatherCondition && weatherCondition.toLowerCase().includes('pluie')) {
            const waterResistantMaterials = ['imperméable', 'cuir', 'synthétique', 'nylon'];
            const hasWaterResistant = materials.some(mat => 
              waterResistantMaterials.some(wr => mat.includes(wr))
            );
            // Bonus pour les matériaux résistants à l'eau
            if (hasWaterResistant) {
              return 2; // Score plus élevé
            }
          }
          
          return true;
        };
        
        // Traiter les recommandations avec validation
        const processedRecommendations = [];
        const currentTemp = data.weather.temp;
        const weatherCondition = data.weather.condition;
        
        // Filtrer les recommandations déjà vues récemment
        const filteredRecommendations = data.recommendations.filter(rec => {
          // Si on force une nouvelle recommandation et que cet ID était dans les dernières
          if (lastRecs.length > 0 && lastRecs.includes(rec.id)) {
            console.log('Skipping already recommended:', rec.id);
            return false;
          }
          return true;
        });
        
        // Si toutes les recommandations ont été filtrées, prendre la suite de la liste
        const recsToProcess = filteredRecommendations.length > 0 
          ? filteredRecommendations 
          : data.recommendations.slice(1); // Ignorer la première qui était déjà vue
        
        for (const rec of recsToProcess) {
          if (rec.id.startsWith('combo-')) {
            // C'est une combinaison de pièces
            // Extraire les UUIDs du format combo-uuid1-uuid2
            const comboString = rec.id.replace('combo-', '');
            // Regex pour matcher des UUIDs (format: 8-4-4-4-12 caractères hexadécimaux)
            const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
            const ids = comboString.match(uuidRegex) || [];
            
            console.log('Parsing combo:', rec.id, '-> IDs:', ids);
            const pieces = ids.map(id => items.find(item => item.id === id)).filter(Boolean);
            
            // Vérifier que toutes les pièces sont appropriées
            const allAppropriate = pieces.every(piece => isWeatherAppropriate(piece, currentTemp, weatherCondition));
            
            // Vérifier que c'est une tenue complète
            const categorized = categorizeItems(pieces);
            const hasTop = categorized.tops.length > 0;
            const hasBottom = categorized.bottoms.length > 0;
            const hasDress = categorized.dresses.length > 0;
            const isComplete = (hasTop && hasBottom) || hasDress;
            
            if (pieces.length > 0 && allAppropriate && isComplete) {
              processedRecommendations.push({
                id: rec.id,
                name: pieces.length > 2 ? 'Tenue complète' : 'Ensemble recommandé',
                pieces: pieces,
                isMultiplePieces: true,
                score: rec.score,
                reason: rec.reason,
                weatherAdaptation: rec.weather_adaptation,
                styleTips: rec.style_tips
              });
            } else if (pieces.length > 0 && allAppropriate) {
              // Si pas complet, essayer de compléter la tenue
              const missingTop = !hasTop && !hasDress;
              const missingBottom = !hasBottom && !hasDress;
              
              const availableForCompletion = items.filter(item => {
                const appropriate = isWeatherAppropriate(item, currentTemp, weatherCondition);
                const notInCombo = !pieces.find(p => p.id === item.id);
                const notRecentlyWorn = !recentlyWornIds.includes(item.id);
                return appropriate && notInCombo && notRecentlyWorn;
              });
              
              const categorizedAvailable = categorizeItems(availableForCompletion);
              
              // Ajouter les pièces manquantes
              const completedPieces = [...pieces];
              
              if (missingTop && categorizedAvailable.tops.length > 0) {
                const top = categorizedAvailable.tops[Math.floor(Math.random() * categorizedAvailable.tops.length)];
                completedPieces.push(top);
              }
              
              if (missingBottom && categorizedAvailable.bottoms.length > 0) {
                const bottom = categorizedAvailable.bottoms[Math.floor(Math.random() * categorizedAvailable.bottoms.length)];
                completedPieces.push(bottom);
              }
              
              // Créer un nouvel ID pour la tenue complétée
              const newId = `combo-${completedPieces.map(p => p.id).join('-')}`;
              
              processedRecommendations.push({
                id: newId,
                name: 'Tenue complétée',
                pieces: completedPieces,
                isMultiplePieces: true,
                score: rec.score || 85,
                reason: rec.reason || 'Tenue complétée pour un look équilibré.',
                weatherAdaptation: rec.weather_adaptation || `Adaptée pour ${currentTemp}°C`,
                styleTips: `Ensemble de ${completedPieces.length} pièces pour un look complet.`
              });
            }
          } else {
            // C'est un item unique
            const item = items.find(i => i.id === rec.id);
            if (!item) {
              console.warn('Recommended item not found in wardrobe:', rec.id);
            } else if (item && isWeatherAppropriate(item, currentTemp, weatherCondition)) {
              processedRecommendations.push({
                ...item,
                score: rec.score,
                reason: rec.reason,
                weatherAdaptation: rec.weather_adaptation,
                styleTips: rec.style_tips
              });
            }
          }
        }
        
        // Si on a moins de recommandations après filtrage, créer des tenues complètes
        if (processedRecommendations.length === 0 && items.length >= 2) {
          console.log('No valid recommendations from API, creating complete outfits...');
          
          // Filtrer les items appropriés pour la météo et non portés récemment
          const availableItems = items.filter(item => {
            const appropriate = isWeatherAppropriate(item, currentTemp, weatherCondition);
            const notRecentlyWorn = !recentlyWornIds.includes(item.id);
            return appropriate && notRecentlyWorn;
          });
          
          // Créer une tenue complète
          const completeOutfit = createCompleteOutfit(availableItems, currentTemp, weatherCondition, recentlyWornIds);
          
          if (completeOutfit.isComplete && completeOutfit.pieces.length >= 2) {
            const outfitIds = completeOutfit.pieces.map(p => p.id).join('-');
            const outfitNames = completeOutfit.pieces.map(p => p.name).join(' • ');
            
            const combo = {
              id: `combo-${outfitIds}`,
              name: 'Tenue complète',
              pieces: completeOutfit.pieces,
              isMultiplePieces: true,
              score: 90,
              reason: completeOutfit.hasLayering 
                ? 'Tenue complète avec superposition pour un style élaboré.'
                : 'Ensemble coordonné pour un look équilibré et stylé.',
              weatherAdaptation: `Parfaitement adaptée pour ${currentTemp}°C${weatherCondition ? ' et ' + weatherCondition : ''}.`,
              styleTips: completeOutfit.pieces.length > 2
                ? `Tenue de ${completeOutfit.pieces.length} pièces : ${outfitNames}. Un ensemble complet et réfléchi!`
                : 'Association classique et efficace pour la journée.'
            };
            processedRecommendations.push(combo);
          } else if (availableItems.length >= 2) {
            // Fallback si pas de tenue complète possible
            const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
            const combo = {
              id: `combo-${shuffled[0].id}-${shuffled[1].id}`,
              name: 'Ensemble alternatif',
              pieces: [shuffled[0], shuffled[1]],
              isMultiplePieces: true,
              score: 85,
              reason: 'Combinaison créée pour varier votre style.',
              weatherAdaptation: `Adaptée pour ${currentTemp}°C`,
              styleTips: 'N\'hésitez pas à compléter avec d\'autres pièces.'
            };
            processedRecommendations.push(combo);
          }
        }
        
        // Limiter à 1 recommandation pour forcer la variété
        const finalRecommendations = processedRecommendations.slice(0, 1);
        
        // Sauvegarder les IDs des nouvelles recommandations
        const newRecIds = finalRecommendations.map(rec => rec.id);
        await saveLastRecommendations(newRecIds);
        setLastRecommendedIds(newRecIds);
        
        setRecommendations(finalRecommendations);
      }
    } catch (error) {
      setRecommendations([]);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Marquer une tenue comme portée
  const markAsWorn = async (itemId) => {
    const newHistoryItem = {
      itemId: itemId,
      timestamp: Date.now()
    };
    
    let updatedHistory = [...preferenceHistory, newHistoryItem];
    
    // Si c'est une combinaison, marquer aussi les pièces individuelles
    if (itemId.startsWith('combo-')) {
      // Utiliser la même regex que pour le parsing
      const comboString = itemId.replace('combo-', '');
      const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
      const ids = comboString.match(uuidRegex) || [];
      
      for (const id of ids) {
        const pieceHistoryItem = {
          itemId: id,
          timestamp: Date.now()
        };
        updatedHistory.push(pieceHistoryItem);
      }
    }
    
    // Nettoyer l'historique - garder seulement les 30 derniers jours
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    updatedHistory = updatedHistory.filter(item => item.timestamp > thirtyDaysAgo);
    
    setPreferenceHistory(updatedHistory);
    
    // Sauvegarder dans AsyncStorage
    await saveWearHistory(updatedHistory);
  };

  // Rafraîchir les recommandations
  const refreshRecommendations = async () => {
    // Sauvegarder les recommandations actuelles comme "dernières recommandations"
    // pour éviter de les recommander à nouveau
    if (recommendations.length > 0) {
      const currentIds = recommendations.map(rec => rec.id);
      await saveLastRecommendations(currentIds);
      setLastRecommendedIds(currentIds);
    }
    
    generateRecommendations();
  };

  // Générer des recommandations basées sur les besoins utilisateur
  const generateNeedsBasedRecommendation = async (userNeeds) => {
    setLoading(true);
    
    try {
      if (!items || items.length === 0) {
        setRecommendations([]);
        return null;
      }

      // Obtenir la ville de l'utilisateur
      const userCity = await getUserLocation();
      const currentSeason = getCurrentSeason();
      
      // Préparer les données de la garde-robe pour l'API
      const wardrobeData = items.map(item => ({
        id: item.id,
        name: item.name || '',
        brand: item.brand || '',
        category: item.category || '',
        itemType: item.itemType,
        colors: item.colors || [],
        materials: item.materials || [],
        seasons: item.seasons || [],
        tags: item.tags || [],
        imageUrl: item.imageUrl,
        isFavorite: item.isFavorite || false,
        style: item.style || '',
        description: item.description || ''
      }));

      // Charger l'historique et obtenir les IDs récemment portés
      const history = await loadWearHistory();
      const recentlyWornIds = getRecentlyWornIds(history);
      
      // Appeler l'API avec les besoins spécifiques
      const { data, error } = await dailyRecommendationService.getDailyRecommendations({
        city: userCity,
        wardrobeItems: wardrobeData,
        currentSeason: currentSeason,
        userNeeds: userNeeds,
        recentlyWornIds: recentlyWornIds
      });

      if (error) {
        return null;
      }

      if (data && data.recommendations.length > 0) {
        // Mettre à jour la météo
        setWeather(data.weather);
        
        // Traiter la première recommandation
        const rec = data.recommendations[0];
        let bestRecommendation;
        
        if (rec.id.startsWith('combo-')) {
          // C'est une combinaison de pièces
          const ids = rec.id.replace('combo-', '').split('-');
          const pieces = ids.map(id => items.find(item => item.id === id)).filter(Boolean);
          
          if (pieces.length > 0) {
            bestRecommendation = {
              id: rec.id,
              name: 'Tenue recommandée pour vos besoins',
              pieces: pieces,
              isMultiplePieces: true,
              score: rec.score,
              reason: rec.reason,
              weatherAdaptation: rec.weather_adaptation,
              styleTips: rec.style_tips,
              userNeeds: userNeeds
            };
          }
        } else {
          // C'est un item unique
          const item = items.find(i => i.id === rec.id);
          if (item) {
            bestRecommendation = {
              ...item,
              score: rec.score,
              reason: rec.reason,
              weatherAdaptation: rec.weather_adaptation,
              styleTips: rec.style_tips,
              userNeeds: userNeeds
            };
          }
        }
        
        if (bestRecommendation) {
          setRecommendations([bestRecommendation]);
          return bestRecommendation;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!wardrobeLoading && items && items.length > 0) {
      generateRecommendations();
    }
  }, [wardrobeLoading]);

  // Charger l'historique au démarrage
  useEffect(() => {
    if (userId) {
      loadWearHistory();
    }
  }, [userId]);

  return {
    recommendations,
    weather,
    loading: loading || wardrobeLoading,
    markAsWorn,
    refreshRecommendations,
    generateNeedsBasedRecommendation,
  };
};