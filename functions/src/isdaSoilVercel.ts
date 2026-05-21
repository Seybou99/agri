/**
 * iSDAsoil API v2 — sol au niveau parcelle (Afrique, ~30 m).
 * Variables Vercel : ISDA_USERNAME, ISDA_PASSWORD
 */

import {
  fetchIsdaSoilAtPoint,
  type SoilDataPayload,
} from '../../src/services/agronomy/isdasoil';

export type ISDASoilResult = SoilDataPayload;

export async function fetchSoilFromISDA(lat: number, lng: number): Promise<ISDASoilResult> {
  const username = process.env.ISDA_USERNAME?.trim();
  const password = process.env.ISDA_PASSWORD?.trim();
  if (!username || !password) {
    throw new Error('ISDA_USERNAME et ISDA_PASSWORD doivent être définis (Vercel / .env backend)');
  }

  const soil = await fetchIsdaSoilAtPoint(lat, lng, username, password);
  if (!soil) {
    throw new Error('iSDA : réponse vide (hors couverture Afrique ?)');
  }
  return soil;
}
