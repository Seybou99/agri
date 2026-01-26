/**
 * Conversion X/Y (plan concession, UTM) → latitude / longitude.
 * Plans « Données GPS » (X, Y) au Mali, zones UTM 29N ou 30N.
 */

import { toLatLon } from 'utm';

export type UtmZone = 29 | 30;

/**
 * Convertit X/Y (UTM, mètres) en lat/lng (WGS84).
 * @param x Est (Easting), ex. 683849
 * @param y Nord (Northing), ex. 1402776
 * @param zone 29 ou 30 (Mali)
 */
export function xyToLatLng(x: number, y: number, zone: UtmZone = 29): { lat: number; lng: number } | null {
  try {
    const res = toLatLon(x, y, zone, 'N', undefined, false);
    return { lat: res.latitude, lng: res.longitude };
  } catch {
    return null;
  }
}
