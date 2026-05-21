/**
 * iSDAsoil — types, mapping et appels API (app + Vercel).
 * Doc : cahier_de_api.md, https://api.isda-africa.com/isdasoil/v2/
 */

const ISDA_BASE = 'https://api.isda-africa.com';
const ISDA_LOGIN_URL = `${ISDA_BASE}/login`;
const ISDA_SOIL_URL = `${ISDA_BASE}/isdasoil/v2/soilproperty`;

/** JWT iSDA valide 60 min — on renouvelle à 55 min pour marge de sécurité. */
const ISDA_TOKEN_TTL_MS = 55 * 60 * 1000;

let cachedAccessToken: string | null = null;
let cachedTokenExpiry = 0;
let cachedCredentialsKey = '';

/** Unités officielles (GET /isdasoil/v2/layers) — valeurs numériques passées telles quelles dans SoilData. */
const ISDA_EXPECTED_UNITS: Partial<Record<string, string>> = {
  nitrogen_total: 'g/kg',
  carbon_organic: 'g/kg',
  carbon_total: 'g/kg',
  clay_content: '%',
  sand_content: '%',
  silt_content: '%',
  phosphorous_extractable: 'ppm',
  potassium_extractable: 'ppm',
};

/** Noms des propriétés iSDAsoil v2 (query `property` ou clés dans la réponse). */
export const ISDA_PROPERTY_KEYS = {
  ph: 'ph',
  clay: 'clay_content',
  sand: 'sand_content',
  silt: 'silt_content',
  nitrogen: 'nitrogen_total',
  organicCarbon: 'carbon_organic',
  phosphorus: 'phosphorous_extractable',
  potassium: 'potassium_extractable',
  textureClass: 'texture_class',
} as const;

export interface IsdaSoilValue {
  unit?: string | null;
  type?: string;
  value?: number | string | null;
}

export interface IsdaSoilPropertyEntry {
  value?: IsdaSoilValue;
  depth?: { value?: string | null; unit?: string | null };
}

export interface IsdaSoilApiResponse {
  property?: Record<string, IsdaSoilPropertyEntry[]>;
}

/** Forme alignée sur `SoilData` (soilService). */
export interface SoilDataPayload {
  ph: number;
  texture: string;
  organicCarbon: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  clay: number;
  sand: number;
  silt: number;
}

const DEFAULT_SOIL: SoilDataPayload = {
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

/** Extrait la première valeur numérique d'une propriété iSDA (sans conversion d'unité). */
export function getIsdaPropertyValue(data: IsdaSoilApiResponse, propertyKey: string): number | null {
  const entries = data.property?.[propertyKey];
  if (!Array.isArray(entries) || entries.length === 0) return null;

  const entry = entries[0];
  const expectedUnit = ISDA_EXPECTED_UNITS[propertyKey];
  const apiUnit = entry?.value?.unit?.trim() || null;
  if (expectedUnit && apiUnit && apiUnit !== expectedUnit) {
    console.warn(
      `iSDA ${propertyKey}: unité API "${apiUnit}" ≠ attendue "${expectedUnit}" — valeur conservée telle quelle`
    );
  }

  const raw = entry?.value?.value;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isNaN(n) ? null : n;
}

function invalidateIsdaToken(): void {
  cachedAccessToken = null;
  cachedTokenExpiry = 0;
}

/** Classification texture USDA (partagée app + backend). */
export function determineSoilTexture(sand: number, clay: number, silt: number): string {
  if (sand > 70 && clay < 20) return 'sableux';
  if (clay > 40) return 'argileux';
  if (sand > 50 && sand < 70 && clay < 20) return 'limono-sableux';
  if (silt > 50) return 'limoneux';
  return 'limoneux';
}

/** Convertit la réponse iSDAsoil (ou JSON backend identique) en SoilData. */
export function mapIsdaResponseToSoilData(data: IsdaSoilApiResponse): SoilDataPayload {
  const K = ISDA_PROPERTY_KEYS;
  const clay = getIsdaPropertyValue(data, K.clay) ?? DEFAULT_SOIL.clay;
  const sand = getIsdaPropertyValue(data, K.sand) ?? DEFAULT_SOIL.sand;
  let silt = getIsdaPropertyValue(data, K.silt);
  if (silt == null) {
    silt = Math.max(0, Math.min(100, 100 - clay - sand));
  }
  return {
    ph: getIsdaPropertyValue(data, K.ph) ?? DEFAULT_SOIL.ph,
    clay,
    sand,
    silt,
    // carbon_organic : g/kg (iSDA) → SoilData.organicCarbon (g/kg)
    organicCarbon: getIsdaPropertyValue(data, K.organicCarbon) ?? DEFAULT_SOIL.organicCarbon,
    // nitrogen_total : g/kg (iSDA) → SoilData.nitrogen (g/kg), pas de division comme GEE/SoilGrids
    nitrogen: getIsdaPropertyValue(data, K.nitrogen) ?? DEFAULT_SOIL.nitrogen,
    phosphorus: getIsdaPropertyValue(data, K.phosphorus) ?? DEFAULT_SOIL.phosphorus,
    potassium: getIsdaPropertyValue(data, K.potassium) ?? DEFAULT_SOIL.potassium,
    texture: determineSoilTexture(sand, clay, silt),
  };
}

/**
 * JWT en cache module (Vercel : réutilisé entre requêtes sur la même instance chaude).
 * Avant chaque soilproperty : token valide ou nouveau login.
 */
async function getIsdaAccessToken(username: string, password: string, forceRefresh = false): Promise<string> {
  const credKey = `${username}::${password.length}`;
  if (
    !forceRefresh &&
    cachedAccessToken &&
    Date.now() < cachedTokenExpiry &&
    cachedCredentialsKey === credKey
  ) {
    return cachedAccessToken;
  }

  const body = new URLSearchParams({
    grant_type: 'password',
    username,
    password,
  });

  const res = await fetch(ISDA_LOGIN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`iSDA login ${res.status}`);
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error('iSDA login : access_token manquant');
  }

  cachedAccessToken = data.access_token;
  cachedTokenExpiry = Date.now() + ISDA_TOKEN_TTL_MS;
  cachedCredentialsKey = credKey;
  return cachedAccessToken;
}

async function fetchIsdaSoilProperty(
  lat: number,
  lng: number,
  token: string
): Promise<{ ok: boolean; status: number; data: IsdaSoilApiResponse | null }> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    depth: '0-20',
  });
  const res = await fetch(`${ISDA_SOIL_URL}?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    return { ok: false, status: res.status, data: null };
  }
  const data = (await res.json()) as IsdaSoilApiResponse;
  return { ok: true, status: res.status, data };
}

/**
 * Appel direct iSDAsoil pour un point (lat, lng). Utilisé par l’app si le proxy Vercel est absent.
 */
export async function fetchIsdaSoilAtPoint(
  lat: number,
  lng: number,
  username: string,
  password: string
): Promise<SoilDataPayload | null> {
  const user = username.trim();
  try {
    let token = await getIsdaAccessToken(user, password);
    let result = await fetchIsdaSoilProperty(lat, lng, token);

    // Token expiré côté serveur iSDA : invalider le cache et réessayer une fois
    if (!result.ok && result.status === 401) {
      invalidateIsdaToken();
      token = await getIsdaAccessToken(user, password, true);
      result = await fetchIsdaSoilProperty(lat, lng, token);
    }

    if (!result.ok) {
      console.warn(`iSDA soilproperty ${result.status}`);
      return null;
    }
    const data = result.data;
    if (!data?.property || Object.keys(data.property).length === 0) {
      return null;
    }
    return mapIsdaResponseToSoilData(data);
  } catch (e) {
    console.warn('fetchIsdaSoilAtPoint:', e);
    return null;
  }
}

/** Parse la réponse JSON du proxy Vercel (/api/getSoilFromISDA ou /api/getSoilFromGEE). */
export function normalizeBackendSoilPayload(data: unknown): SoilDataPayload | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  if (typeof o.ph !== 'number') return null;
  const clay = typeof o.clay === 'number' ? o.clay : DEFAULT_SOIL.clay;
  const sand = typeof o.sand === 'number' ? o.sand : DEFAULT_SOIL.sand;
  const silt = typeof o.silt === 'number' ? o.silt : Math.max(0, Math.min(100, 100 - clay - sand));
  return {
    ph: o.ph,
    texture: typeof o.texture === 'string' ? o.texture : determineSoilTexture(sand, clay, silt),
    organicCarbon: typeof o.organicCarbon === 'number' ? o.organicCarbon : DEFAULT_SOIL.organicCarbon,
    nitrogen: typeof o.nitrogen === 'number' ? o.nitrogen : DEFAULT_SOIL.nitrogen,
    phosphorus: typeof o.phosphorus === 'number' ? o.phosphorus : DEFAULT_SOIL.phosphorus,
    potassium: typeof o.potassium === 'number' ? o.potassium : DEFAULT_SOIL.potassium,
    clay,
    sand,
    silt,
  };
}
