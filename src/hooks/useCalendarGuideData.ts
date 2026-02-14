/**
 * Données pour l’onglet Calendrier : calendriers détaillés, icônes, rentabilité.
 */

import { useState, useEffect } from 'react';
import {
  fetchCalendar,
  fetchIcons,
  fetchProfitability,
  isCulturesApiAvailable,
  type ApiCalendarResponse,
  type ApiIconItem,
  type ApiProfitabilityItem,
} from '@services/culturesApi';
import { CROP_ICONS, PLANTS_REQUIREMENTS, getMoisRecolte } from '@constants/plants';

const DEFAULT_CULTURE_IDS = ['riz', 'maïs', 'oignon', 'tomate', 'arachide'];

function buildLocalCalendar(cultureId: string): ApiCalendarResponse | null {
  const p = PLANTS_REQUIREMENTS[cultureId];
  if (!p?.growingSeason?.start) return null;
  const start = p.growingSeason.start;
  const cycle = p.growingSeason.cycleLengthMonths ?? 3;
  const end = getMoisRecolte(start, cycle);
  const startCap = start.charAt(0).toUpperCase() + start.slice(1);
  return {
    culture: p.name,
    culture_id: cultureId,
    saison: 'Hivernage / local',
    etapes: [
      { phase: 'Semis', debut: startCap, fin: startCap },
      { phase: 'Récolte', debut: end, fin: end },
    ],
  };
}

export interface CalendarGuideData {
  calendars: Record<string, ApiCalendarResponse | null>;
  icons: ApiIconItem[];
  profitability: ApiProfitabilityItem[];
  loading: boolean;
  fromApi: boolean;
}

export function useCalendarGuideData(): CalendarGuideData {
  const [calendars, setCalendars] = useState<Record<string, ApiCalendarResponse | null>>({});
  const [icons, setIcons] = useState<ApiIconItem[]>([]);
  const [profitability, setProfitability] = useState<ApiProfitabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!isCulturesApiAvailable()) {
      const calMap: Record<string, ApiCalendarResponse | null> = {};
      DEFAULT_CULTURE_IDS.forEach((id) => {
        calMap[id] = buildLocalCalendar(id);
      });
      setCalendars(calMap);
      setIcons(
        DEFAULT_CULTURE_IDS.map((id) => ({
          culture: PLANTS_REQUIREMENTS[id]?.name ?? id,
          culture_id: id,
          icon_name: id,
          emoji: CROP_ICONS[id] ?? '🌱',
          color: '#2E7D32',
        }))
      );
      setProfitability([
        { culture_id: 'oignon', culture: 'Oignon', revenu_ha_min: 2000, revenu_ha_max: 4000, niveau: 'Très rentable' },
        { culture_id: 'tomate', culture: 'Tomate', revenu_ha_min: 1500, revenu_ha_max: 2500, niveau: 'Très rentable' },
        { culture_id: 'riz', culture: 'Riz irrigué', revenu_ha_min: 1200, revenu_ha_max: 2000, niveau: 'Rentable' },
        { culture_id: 'maïs', culture: 'Maïs', revenu_ha_min: 800, revenu_ha_max: 1500, niveau: 'Rentable' },
        { culture_id: 'arachide', culture: 'Arachide', revenu_ha_min: 700, revenu_ha_max: 1200, niveau: 'Rentable' },
      ]);
      setLoading(false);
      return;
    }
    const localIcons: ApiIconItem[] = DEFAULT_CULTURE_IDS.map((id) => ({
      culture: PLANTS_REQUIREMENTS[id]?.name ?? id,
      culture_id: id,
      icon_name: id,
      emoji: CROP_ICONS[id] ?? '🌱',
      color: '#2E7D32',
    }));
    const localProfitability: ApiProfitabilityItem[] = [
      { culture_id: 'oignon', culture: 'Oignon', revenu_ha_min: 2000, revenu_ha_max: 4000, niveau: 'Très rentable' },
      { culture_id: 'tomate', culture: 'Tomate', revenu_ha_min: 1500, revenu_ha_max: 2500, niveau: 'Très rentable' },
      { culture_id: 'riz', culture: 'Riz irrigué', revenu_ha_min: 1200, revenu_ha_max: 2000, niveau: 'Rentable' },
      { culture_id: 'maïs', culture: 'Maïs', revenu_ha_min: 800, revenu_ha_max: 1500, niveau: 'Rentable' },
      { culture_id: 'arachide', culture: 'Arachide', revenu_ha_min: 700, revenu_ha_max: 1200, niveau: 'Rentable' },
    ];

    (async () => {
      setLoading(true);
      setFromApi(true);
      try {
        const [calList, iconsRes, profRes] = await Promise.all([
          Promise.all(DEFAULT_CULTURE_IDS.map((id) => fetchCalendar(id))),
          fetchIcons(),
          fetchProfitability(),
        ]);
        if (cancelled) return;
        const calMap: Record<string, ApiCalendarResponse | null> = {};
        DEFAULT_CULTURE_IDS.forEach((id, i) => {
          calMap[id] = calList[i] ?? buildLocalCalendar(id);
        });
        setCalendars(calMap);
        setIcons(iconsRes?.length ? iconsRes : localIcons);
        setProfitability(profRes?.length ? profRes : localProfitability);
        setFromApi(Boolean(iconsRes?.length || profRes?.length || calList.some((c) => c != null)));
      } catch {
        if (!cancelled) {
          setFromApi(false);
          const calMap: Record<string, ApiCalendarResponse | null> = {};
          DEFAULT_CULTURE_IDS.forEach((id) => {
            calMap[id] = buildLocalCalendar(id);
          });
          setCalendars(calMap);
          setIcons(localIcons);
          setProfitability(localProfitability);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { calendars, icons, profitability, loading, fromApi };
}
