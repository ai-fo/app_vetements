"""
Service météo pour les recommandations
"""
import httpx
from typing import Dict, Any, Optional

class WeatherService:
    """Service pour récupérer les données météo"""
    
    async def get_weather_data(self, city: str, country_code: str = "FR") -> Optional[Dict[str, Any]]:
        """Récupère les données météo pour une ville donnée"""
        try:
            async with httpx.AsyncClient() as client:
                # D'abord, obtenir les coordonnées de la ville
                geocoding_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=fr"
                geo_response = await client.get(geocoding_url)
                geo_data = geo_response.json()
                
                if not geo_data.get("results"):
                    return None
                
                location = geo_data["results"][0]
                lat = location["latitude"]
                lon = location["longitude"]
                
                # Ensuite, obtenir la météo
                weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Europe/Paris"
                weather_response = await client.get(weather_url)
                weather_data = weather_response.json()
                
                return {
                    "city": location["name"],
                    "country": location["country"],
                    "current": {
                        "temperature": weather_data["current"]["temperature_2m"],
                        "humidity": weather_data["current"]["relative_humidity_2m"],
                        "precipitation": weather_data["current"]["precipitation"],
                        "wind_speed": weather_data["current"]["wind_speed_10m"],
                        "weather_code": weather_data["current"]["weather_code"]
                    },
                    "daily": {
                        "max_temp": weather_data["daily"]["temperature_2m_max"][0],
                        "min_temp": weather_data["daily"]["temperature_2m_min"][0],
                        "precipitation": weather_data["daily"]["precipitation_sum"][0]
                    }
                }
        except Exception as e:
            print(f"Erreur lors de la récupération de la météo: {str(e)}")
            return None