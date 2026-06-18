/**
 * Hook pour charger les données du rapport diagnostic (sol, climat, matching)
 * et les exposer au FieldReport. Données dynamiques selon lat/lng et cultures.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PLANTS_REQUIREMENTS, AVAILABLE_CROPS } from '@constants/plants';
import { fetchSoilData, fetchClimateData, calculateSuitabilityScore } from '@services/agronomy';
import { loadOfflineReport } from '@services/offlineReportCache';
import type { SoilData } from '@services/agronomy/soilService';
import type { ClimateData } from '@services/agronomy/climateService';
import type { MatchingResult } from '@services/agronomy/matchingEngine';

export interface IdealCropItem {
  key: string;
  name: string;
  result: MatchingResult;
}

export interface DiagnosticReportState {
  soil: SoilData | null;
  climate: ClimateData | null;
  matchingByCrop: Record<string, MatchingResult>;
  /** Top 3 cultures idéales pour la zone (pH, humidité, pluviométrie). */
  idealCrops: IdealCropItem[];
  /** Autres cultures recommandées (classement 4+). */
  otherCrops: IdealCropItem[];
  loading: boolean;
  error: string | null;
  /** Données servies depuis le cache local (hors ligne). */
  fromCache: boolean;
}

export function useDiagnosticReport(
  lat: number | undefined,
  lng: number | undefined,
  crops: string[],
  options?: { parcelId?: string }
): DiagnosticReportState & { refetch: () => Promise<void> } {
  const [soil, setSoil] = useState<SoilData | null>(null);
  const [climate, setClimate] = useState<ClimateData | null>(null);
  const [matchingByCrop, setMatchingByCrop] = useState<Record<string, MatchingResult>>({});
  const [idealCrops, setIdealCrops] = useState<IdealCropItem[]>([]);
  const [otherCrops, setOtherCrops] = useState<IdealCropItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const cacheHydrated = useRef(false);

  const applyCachedReport = useCallback(async (): Promise<boolean> => {
    const parcelId = options?.parcelId;
    if (!parcelId) return false;
    const cached = await loadOfflineReport(parcelId);
    if (!cached?.soil && !cached?.climate) return false;
    setSoil(cached.soil);
    setClimate(cached.climate);
    setMatchingByCrop(cached.matchingByCrop ?? {});
    setIdealCrops(cached.idealCrops ?? []);
    setOtherCrops(cached.otherCrops ?? []);
    setFromCache(true);
    setError(null);
    return true;
  }, [options?.parcelId]);

  const fetch = useCallback(async () => {
    if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [soilData, climateData] = await Promise.all([
        fetchSoilData(lat, lng),
        fetchClimateData(lat, lng),
      ]);
      setSoil(soilData);
      setClimate(climateData);
      setFromCache(false);

      const matching: Record<string, MatchingResult> = {};
      for (const key of crops) {
        const plant = PLANTS_REQUIREMENTS[key];
        if (plant) {
          matching[key] = calculateSuitabilityScore(plant, soilData, climateData);
        }
      }
      setMatchingByCrop(matching);

      const allScores: IdealCropItem[] = [];
      for (const key of AVAILABLE_CROPS) {
        const plant = PLANTS_REQUIREMENTS[key];
        if (plant) {
          const result = calculateSuitabilityScore(plant, soilData, climateData);
          allScores.push({ key, name: plant.name, result });
        }
      }
      allScores.sort((a, b) => b.result.score - a.result.score);
      setIdealCrops(allScores.slice(0, 3));
      setOtherCrops(allScores.slice(3));
    } catch (e) {
      const restored = await applyCachedReport();
      if (!restored) {
        setError(e instanceof Error ? e.message : 'Erreur chargement rapport');
        setSoil(null);
        setClimate(null);
        setMatchingByCrop({});
        setIdealCrops([]);
        setOtherCrops([]);
        setFromCache(false);
      } else {
        setError('Hors ligne — rapport en cache affiché');
      }
    } finally {
      setLoading(false);
    }
  }, [lat, lng, crops.join(','), applyCachedReport]);

  useEffect(() => {
    cacheHydrated.current = false;
  }, [options?.parcelId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cacheHydrated.current || !options?.parcelId) {
        fetch();
        return;
      }
      const ok = await applyCachedReport();
      if (cancelled) return;
      cacheHydrated.current = true;
      if (ok) setLoading(false);
      fetch();
    })();
    return () => {
      cancelled = true;
    };
  }, [fetch, applyCachedReport, options?.parcelId]);

  return {
    soil,
    climate,
    matchingByCrop,
    idealCrops,
    otherCrops,
    loading,
    error,
    fromCache,
    refetch: fetch,
  };
}
