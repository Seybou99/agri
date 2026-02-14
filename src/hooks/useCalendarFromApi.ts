/**
 * Récupère le calendrier cultural depuis l'API pour les cultures données.
 * Retourne un map cultureId → { semis, recolte } dérivé des étapes API.
 */

import { useState, useEffect, useMemo } from 'react';
import { fetchCalendar, isCulturesApiAvailable } from '@services/culturesApi';

export interface CalendarEntry {
  semis: string;
  recolte: string;
}

export function useCalendarFromApi(cropKeys: string[]): Record<string, CalendarEntry> {
  const [byCulture, setByCulture] = useState<Record<string, { semis: string; recolte: string }>>({});

  useEffect(() => {
    if (!isCulturesApiAvailable() || !cropKeys.length) {
      setByCulture({});
      return;
    }
    let cancelled = false;
    (async () => {
      const map: Record<string, { semis: string; recolte: string }> = {};
      await Promise.all(
        cropKeys.map(async (key) => {
          const cal = await fetchCalendar(key);
          if (cancelled) return;
          if (cal?.etapes?.length) {
            const first = cal.etapes[0];
            const last = cal.etapes[cal.etapes.length - 1];
            map[key] = {
              semis: first?.debut ?? '–',
              recolte: last?.fin ?? '–',
            };
          }
        })
      );
      if (!cancelled) setByCulture(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [cropKeys.join(',')]);

  return byCulture;
}
