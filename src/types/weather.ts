/**
 * Types TypeScript pour les données météo
 * Basés sur la maquette moderne avec 3 écrans
 */

export interface CurrentWeather {
  temp: number; // Température actuelle en °C
  feelsLike: number; // Température ressentie
  description: string; // Description textuelle (ex: "Mostly Sunny")
  icon: string; // Code icône OpenWeather
  humidity: number; // Humidité en %
  windSpeed: number; // Vitesse du vent en km/h
  visibility: number; // Visibilité en km
  pressure: number; // Pression en hPa
  isMock?: boolean; // Indique si ce sont des données mock
}

export interface HourlyForecast {
  time: string; // Format "09 AM", "10 AM", etc.
  temp: number; // Température en °C
  icon: string; // Code icône OpenWeather
  description: string; // Description textuelle
  isNow?: boolean; // Indique si c'est l'heure actuelle
}

export interface DailyForecast {
  day: string; // "Monday", "Tuesday", etc. ou "Tomorrow"
  date: string; // Date au format ISO
  icon: string; // Code icône OpenWeather
  description: string; // Description textuelle (ex: "Windy", "Storm", "Rainy")
  tempMin: number; // Température minimale
  tempMax: number; // Température maximale
  windSpeed: number; // Vitesse du vent en km/h
  humidity: number; // Humidité en %
  visibility: number; // Visibilité en km
}

export interface AirQuality {
  score: number; // Score de qualité de l'air (ex: 135)
  aqi: number; // Air Quality Index
  mainPollutant: string; // Polluant principal (ex: "O3 (oZone)")
  description: string; // Description (ex: "Air quality is not acceptable...")
  concentration: string; // Concentration (ex: "102.74 µg/m3")
  level: 'good' | 'moderate' | 'unhealthy' | 'unhealthy-sensitive' | 'hazardous';
}

export interface TemperatureDataPoint {
  day: string; // "Sun", "Mon", "Tue", etc.
  date: string; // Date ISO
  temp: number; // Température en °C
  time?: string; // Heure si disponible (pour graphique horaire)
}

export interface PopularCity {
  name: string; // Nom de la ville
  temp: number; // Température actuelle
  icon: string; // Code icône météo
  description: string; // Description météo
  country?: string; // Code pays (optionnel)
}

export interface WeatherLocation {
  name: string; // Nom de la ville
  lat: number; // Latitude
  lng: number; // Longitude
  country?: string; // Code pays
}
