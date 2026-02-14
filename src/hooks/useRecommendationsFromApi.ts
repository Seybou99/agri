/**
 * Récupère les recommandations de cultures depuis l'API (sol, pluviométrie, région).
 */

import { useState, useEffect } from 'react';
import { fetchRecommendations, isCulturesApiAvailable } from '@services/culturesApi';

export interface RecommendationRow {
  culture: string;
  culture_id: string;
  score: number;
}

export function useRecommendationsFromApi(opts: {
  solType?: string;
  pluviometrieMm?: number;
  region?: string;
  irrigation?: boolean;
}): { recommendations: RecommendationRow[]; loading: boolean } {
  const [recommendations, setRecommendations] = useState<RecommendationRow[]>([]);
  const [loading, setLoading] = useState(false);

  const hasInput = opts.pluviometrieMm != null || opts.solType || opts.region;

  useEffect(() => {
    if (!isCulturesApiAvailable() || !hasInput) {
      setRecommendations([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchRecommendations({
      sol_type: opts.solType,
      pluviometrie_mm: opts.pluviometrieMm,
      region: opts.region,
      irrigation: opts.irrigation,
    })
      .then((res) => {
        if (cancelled) return;
        setRecommendations(res?.cultures_recommandees ?? []);
      })
      .catch(() => {
        if (!cancelled) setRecommendations([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [opts.solType, opts.pluviometrieMm, opts.region, opts.irrigation, hasInput]);

  return { recommendations, loading };
}
