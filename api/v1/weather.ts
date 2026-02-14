/**
 * GET /api/v1/weather?lat=12.63&lng=-7.92
 * Proxy OpenWeather avec cache mémoire (TTL 10 min) — Phase 1
 * Réduit les appels directs depuis l'app et prépare un cache Redis plus tard.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../lib/cors';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min
const cache = new Map<string, { data: unknown; expires: number }>();

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)}_${lng.toFixed(4)}`;
}

async function fetchOpenWeather(lat: number, lng: number): Promise<unknown> {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key || key === 'your_openweather_api_key') {
    return { error: 'OPENWEATHER_API_KEY non configurée', mock: true };
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${key}&units=metric&lang=fr`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OpenWeather ${res.status}`);
  }
  return res.json();
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const latStr = req.query.lat as string | undefined;
  const lngStr = req.query.lng as string | undefined;
  if (!latStr || !lngStr) {
    res.status(400).json({
      error: 'Paramètres invalides',
      message: 'Fournir lat et lng. Ex. ?lat=12.63&lng=-7.92',
    });
    return;
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({ error: 'Coordonnées invalides' });
    return;
  }

  const key = cacheKey(lat, lng);
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expires > now) {
    res.setHeader('X-Cache', 'HIT');
    res.status(200).json(cached.data);
    return;
  }

  try {
    const data = await fetchOpenWeather(lat, lng);
    cache.set(key, { data, expires: now + CACHE_TTL_MS });
    res.setHeader('X-Cache', 'MISS');
    res.status(200).json(data);
  } catch (e) {
    console.error('weather proxy error:', e);
    res.status(502).json({
      error: 'Erreur météo',
      message: e instanceof Error ? e.message : 'Service temporairement indisponible',
    });
  }
}
