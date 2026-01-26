// Météo actuelle via OpenWeatherMap API
// https://openweathermap.org/current
// Clé : OPENWEATHER_API_KEY dans .env

export interface OpenWeatherCurrent {
  temp: number; // °C
  feelsLike: number;
  humidity: number; // %
  pressure: number; // hPa
  description: string;
  icon: string;
  windSpeed: number; // m/s
}

const BASE = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Récupère la météo actuelle pour un point (lat, lng).
 * Utilise OPENWEATHER_API_KEY. Si absente ou erreur, retourne null.
 */
export async function fetchCurrentWeather(lat: number, lng: number): Promise<OpenWeatherCurrent | null> {
  try {
    const apiKey = typeof process !== 'undefined' && process.env?.OPENWEATHER_API_KEY
      ? process.env.OPENWEATHER_API_KEY
      : '';
    if (!apiKey || apiKey === 'your_openweather_api_key') {
      return null;
    }
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      appid: apiKey,
      units: 'metric',
      lang: 'fr',
    });
    const res = await fetch(`${BASE}?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    const w = data.weather?.[0];
    return {
      temp: Number(data.main?.temp) || 0,
      feelsLike: Number(data.main?.feels_like) || 0,
      humidity: Number(data.main?.humidity) || 0,
      pressure: Number(data.main?.pressure) || 0,
      description: String(w?.description ?? ''),
      icon: String(w?.icon ?? ''),
      windSpeed: Number(data.wind?.speed) || 0,
    };
  } catch {
    return null;
  }
}
