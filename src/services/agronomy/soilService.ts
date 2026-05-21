// Service pour récupérer les données de sol.
// Priorité : 1) iSDA via Vercel, 2) iSDA direct (app, si identifiants .env), 3) GEE, 4) SoilGrids REST, 5) défaut.
// Doc : docs/APIS_DONNEES.md, cahier_de_api.md, docs/EARTH_ENGINE_SETUP.md
import { API_URL, ISDA_USERNAME, ISDA_PASSWORD } from 'react-native-dotenv';
import { determineSoilTexture, fetchIsdaSoilAtPoint, normalizeBackendSoilPayload } from './isdasoil';

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

/** Valeurs de secours quand iSDA / GEE / SoilGrids sont indisponibles (une seule source de vérité). */
export const DEFAULT_SOIL: SoilData = {
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

/** True si l’app affiche encore le secours (API sol non joignable ou non déployée). */
export function isDefaultSoilData(soil: SoilData): boolean {
  return (
    soil.ph === DEFAULT_SOIL.ph &&
    soil.texture === DEFAULT_SOIL.texture &&
    soil.clay === DEFAULT_SOIL.clay &&
    soil.sand === DEFAULT_SOIL.sand &&
    soil.silt === DEFAULT_SOIL.silt &&
    soil.organicCarbon === DEFAULT_SOIL.organicCarbon
  );
}

/** Couche SoilGrids : format properties[] ou layers[] */
type SoilGridsLayer = {
  name?: string;
  depth?: string;
  values?: number[] | { mean?: number[] };
};

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

function getApiBaseUrl(): string | null {
  const url = typeof API_URL === 'string' && API_URL && !API_URL.includes('example.com') ? API_URL.trim() : null;
  return url ? url.replace(/\/$/, '') : null;
}

async function fetchSoilFromBackend(path: string, lat: number, lng: number): Promise<SoilData | null> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return null;
  try {
    const url = `${baseUrl}${path}?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeBackendSoilPayload(data);
  } catch (e) {
    console.warn(`${path} (app):`, e);
    return null;
  }
}

/**
 * Récupère les données de sol pour une coordonnée donnée.
 * 1) iSDAsoil via /api/getSoilFromISDA (Vercel)
 * 2) iSDAsoil direct (si ISDA_USERNAME / ISDA_PASSWORD dans .env)
 * 3) Google Earth Engine via /api/getSoilFromGEE
 * 4) SoilGrids REST si rétabli
 * 5) DEFAULT_SOIL
 */
export async function fetchSoilData(lat: number, lng: number): Promise<SoilData> {
  const fromIsdaProxy = await fetchSoilFromBackend('/api/getSoilFromISDA', lat, lng);
  if (fromIsdaProxy) return fromIsdaProxy;

  const isdaUser = typeof ISDA_USERNAME === 'string' ? ISDA_USERNAME.trim() : '';
  const isdaPass = typeof ISDA_PASSWORD === 'string' ? ISDA_PASSWORD.trim() : '';
  if (isdaUser && isdaPass) {
    const fromIsdaDirect = await fetchIsdaSoilAtPoint(lat, lng, isdaUser, isdaPass);
    if (fromIsdaDirect) return fromIsdaDirect;
  }

  const fromGee = await fetchSoilFromBackend('/api/getSoilFromGEE', lat, lng);
  if (fromGee) return fromGee;

  if (SOILGRIDS_REST_AVAILABLE) {
    return fetchSoilFromRest(lat, lng);
  }

  return Promise.resolve(DEFAULT_SOIL);
}

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

export { determineSoilTexture };
