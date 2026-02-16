/**
 * Service météo complet pour les 3 écrans (Today, Next 7 Days, Forecast)
 * Basé sur OpenWeatherMap API avec support Air Quality
 */

import { OPENWEATHER_API_KEY } from 'react-native-dotenv';
import type {
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  AirQuality,
  TemperatureDataPoint,
  PopularCity,
} from '../../types/weather';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const WEATHER_BASE = `${BASE_URL}/weather`;
const FORECAST_BASE = `${BASE_URL}/forecast`;
const AIR_QUALITY_BASE = `${BASE_URL}/air_pollution`;

/** Formater l'heure en format 24h (ex. "09 h", "14 h"). */
const formatHour = (date: Date): string => {
  const hours = date.getHours();
  return `${hours.toString().padStart(2, '0')} h`;
};

/**
 * Obtenir le nom du jour en français
 */
const getDayName = (date: Date, isTomorrow: boolean = false): string => {
  if (isTomorrow) return 'Demain';
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[date.getDay()];
};

/**
 * Obtenir l'abréviation du jour en français (Dim, Lun, etc.)
 */
const getDayAbbr = (date: Date): string => {
  const abbrs = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return abbrs[date.getDay()];
};

/**
 * Traduire les descriptions météo en français
 */
const translateWeatherDescription = (description: string): string => {
  const translations: { [key: string]: string } = {
    'clear sky': 'Ciel dégagé',
    'few clouds': 'Quelques nuages',
    'scattered clouds': 'Nuages épars',
    'broken clouds': 'Nuages fragmentés',
    'overcast clouds': 'Ciel couvert',
    'shower rain': 'Averses',
    'rain': 'Pluie',
    'light rain': 'Pluie légère',
    'moderate rain': 'Pluie modérée',
    'heavy rain': 'Forte pluie',
    'thunderstorm': 'Orage',
    'snow': 'Neige',
    'light snow': 'Neige légère',
    'mist': 'Brume',
    'fog': 'Brouillard',
    'haze': 'Brume sèche',
    'dust': 'Poussière',
    'sand': 'Sable',
    'tornado': 'Tornade',
    'squalls': 'Rafales',
    'drizzle': 'Bruine',
    'mostly sunny': 'Principalement ensoleillé',
    'partly cloudy': 'Partiellement nuageux',
    'cloudy': 'Nuageux',
    'sunny': 'Ensoleillé',
    'windy': 'Venteux',
    'storm': 'Tempête',
    'rainy': 'Pluvieux',
    'rainy - cloudy': 'Pluvieux - Nuageux',
  };
  
  const lowerDesc = description.toLowerCase();
  return translations[lowerDesc] || description.charAt(0).toUpperCase() + description.slice(1);
};

/**
 * Récupérer la météo actuelle avec visibilité
 */
export const fetchCurrentWeather = async (
  lat: number,
  lng: number
): Promise<CurrentWeather | null> => {
  try {
    const apiKey = OPENWEATHER_API_KEY || '';
    
    if (!apiKey || apiKey === 'your_openweather_api_key' || apiKey.trim() === '') {
      return getMockCurrentWeather();
    }

    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      appid: apiKey,
      units: 'metric',
      lang: 'en', // Anglais pour correspondre à la maquette
    });
    
    const res = await fetch(`${WEATHER_BASE}?${params.toString()}`);
    
    if (!res.ok) {
      console.warn('[Weather] Erreur API - Utilisation de données mock');
      return getMockCurrentWeather();
    }
    
    const data = await res.json();
    
    if (!data || !data.main || !data.weather || data.weather.length === 0) {
      return getMockCurrentWeather();
    }
    
    const w = data.weather[0];
    const visibility = data.visibility ? (data.visibility / 1000).toFixed(1) : 10; // Convertir m en km
    
    return {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: translateWeatherDescription(w.description),
      icon: w.icon,
      humidity: data.main.humidity,
      windSpeed: Math.round((data.wind?.speed || 0) * 3.6), // Convertir m/s en km/h
      visibility: Number(visibility),
      pressure: data.main.pressure,
      isMock: false,
    };
  } catch (error) {
    console.error('[Weather] Exception:', error);
    return getMockCurrentWeather();
  }
};

/**
 * Récupérer les prévisions horaires formatées pour "Today"
 */
export const fetchHourlyForecast = async (
  lat: number,
  lng: number
): Promise<HourlyForecast[]> => {
  try {
    const apiKey = OPENWEATHER_API_KEY || '';
    
    if (!apiKey || apiKey === 'your_openweather_api_key' || apiKey.trim() === '') {
      return getMockHourlyForecast();
    }

    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      appid: apiKey,
      units: 'metric',
      lang: 'en',
      cnt: '24', // 24 prévisions (24 heures)
    });
    
    const res = await fetch(`${FORECAST_BASE}?${params.toString()}`);
    
    if (!res.ok) {
      return getMockHourlyForecast();
    }
    
    const data = await res.json();
    
    if (!data || !data.list || data.list.length === 0) {
      return getMockHourlyForecast();
    }
    
    const now = new Date();
    const forecasts: HourlyForecast[] = [];
    
    // Prendre les 12 prochaines heures
    data.list.slice(0, 12).forEach((item: any, index: number) => {
      const forecastTime = new Date(item.dt * 1000);
      const isNow = index === 0 && forecastTime.getHours() === now.getHours();
      
      forecasts.push({
        time: isNow ? 'Maint.' : formatHour(forecastTime),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
        description: translateWeatherDescription(item.weather[0].description),
        isNow,
      });
    });
    
    return forecasts;
  } catch (error) {
    console.error('[Weather] Exception prévisions horaires:', error);
    return getMockHourlyForecast();
  }
};

/**
 * Récupérer les prévisions sur 7 jours
 */
export const fetch7DayForecast = async (
  lat: number,
  lng: number
): Promise<DailyForecast[]> => {
  try {
    const apiKey = OPENWEATHER_API_KEY || '';
    
    if (!apiKey || apiKey === 'your_openweather_api_key' || apiKey.trim() === '') {
      return getMock7DayForecast();
    }

    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      appid: apiKey,
      units: 'metric',
      lang: 'en',
      cnt: '40',
    });
    
    const res = await fetch(`${FORECAST_BASE}?${params.toString()}`);
    
    if (!res.ok) {
      return getMock7DayForecast();
    }
    
    const data = await res.json();
    
    if (!data || !data.list || data.list.length === 0) {
      return getMock7DayForecast();
    }
    
    // Grouper par jour
    const dailyMap = new Map<string, any[]>();
    
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, []);
      }
      dailyMap.get(dateKey)!.push(item);
    });

    const forecasts: DailyForecast[] = [];
    const today = new Date();
    let isFirst = true;
    
    // Prendre les 7 prochains jours
    const entries = Array.from(dailyMap.entries()).slice(0, 7);
    
    entries.forEach(([dateKey, dayData]) => {
      const date = new Date(dateKey);
      const temps = dayData.map((d: any) => d.main.temp);
      const tempMin = Math.round(Math.min(...temps));
      const tempMax = Math.round(Math.max(...temps));
      
      // Prendre l'icône la plus fréquente
      const iconCounts = dayData.reduce((acc: any, d: any) => {
        const icon = d.weather[0].icon;
        acc[icon] = (acc[icon] || 0) + 1;
        return acc;
      }, {});
      
      const mostFrequentIcon = Object.keys(iconCounts).reduce((a, b) =>
        iconCounts[a] > iconCounts[b] ? a : b
      );
      
      // Calculer les moyennes pour vent, humidité, visibilité
      const avgWindSpeed = Math.round(
        dayData.reduce((sum: number, d: any) => sum + (d.wind?.speed || 0) * 3.6, 0) / dayData.length
      );
      const avgHumidity = Math.round(
        dayData.reduce((sum: number, d: any) => sum + (d.main?.humidity || 0), 0) / dayData.length
      );
      const avgVisibility = dayData[0].visibility 
        ? Number(((dayData[0].visibility / 1000).toFixed(1)))
        : 10;
      
      const dayName = isFirst ? 'Demain' : getDayName(date);
      
      forecasts.push({
        day: dayName,
        date: dateKey,
        icon: mostFrequentIcon,
        description: translateWeatherDescription(dayData[0].weather[0].description),
        tempMin,
        tempMax,
        windSpeed: avgWindSpeed,
        humidity: avgHumidity,
        visibility: avgVisibility,
      });
      
      isFirst = false;
    });
    
    return forecasts;
  } catch (error) {
    console.error('[Weather] Exception prévisions 7 jours:', error);
    return getMock7DayForecast();
  }
};

/**
 * Récupérer la qualité de l'air
 */
export const fetchAirQuality = async (
  lat: number,
  lng: number
): Promise<AirQuality | null> => {
  try {
    const apiKey = OPENWEATHER_API_KEY || '';
    
    if (!apiKey || apiKey === 'your_openweather_api_key' || apiKey.trim() === '') {
      return getMockAirQuality();
    }

    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      appid: apiKey,
    });
    
    const res = await fetch(`${AIR_QUALITY_BASE}?${params.toString()}`);
    
    if (!res.ok) {
      return getMockAirQuality();
    }
    
    const data = await res.json();
    
    if (!data || !data.list || data.list.length === 0) {
      return getMockAirQuality();
    }
    
    const aq = data.list[0];
    const aqi = aq.main?.aqi || 1;
    const components = aq.components || {};
    
    // Déterminer le polluant principal (celui avec la plus haute concentration)
    const pollutants = [
      { name: 'CO', value: components.co },
      { name: 'NO2', value: components.no2 },
      { name: 'O3', value: components.o3 },
      { name: 'PM2.5', value: components.pm2_5 },
      { name: 'PM10', value: components.pm10 },
      { name: 'SO2', value: components.so2 },
    ];
    
    const mainPollutant = pollutants.reduce((max, p) => 
      (p.value || 0) > (max.value || 0) ? p : max
    );
    
    // Calculer le score (basé sur AQI)
    const score = Math.round(mainPollutant.value || 135);
    
    // Déterminer le niveau
    let level: AirQuality['level'] = 'good';
    let description = 'La qualité de l\'air est bonne';
    if (aqi >= 4) {
      level = 'unhealthy-sensitive';
      description = 'La qualité de l\'air n\'est pas acceptable pour les personnes sensibles';
    } else if (aqi >= 3) {
      level = 'moderate';
      description = 'La qualité de l\'air est modérée';
    }
    
    return {
      score,
      aqi,
      mainPollutant: mainPollutant.name === 'O3' ? 'O3 (oZone)' : mainPollutant.name,
      description,
      concentration: `${(mainPollutant.value || 0).toFixed(2)} µg/m3`,
      level,
    };
  } catch (error) {
    console.error('[Weather] Exception qualité de l\'air:', error);
    return getMockAirQuality();
  }
};

/**
 * Récupérer les données pour le graphique de température
 */
export const fetchTemperatureChartData = async (
  lat: number,
  lng: number
): Promise<TemperatureDataPoint[]> => {
  try {
    const apiKey = OPENWEATHER_API_KEY || '';
    
    if (!apiKey || apiKey === 'your_openweather_api_key' || apiKey.trim() === '') {
      return getMockTemperatureChartData();
    }

    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      appid: apiKey,
      units: 'metric',
      cnt: '40',
    });
    
    const res = await fetch(`${FORECAST_BASE}?${params.toString()}`);
    
    if (!res.ok) {
      return getMockTemperatureChartData();
    }
    
    const data = await res.json();
    
    if (!data || !data.list || data.list.length === 0) {
      return getMockTemperatureChartData();
    }
    
    // Grouper par jour et prendre la température maximale de chaque jour
    const dailyMap = new Map<string, any[]>();
    
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, []);
      }
      dailyMap.get(dateKey)!.push(item);
    });

    const points: TemperatureDataPoint[] = [];
    const entries = Array.from(dailyMap.entries()).slice(0, 7);
    
    entries.forEach(([dateKey, dayData]) => {
      const date = new Date(dateKey);
      const temps = dayData.map((d: any) => d.main.temp);
      const maxTemp = Math.round(Math.max(...temps));
      
      points.push({
        day: getDayAbbr(date),
        date: dateKey,
        temp: maxTemp,
      });
    });
    
    return points;
  } catch (error) {
    console.error('[Weather] Exception graphique température:', error);
    return getMockTemperatureChartData();
  }
};

/**
 * Récupérer les villes populaires
 */
export const fetchPopularCities = async (): Promise<PopularCity[]> => {
  // Villes populaires prédéfinies
  const cities = [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'California', lat: 34.0522, lng: -118.2437 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  ];
  
  try {
    const promises = cities.map(async (city) => {
      const weather = await fetchCurrentWeather(city.lat, city.lng);
      if (!weather) return null;
      
      return {
        name: city.name,
        temp: weather.temp,
        icon: weather.icon,
        description: weather.description,
      };
    });
    
    const results = await Promise.all(promises);
    return results.filter((city): city is PopularCity => city !== null);
  } catch (error) {
    console.error('[Weather] Exception villes populaires:', error);
    return getMockPopularCities();
  }
};

// ==================== DONNÉES MOCK ====================

const getMockCurrentWeather = (): CurrentWeather => ({
  temp: 24,
  feelsLike: 25,
  description: 'Principalement ensoleillé',
  icon: '02d',
  humidity: 25,
  windSpeed: 9,
  visibility: 1.7,
  pressure: 1013,
  isMock: true,
});

const getMockHourlyForecast = (): HourlyForecast[] => {
  const forecasts: HourlyForecast[] = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
    forecasts.push({
      time: i === 0 ? 'Maint.' : formatHour(hour),
      temp: 23 + Math.floor(Math.random() * 3),
      icon: i < 3 ? '02d' : '04d',
      description: i < 3 ? 'Principalement ensoleillé' : 'Nuageux',
      isNow: i === 0,
    });
  }
  
  return forecasts;
};

const getMock7DayForecast = (): DailyForecast[] => {
  const forecasts: DailyForecast[] = [];
  const today = new Date();
  
  const mockData = [
    { desc: 'Pluvieux - Nuageux', icon: '10d', tempMin: 17, tempMax: 24, wind: 7, humidity: 28, visibility: 1.4 },
    { desc: 'Venteux', icon: '50d', tempMin: 18, tempMax: 23, wind: 12, humidity: 30, visibility: 2.0 },
    { desc: 'Orageux', icon: '11d', tempMin: 15, tempMax: 18, wind: 15, humidity: 35, visibility: 1.2 },
    { desc: 'Pluvieux', icon: '10d', tempMin: 16, tempMax: 20, wind: 10, humidity: 32, visibility: 1.5 },
    { desc: 'Ensoleillé', icon: '01d', tempMin: 20, tempMax: 26, wind: 8, humidity: 25, visibility: 2.5 },
    { desc: 'Nuageux', icon: '04d', tempMin: 19, tempMax: 24, wind: 9, humidity: 27, visibility: 2.0 },
    { desc: 'Neigeux', icon: '13d', tempMin: 5, tempMax: 10, wind: 6, humidity: 40, visibility: 1.0 },
  ];
  
  mockData.forEach((data, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + index + 1);
    
    forecasts.push({
      day: index === 0 ? 'Demain' : getDayName(date),
      date: date.toISOString().split('T')[0],
      icon: data.icon,
      description: data.desc,
      tempMin: data.tempMin,
      tempMax: data.tempMax,
      windSpeed: data.wind,
      humidity: data.humidity,
      visibility: data.visibility,
    });
  });
  
  return forecasts;
};

const getMockAirQuality = (): AirQuality => ({
  score: 135,
  aqi: 4,
  mainPollutant: 'O3 (Ozone)',
  description: 'La qualité de l\'air n\'est pas acceptable pour les personnes sensibles',
  concentration: '102.74 µg/m3',
  level: 'unhealthy-sensitive',
});

const getMockTemperatureChartData = (): TemperatureDataPoint[] => {
  const points: TemperatureDataPoint[] = [];
  const today = new Date();
  
  const temps = [24, 23, 18, 20, 26, 24, 10];
  
  temps.forEach((temp, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + index);
    
    points.push({
      day: getDayAbbr(date),
      date: date.toISOString().split('T')[0],
      temp,
    });
  });
  
  return points;
};

const getMockPopularCities = (): PopularCity[] => [
  { name: 'Bamako', temp: 32, icon: '01d', description: 'Ensoleillé' },
  { name: 'Dakar', temp: 28, icon: '02d', description: 'Partiellement nuageux' },
  { name: 'Abidjan', temp: 30, icon: '10d', description: 'Pluvieux' },
  { name: 'Ouagadougou', temp: 35, icon: '01d', description: 'Ensoleillé' },
  { name: 'Conakry', temp: 29, icon: '04d', description: 'Nuageux' },
];
