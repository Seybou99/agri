/**
 * Hook : récupère la liste des cultures et le mapping icônes depuis l'API.
 * Fallback sur les données locales (plants.ts) si API indisponible ou erreur.
 */

import { useState, useEffect, useMemo } from 'react';
import { fetchCultures, fetchIcons, isCulturesApiAvailable } from '@services/culturesApi';
import { AVAILABLE_CROPS, CROP_ICONS, PLANTS_REQUIREMENTS } from '@constants/plants';

export interface CultureOption {
  key: string;
  name: string;
  icon: string;
}

export function useCulturesFromApi(): {
  cultures: CultureOption[];
  loading: boolean;
  fromApi: boolean;
} {
  const [apiCultures, setApiCultures] = useState<{ id: string; nom: string }[] | null>(null);
  const [iconsMap, setIconsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!isCulturesApiAvailable()) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [culturesRes, iconsRes] = await Promise.all([fetchCultures(), fetchIcons()]);
        if (cancelled) return;
        if (culturesRes?.data?.length) {
          setApiCultures(culturesRes.data.map((c) => ({ id: c.id, nom: c.nom })));
          setFromApi(true);
        }
        if (iconsRes?.length) {
          const map: Record<string, string> = {};
          iconsRes.forEach((i) => {
            map[i.culture_id] = i.emoji;
          });
          setIconsMap(map);
        }
      } catch {
        if (!cancelled) setFromApi(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cultures = useMemo((): CultureOption[] => {
    if (fromApi && apiCultures?.length) {
      return apiCultures.map((c) => ({
        key: c.id,
        name: c.nom,
        icon: iconsMap[c.id] ?? '🌱',
      }));
    }
    return AVAILABLE_CROPS.map((key) => ({
      key,
      name: PLANTS_REQUIREMENTS[key]?.name ?? key,
      icon: CROP_ICONS[key] ?? '🌱',
    }));
  }, [fromApi, apiCultures, iconsMap]);

  return { cultures, loading, fromApi };
}
