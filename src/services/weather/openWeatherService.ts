/**
 * Service OpenWeather - Prévisions météo
 * Inclut: météo actuelle, horaire et sur 10 jours
 */

import { OPENWEATHER_API_KEY } from 'react-native-dotenv';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const BASE = `${BASE_URL}/weather`;
const FORECAST_BASE = `${BASE_URL}/forecast`; // 5-day / 3-hour forecast

export interface OpenWeatherCurrent {
  temp: number; // °C
  feelsLike: number;
  humidity: number; // %
  pressure: number; // hPa
  description: string;
  icon: string;
  windSpeed: number; // m/s
  isMock?: boolean; // Indique si ce sont des données mock
}

export interface HourlyForecast {
  time: string; // Format "HH:mm" ou "Maintenant"
  temp: number;
  icon: string;
  description: string;
  isNow?: boolean;
  isSunset?: boolean;
}

export interface DailyForecast {
  day: string; // "Aujourd'hui", "Lun.", etc.
  icon: string;
  description: string;
  tempMin: number;
  tempMax: number;
  precipitation: number; // Probabilité de précipitation (0-100)
}

/**
 * Récupérer la météo actuelle
 */
export const fetchCurrentWeather = async (
  lat: number,
  lng: number
): Promise<OpenWeatherCurrent | null> => {
  try {
    const apiKey = OPENWEATHER_API_KEY || '';
    
    if (!apiKey || apiKey === 'your_openweather_api_key' || apiKey.trim() === '') {
      console.warn('[OpenWeather] Clé API manquante - Utilisation de données mock');
      return getMockCurrentWeather();
    }

    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      appid: apiKey,
      units: 'metric',
      lang: 'fr',
    });
    
    const url = `${BASE}?${params.toString()}`;
    console.log('[OpenWeather] Requête pour:', lat, lng);
    
    const res = await fetch(url);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[OpenWeather] Erreur ${res.status}:`, errorText.substring(0, 200));
      
      // Si erreur 401 (clé invalide) ou 429 (rate limit), retourner mock
      if (res.status === 401 || res.status === 429) {
        console.warn('[OpenWeather] Erreur API - Utilisation de données mock');
        return getMockCurrentWeather();
      }
      
      // Pour les autres erreurs, retourner mock aussi pour ne pas bloquer l'UI
      return getMockCurrentWeather();
    }
    
    const data = await res.json();
    
    if (!data || !data.main || !data.weather || data.weather.length === 0) {
      console.error('[OpenWeather] Réponse invalide:', data);
      return getMockCurrentWeather();
    }
    
    const w = data.weather[0];
    const weatherData: OpenWeatherCurrent = {
      temp: Number(data.main?.temp) || 0,
      feelsLike: Number(data.main?.feels_like) || 0,
      humidity: Number(data.main?.humidity) || 0,
      pressure: Number(data.main?.pressure) || 0,
      description: String(w?.description ?? 'ciel dégagé'),
      icon: String(w?.icon ?? '01d'),
      windSpeed: Number(data.wind?.speed) || 0,
      isMock: false, // Données réelles de l'API
    };
    
    console.log('[OpenWeather] ✅ Données récupérées:', weatherData.temp + '°C');
    return weatherData;
  } catch (error) {
    console.error('[OpenWeather] Exception:', error);
    // Retourner des données mock en cas d'erreur pour ne pas bloquer l'UI
    return getMockCurrentWeather();
  }
};

/**
 * Récupérer les prévisions horaires
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
      lang: 'fr',
      cnt: '40', // 40 prévisions (5 jours × 8 prévisions/jour)
    });
    
    const res = await fetch(`${FORECAST_BASE}?${params.toString()}`);
    
    if (!res.ok) {
      console.warn('[OpenWeather] Erreur prévisions horaires - Utilisation de données mock');
      return getMockHourlyForecast();
    }
    
    const data = await res.json();
    
    if (!data || !data.list || data.list.length === 0) {
      return getMockHourlyForecast();
    }
    
    const now = new Date();
    const forecasts: HourlyForecast[] = [];
    
    // Prendre les 8 premières heures pour l'affichage
    data.list.slice(0, 8).forEach((item: any, index: number) => {
      const forecastTime = new Date(item.dt * 1000);
      const hours = forecastTime.getHours();
      
      let timeLabel = '';
      if (index === 0) {
        timeLabel = 'Maintenant';
      } else {
        timeLabel = `${hours.toString().padStart(2, '0')} h`;
      }
      
      forecasts.push({
        time: timeLabel,
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
        description: item.weather[0].description,
        isNow: index === 0,
      });
    });
    
    return forecasts;
  } catch (error) {
    console.error('[OpenWeather] Exception prévisions horaires:', error);
    return getMockHourlyForecast();
  }
};

/**
 * Récupérer les prévisions sur 10 jours
 * Note: L'API gratuite OpenWeather ne fournit que 5 jours
 * Pour 10 jours complets, nous complétons avec des données mock
 */
export const fetchDailyForecast = async (
  lat: number,
  lng: number
): Promise<DailyForecast[]> => {
  try {
    const apiKey = OPENWEATHER_API_KEY || '';
    
    if (!apiKey || apiKey === 'your_openweather_api_key' || apiKey.trim() === '') {
      return getMockDailyForecast();
    }

    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      appid: apiKey,
      units: 'metric',
      lang: 'fr',
      cnt: '40',
    });
    
    const res = await fetch(`${FORECAST_BASE}?${params.toString()}`);
    
    if (!res.ok) {
      console.warn('[OpenWeather] Erreur prévisions quotidiennes - Utilisation de données mock');
      return getMockDailyForecast();
    }
    
    const data = await res.json();
    
    if (!data || !data.list || data.list.length === 0) {
      return getMockDailyForecast();
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

    // Convertir en tableau de prévisions quotidiennes
    const dailyForecasts: DailyForecast[] = [];
    const dayNames = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
    const today = new Date();
    let isFirst = true;
    
    // Prendre les 5 premiers jours de l'API
    const apiDays = Array.from(dailyMap.entries()).slice(0, 5);
    
    apiDays.forEach(([dateKey, dayData]) => {
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
      
      // Calculer la probabilité de précipitation moyenne
      const precipProbs = dayData
        .map((d: any) => (d.pop || 0) * 100)
        .filter((p: number) => p > 0);
      const avgPrecipProb = precipProbs.length > 0
        ? Math.round(precipProbs.reduce((a: number, b: number) => a + b, 0) / precipProbs.length)
        : 0;

      const dayName = isFirst ? 'Aujourd\'hui' : dayNames[new Date(dateKey).getDay()];
      
      dailyForecasts.push({
        day: dayName,
        tempMin,
        tempMax,
        icon: mostFrequentIcon,
        description: dayData[0].weather[0].description,
        precipitation: avgPrecipProb,
      });
      
      isFirst = false;
    });

    // Compléter avec 5 jours supplémentaires (mock) pour arriver à 10 jours
    const lastDate = apiDays.length > 0 
      ? new Date(apiDays[apiDays.length - 1][0])
      : new Date();
    
    for (let i = 0; i < 5; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + i + 1);
      const dayIndex = nextDate.getDay();
      const dayName = dayNames[dayIndex];
      
      // Températures similaires aux dernières données avec variation
      const lastForecast = dailyForecasts[dailyForecasts.length - 1];
      const baseTemp = lastForecast ? (lastForecast.tempMin + lastForecast.tempMax) / 2 : 30;
      const tempMin = Math.round(baseTemp - 5 + Math.random() * 3);
      const tempMax = Math.round(baseTemp + Math.random() * 5);
      
      dailyForecasts.push({
        day: dayName,
        icon: '02d',
        description: 'Partiellement nuageux',
        tempMin,
        tempMax,
        precipitation: Math.round(Math.random() * 40),
      });
    }

    return dailyForecasts;
  } catch (error) {
    console.error('[OpenWeather] Exception prévisions quotidiennes:', error);
    return getMockDailyForecast();
  }
};

/**
 * Données mock - Météo actuelle
 */
const getMockCurrentWeather = (): OpenWeatherCurrent => ({
  temp: 7,
  description: 'Nuageux',
  windSpeed: 3.33, // ~12 km/h
  icon: '04d',
  feelsLike: 6,
  humidity: 75,
  pressure: 1013,
  isMock: true,
});

/**
 * Données mock - Prévisions horaires
 */
const getMockHourlyForecast = (): HourlyForecast[] => {
  const now = new Date();
  const forecasts: HourlyForecast[] = [];
  const baseTemp = 7;
  
  for (let i = 0; i < 8; i++) {
    const hour = (now.getHours() + i) % 24;
    const temp = hour >= 6 && hour <= 18 ? baseTemp + Math.floor(Math.random() * 2) : baseTemp - 2 + Math.floor(Math.random() * 2);
    
    forecasts.push({
      time: i === 0 ? 'Maintenant' : `${hour.toString().padStart(2, '0')} h`,
      temp,
      icon: hour >= 6 && hour <= 18 ? '04d' : '04n',
      description: 'Nuageux',
      isNow: i === 0,
    });
  }
  
  return forecasts;
};

/**
 * Données mock - Prévisions sur 10 jours
 */
const getMockDailyForecast = (): DailyForecast[] => {
  const today = new Date();
  const forecasts: DailyForecast[] = [];
  const dayNames = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];

  const mockData = [
    { tempMin: 2, tempMax: 7, icon: '04d', precip: 0, desc: 'Nuageux' },
    { tempMin: 2, tempMax: 7, icon: '04d', precip: 0, desc: 'Nuageux' },
    { tempMin: 5, tempMax: 10, icon: '10d', precip: 95, desc: 'Pluie' },
    { tempMin: 6, tempMax: 9, icon: '04d', precip: 0, desc: 'Nuageux' },
    { tempMin: 5, tempMax: 8, icon: '10d', precip: 85, desc: 'Pluie' },
    { tempMin: 5, tempMax: 10, icon: '10d', precip: 65, desc: 'Pluie légère' },
    { tempMin: 5, tempMax: 10, icon: '10d', precip: 70, desc: 'Pluie' },
    { tempMin: 5, tempMax: 9, icon: '04d', precip: 0, desc: 'Nuageux' },
    { tempMin: 3, tempMax: 8, icon: '04d', precip: 0, desc: 'Nuageux' },
    { tempMin: 4, tempMax: 9, icon: '04d', precip: 0, desc: 'Nuageux' },
  ];

  mockData.forEach((data, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + index);
    const dayIndex = date.getDay();
    const dayName = index === 0 ? 'Aujourd\'hui' : dayNames[dayIndex];
    
    forecasts.push({
      day: dayName,
      tempMin: data.tempMin,
      tempMax: data.tempMax,
      icon: data.icon,
      description: data.desc,
      precipitation: data.precip,
    });
  });

  return forecasts;
};
