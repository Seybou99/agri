// Service pour récupérer les données de sol : ISRIC SoilGrids REST ou Google Earth Engine (API Vercel).
// Doc : https://www.isric.org/explore/soilgrids/faq-soilgrids, docs/EARTH_ENGINE_SETUP.md
//
// Ordre de priorité : 1) REST SoilGrids si rétabli, 2) API backend /api/getSoilFromGEE (GEE), 3) DEFAULT_SOIL.
import { API_URL } from 'react-native-dotenv';

const SOILGRIDS_REST_AVAILABLE = false;

export interface SoilData {
  ph: number;
  texture: string;
  organicCarbon: number; // %
  nitrogen: number; // g/kg
  phosphorus: number; // mg/kg
  potassium: number; // cmol/kg
  clay: number; // %
  sand: number; // %
  silt: number; // %
}

const DEFAULT_SOIL: SoilData = {
  ph: 6.5,
  texture: 'limoneux',
  organicCarbon: 1.0,
  nitrogen: 0.5,
  phosphorus: 10,
  potassium: 0.2,
  clay: 20,
  sand: 40,
  silt: 40,
};

/** Couche SoilGrids : format properties[] ou layers[] */
type SoilGridsLayer = {
  name?: string;
  depth?: string;
  values?: number[] | { mean?: number[] };
};

/**
 * Extrait la valeur mean d'une couche (format properties ou layers).
 * - values: number[] → values[0]
 * - values: { mean: number[] } → values.mean[0]
 */
function extractLayerValue(layer: SoilGridsLayer): number | null {
  const v = layer.values;
  if (!v) return null;
  if (Array.isArray(v) && v.length > 0) {
    const n = Number(v[0]);
    return Number.isNaN(n) ? null : n;
  }
  const mean = (v as { mean?: number[] }).mean;
  if (Array.isArray(mean) && mean.length > 0) {
    const n = Number(mean[0]);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

const USER_AGENT = 'SeneGundo/1.0 (agri-mali; +https://github.com)';

/** Base URL de l'API (Vercel) pour appeler /api/getSoilFromGEE — uniquement côté app. */
function getApiBaseUrl(): string | null {
  const url = typeof API_URL === 'string' && API_URL && !API_URL.includes('example.com') ? API_URL.trim() : null;
  return url ? url.replace(/\/$/, '') : null;
}

/**
 * Récupère les données de sol pour une coordonnée donnée.
 * 1) Si SOILGRIDS_REST_AVAILABLE : appelle rest.isric.org.
 * 2) Sinon : appelle l'API backend /api/getSoilFromGEE (Google Earth Engine) si API_URL est configurée.
 * 3) Sinon : retourne DEFAULT_SOIL.
 */
export async function fetchSoilData(lat: number, lng: number): Promise<SoilData> {
  if (SOILGRIDS_REST_AVAILABLE) {
    return fetchSoilFromRest(lat, lng);
  }

  const baseUrl = getApiBaseUrl();
  if (baseUrl) {
    try {
      const url = `${baseUrl}/api/getSoilFromGEE?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.ph === 'number') {
          return {
            ph: data.ph,
            texture: data.texture ?? DEFAULT_SOIL.texture,
            organicCarbon: data.organicCarbon ?? DEFAULT_SOIL.organicCarbon,
            nitrogen: data.nitrogen ?? DEFAULT_SOIL.nitrogen,
            phosphorus: data.phosphorus ?? DEFAULT_SOIL.phosphorus,
            potassium: data.potassium ?? DEFAULT_SOIL.potassium,
            clay: data.clay ?? DEFAULT_SOIL.clay,
            sand: data.sand ?? DEFAULT_SOIL.sand,
            silt: data.silt ?? DEFAULT_SOIL.silt,
          };
        }
      }
    } catch (e) {
      console.warn('getSoilFromGEE (app):', e);
    }
  }

  return Promise.resolve(DEFAULT_SOIL);
}

/** Appel direct REST SoilGrids (quand SOILGRIDS_REST_AVAILABLE = true). */
async function fetchSoilFromRest(lat: number, lng: number): Promise<SoilData> {
  const baseUrl = 'https://rest.isric.org/soilgrids/v2.0/properties/query';
  const properties = ['phh2o', 'clay', 'sand'];
  const params = new URLSearchParams();
  params.set('lon', String(lng));
  params.set('lat', String(lat));
  params.set('depth', '0-5');
  params.set('value', 'mean');
  properties.forEach((p) => params.append('property', p));
  const url = `${baseUrl}?${params.toString()}`;

  const doFetch = async (): Promise<Response> =>
    fetch(url, { headers: { 'User-Agent': USER_AGENT } });

  try {
    let response = await doFetch();
    if (!response.ok && [500, 502, 503].includes(response.status)) {
      await new Promise((r) => setTimeout(r, 5000));
      response = await doFetch();
    }
    if (!response.ok) {
      console.warn(`SoilGrids API ${response.status}: ${response.statusText}`);
      return DEFAULT_SOIL;
    }
    const data = await response.json();
    const layers: SoilGridsLayer[] = Array.isArray(data.properties)
      ? data.properties
      : Array.isArray(data.layers)
        ? data.layers
        : [];
    const values: Record<string, number> = {};
    for (const layer of layers) {
      const rawName = String(layer.name ?? '').toLowerCase();
      const baseName = rawName.replace(/_mean$/, '');
      const val = extractLayerValue(layer);
      if (val != null && !Number.isNaN(val)) values[baseName] = val;
    }
    const clay = (values.clay ?? DEFAULT_SOIL.clay * 10) / 10;
    const sand = (values.sand ?? DEFAULT_SOIL.sand * 10) / 10;
    const silt = Math.max(0, Math.min(100, 100 - clay - sand));
    const texture = determineSoilTexture(sand, clay, silt);
    const phRaw = values.phh2o ?? 0;
    const ph = phRaw > 0 ? phRaw / 10 : DEFAULT_SOIL.ph;
    return {
      ph,
      texture,
      organicCarbon: DEFAULT_SOIL.organicCarbon,
      nitrogen: DEFAULT_SOIL.nitrogen,
      phosphorus: DEFAULT_SOIL.phosphorus,
      potassium: DEFAULT_SOIL.potassium,
      clay,
      sand,
      silt,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données de sol:', error);
    return DEFAULT_SOIL;
  }
}

/**
 * Détermine la texture du sol basée sur les pourcentages de sable, argile et limon
 */
function determineSoilTexture(sand: number, clay: number, silt: number): string {
  // Classification selon le triangle de texture USDA
  if (sand > 70 && clay < 20) {
    return 'sableux';
  }
  if (clay > 40) {
    return 'argileux';
  }
  if (sand > 50 && sand < 70 && clay < 20) {
    return 'limono-sableux';
  }
  if (silt > 50) {
    return 'limoneux';
  }
  return 'limoneux'; // Par défaut
}
