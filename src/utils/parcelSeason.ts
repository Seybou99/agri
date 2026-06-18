/**
 * Clé parcelle stable (même lieu ≈ même parcelle) et libellés de saison (Mali).
 */

/** ~100 m de précision pour regrouper les diagnostics au même endroit. */
export function getParcelStableKey(lat: number, lng: number, locationName?: string): string {
  const latR = Math.round(lat * 1000) / 1000;
  const lngR = Math.round(lng * 1000) / 1000;
  const name = (locationName ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 32);
  return `loc-${latR}-${lngR}${name ? `-${name}` : ''}`;
}

export function getSeasonYear(createdAtMs: number): number {
  return new Date(createdAtMs).getFullYear();
}

/** Saison agricole simplifiée (pluvieuse juin–oct, sinon sèche). */
export function getSeasonLabel(createdAtMs: number): string {
  const d = new Date(createdAtMs);
  const y = d.getFullYear();
  const month = d.getMonth();
  if (month >= 5 && month <= 9) {
    return `Saison pluvieuse ${y}`;
  }
  if (month >= 10) {
    return `Saison sèche ${y}/${y + 1}`;
  }
  return `Saison sèche ${y - 1}/${y}`;
}

export function formatSeasonShort(year: number): string {
  return `S. ${year}`;
}
