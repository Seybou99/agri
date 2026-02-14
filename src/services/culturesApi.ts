/**
 * Client API Cultures Mali — branchement sur /api/v1/cultures, calendar, icons, recommendations.
 * Utilise API_URL (react-native-dotenv). Fallback local si API indisponible.
 */

import { API_URL } from 'react-native-dotenv';

function getBaseUrl(): string | null {
  const url = typeof API_URL === 'string' && API_URL && !API_URL.includes('example.com') ? API_URL.trim() : null;
  return url ? url.replace(/\/$/, '') : null;
}

export interface ApiCulture {
  id: string;
  nom: string;
  categorie: string;
  zones: string[];
  eau_besoin: string;
  rendement_t_ha: { min: number; max: number };
  rentabilite: string;
  icon: string;
  cycle_jours?: number;
  sols_adaptes?: string[];
}

export interface ApiCulturesResponse {
  count: number;
  data: ApiCulture[];
}

export interface ApiCalendarStep {
  phase: string;
  debut: string;
  fin: string;
}

export interface ApiCalendarResponse {
  culture: string;
  culture_id: string;
  saison: string;
  etapes: ApiCalendarStep[];
}

export interface ApiIconItem {
  culture: string;
  culture_id: string;
  icon_name: string;
  emoji: string;
  color: string;
}

export interface ApiRecommendationItem {
  culture: string;
  culture_id: string;
  score: number;
}

export interface ApiRecommendationsResponse {
  cultures_recommandees: ApiRecommendationItem[];
  criteres?: Record<string, unknown>;
}

export interface ApiProfitabilityItem {
  culture_id: string;
  culture: string;
  revenu_ha_min: number;
  revenu_ha_max: number;
  niveau: string;
}

export async function fetchCultures(params?: {
  categorie?: string;
  rentable?: boolean;
  irrigue?: boolean;
}): Promise<ApiCulturesResponse | null> {
  const base = getBaseUrl();
  if (!base) return null;
  try {
    const q = new URLSearchParams();
    if (params?.categorie) q.set('categorie', params.categorie);
    if (params?.rentable !== undefined) q.set('rentable', String(params.rentable));
    if (params?.irrigue !== undefined) q.set('irrigue', String(params.irrigue));
    const url = `${base}/api/v1/cultures${q.toString() ? `?${q.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as ApiCulturesResponse;
  } catch {
    return null;
  }
}

export async function fetchCalendar(cultureId: string): Promise<ApiCalendarResponse | null> {
  const base = getBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/v1/calendar?culture=${encodeURIComponent(cultureId)}`);
    if (!res.ok) return null;
    return (await res.json()) as ApiCalendarResponse;
  } catch {
    return null;
  }
}

export async function fetchIcons(): Promise<ApiIconItem[] | null> {
  const base = getBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/v1/icons`);
    if (!res.ok) return null;
    const json = (await res.json()) as { data: ApiIconItem[] };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchProfitability(): Promise<ApiProfitabilityItem[] | null> {
  const base = getBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/v1/profitability`);
    if (!res.ok) return null;
    const json = (await res.json()) as { data: ApiProfitabilityItem[] };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchRecommendations(body: {
  sol_type?: string;
  pluviometrie_mm?: number;
  irrigation?: boolean;
  region?: string;
}): Promise<ApiRecommendationsResponse | null> {
  const base = getBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/v1/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as ApiRecommendationsResponse;
  } catch {
    return null;
  }
}

export function isCulturesApiAvailable(): boolean {
  return getBaseUrl() !== null;
}
