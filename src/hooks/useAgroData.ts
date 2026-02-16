/**
 * Hook : données AgroMonitoring (météo parcelle, optionnellement NDVI).
 * Utilise AGROMONITORING_API_KEY.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  isAgroApiAvailable,
  fetchAgroWeather,
  fetchAgroNdviHistory,
  createAgroPolygonAroundPoint,
  type AgroWeatherData,
  type AgroNdviPoint,
  type AgroPolygon,
} from '@services/agro';

export interface UseAgroDataResult {
  available: boolean;
  weather: AgroWeatherData | null;
  ndvi: AgroNdviPoint[];
  polygon: AgroPolygon | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPolygonForNdvi: (name: string, areaHa?: number) => Promise<AgroPolygon | null>;
}

/**
 * Charge la météo Agro pour (lat, lng). Optionnellement crée un polygone et charge l'historique NDVI.
 */
export function useAgroData(
  lat: number | undefined,
  lng: number | undefined
): UseAgroDataResult {
  const [weather, setWeather] = useState<AgroWeatherData | null>(null);
  const [ndvi, setNdvi] = useState<AgroNdviPoint[]>([]);
  const [polygon, setPolygon] = useState<AgroPolygon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = isAgroApiAvailable();

  const fetch = useCallback(async () => {
    if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng) || !available) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const w = await fetchAgroWeather(lat, lng);
      setWeather(w ?? null);
      if (polygon?.id) {
        const end = Math.floor(Date.now() / 1000);
        const start = end - 90 * 24 * 3600;
        const points = await fetchAgroNdviHistory(polygon.id, start, end);
        setNdvi(points);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur Agro');
    } finally {
      setLoading(false);
    }
  }, [lat, lng, available, polygon?.id]);

  const createPolygonForNdvi = useCallback(
    async (name: string, areaHa: number = 10): Promise<AgroPolygon | null> => {
      if (lat == null || lng == null || !available) return null;
      const p = await createAgroPolygonAroundPoint(lat, lng, name, areaHa);
      if (p) setPolygon(p);
      return p;
    },
    [lat, lng, available]
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    available,
    weather,
    ndvi,
    polygon,
    loading,
    error,
    refetch: fetch,
    createPolygonForNdvi,
  };
}
