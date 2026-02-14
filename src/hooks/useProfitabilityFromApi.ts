/**
 * Récupère la rentabilité par culture depuis l'API (revenus bruts / ha, Mali).
 */

import { useState, useEffect, useMemo } from 'react';
import { fetchProfitability, isCulturesApiAvailable } from '@services/culturesApi';

export interface ProfitabilityRow {
  culture_id: string;
  culture: string;
  revenu_ha_min: number;
  revenu_ha_max: number;
  niveau: string;
}

export function useProfitabilityFromApi(cropIds: string[]): {
  byCulture: Record<string, ProfitabilityRow>;
  loading: boolean;
} {
  const [list, setList] = useState<ProfitabilityRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isCulturesApiAvailable()) {
      setList([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchProfitability()
      .then((data) => {
        if (!cancelled && data) setList(data);
      })
      .catch(() => {
        if (!cancelled) setList([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byCulture = useMemo(() => {
    const map: Record<string, ProfitabilityRow> = {};
    list.forEach((row) => {
      map[row.culture_id] = row;
    });
    return map;
  }, [list]);

  return { byCulture, loading };
}
