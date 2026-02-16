/**
 * Service AgroMonitoring (OpenWeather Agro API)
 * Surveillance agricole : météo parcelle, polygones, NDVI, données sol.
 * Doc : https://agromonitoring.com/api
 * Clé API : https://home.agromonitoring.com (Clés d'API)
 */

import { AGROMONITORING_API_KEY } from 'react-native-dotenv';

const BASE = 'https://api.agromonitoring.com/agro/1.0';

function getAppId(): string | null {
  const key = typeof AGROMONITORING_API_KEY === 'string' && AGROMONITORING_API_KEY
    ? AGROMONITORING_API_KEY.trim()
    : '';
  if (!key || key === 'your_agromonitoring_api_key') return null;
  return key;
}

export function isAgroApiAvailable(): boolean {
  return getAppId() !== null;
}

// --- Météo parcelle (par coordonnées, sans polygone) ---

export interface AgroWeatherData {
  temp: number;
  feelsLike: number;
  pressure: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  windDeg: number;
  clouds: number;
  dt: number;
}

/**
 * Météo actuelle pour des coordonnées (parcelle).
 * GET /agro/1.0/weather?lat=&lon=&appid=
 * Température en Kelvin dans la réponse ; on convertit en °C.
 */
/** Traduction des descriptions météo Agro (API en anglais) vers français */
const AGRO_WEATHER_DESC_FR: Record<string, string> = {
  'clear sky': 'Ciel dégagé',
  'few clouds': 'Quelques nuages',
  'scattered clouds': 'Nuages épars',
  'broken clouds': 'Nuages fragmentés',
  'overcast clouds': 'Ciel couvert',
  'shower rain': 'Averses',
  'rain': 'Pluie',
  'light rain': 'Pluie légère',
  'moderate rain': 'Pluie modérée',
  'heavy intensity rain': 'Forte pluie',
  'thunderstorm': 'Orage',
  'snow': 'Neige',
  'mist': 'Brume',
  'fog': 'Brouillard',
  'haze': 'Brume sèche',
  'dust': 'Poussière',
  'sand': 'Sable / vent de sable',
  'sand/dust whirls': 'Tourbillons de sable et poussière',
  'volcanic ash': 'Cendres volcaniques',
  'squalls': 'Rafales',
  'tornado': 'Tornade',
  'drizzle': 'Bruine',
};

function translateAgroDescription(description: string): string {
  const key = (description ?? '').toLowerCase().trim();
  return AGRO_WEATHER_DESC_FR[key] || (description ? description.charAt(0).toUpperCase() + description.slice(1) : '');
}

export async function fetchAgroWeather(lat: number, lon: number): Promise<AgroWeatherData | null> {
  const appid = getAppId();
  if (!appid) return null;
  try {
    const params = new URLSearchParams({ lat: String(lat), lon: String(lon), appid });
    const res = await fetch(`${BASE}/weather?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.main || !data?.weather?.[0]) return null;
    const w = data.weather[0];
    const rawDesc = w.description ?? '';
    return {
      temp: Math.round((data.main.temp - 273.15) * 10) / 10,
      feelsLike: Math.round((data.main.feels_like - 273.15) * 10) / 10,
      pressure: data.main.pressure ?? 0,
      humidity: data.main.humidity ?? 0,
      description: translateAgroDescription(rawDesc),
      icon: w.icon ?? '02d',
      windSpeed: data.wind?.speed ?? 0,
      windDeg: data.wind?.deg ?? 0,
      clouds: data.clouds?.all ?? 0,
      dt: data.dt ?? 0,
    };
  } catch {
    return null;
  }
}

// --- Polygones (pour NDVI / images satellite) ---

export interface AgroPolygon {
  id: string;
  name: string;
  center: [number, number];
  area: number;
  geo_json?: { type: string; geometry: { type: string; coordinates: number[][][] } };
}

/**
 * Liste des polygones du compte.
 * GET /agro/1.0/polygons?appid=
 */
export async function fetchAgroPolygons(): Promise<AgroPolygon[]> {
  const appid = getAppId();
  if (!appid) return [];
  try {
    const res = await fetch(`${BASE}/polygons?appid=${encodeURIComponent(appid)}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((p: any) => ({
      id: p.id,
      name: p.name ?? 'Parcelle',
      center: Array.isArray(p.center) ? p.center : [0, 0],
      area: typeof p.area === 'number' ? p.area : 0,
      geo_json: p.geo_json,
    }));
  } catch {
    return [];
  }
}

/**
 * Crée un polygone carré autour d'un point (lat, lon).
 * Taille approximative en hectares (1–3000 ha). On génère un carré ~sqrt(ha)*100 m de côté.
 * GeoJSON : coordinates [lon, lat], premier point = dernier.
 */
export async function createAgroPolygonAroundPoint(
  lat: number,
  lon: number,
  name: string,
  areaHa: number = 10
): Promise<AgroPolygon | null> {
  const appid = getAppId();
  if (!appid) return null;
  const sideM = Math.sqrt(areaHa * 10000);
  const deltaLat = (sideM / 111320) * 0.5;
  const deltaLon = (sideM / (111320 * Math.cos((lat * Math.PI) / 180))) * 0.5;
  const coords: [number, number][] = [
    [lon - deltaLon, lat - deltaLat],
    [lon + deltaLon, lat - deltaLat],
    [lon + deltaLon, lat + deltaLat],
    [lon - deltaLon, lat + deltaLat],
    [lon - deltaLon, lat - deltaLat],
  ];
  const geoJson = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  };
  try {
    const res = await fetch(`${BASE}/polygons?appid=${encodeURIComponent(appid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, geo_json: geoJson }),
    });
    if (!res.ok) return null;
    const p = await res.json();
    return {
      id: p.id,
      name: p.name ?? name,
      center: Array.isArray(p.center) ? p.center : [lat, lon],
      area: typeof p.area === 'number' ? p.area : areaHa,
      geo_json: p.geo_json,
    };
  } catch {
    return null;
  }
}

// --- Historique NDVI (par polygone) ---

export interface AgroNdviPoint {
  dt: number;
  source: string;
  mean: number;
  min: number;
  max: number;
  median: number;
}

/**
 * Historique NDVI pour un polygone (début / fin en timestamp Unix UTC).
 * GET /agro/1.0/ndvi/history?polyid=&start=&end=&appid=
 */
export async function fetchAgroNdviHistory(
  polygonId: string,
  startUnix: number,
  endUnix: number
): Promise<AgroNdviPoint[]> {
  const appid = getAppId();
  if (!appid) return [];
  try {
    const params = new URLSearchParams({
      polyid: polygonId,
      start: String(startUnix),
      end: String(endUnix),
      appid,
    });
    const res = await fetch(`${BASE}/ndvi/history?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((d: any) => ({
      dt: d.dt ?? 0,
      source: d.source ?? 's2',
      mean: d.data?.mean ?? 0,
      min: d.data?.min ?? 0,
      max: d.data?.max ?? 0,
      median: d.data?.median ?? 0,
    })).sort((a, b) => a.dt - b.dt);
  } catch {
    return [];
  }
}
