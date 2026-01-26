// Géocodage via Nominatim (OpenStreetMap) – gratuit, sans clé
// https://nominatim.org/release-docs/latest/api/Search/

const BASE = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'SeneGundo/1.0 (agri-mali)';

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

/**
 * Recherche un lieu par nom et retourne la première suggestion (lat, lng).
 * On ajoute "Mali" pour améliorer les résultats locaux.
 */
export async function geocodePlace(query: string): Promise<GeocodeResult | null> {
  const q = query.trim();
  if (!q) return null;
  const searchQuery = q.toLowerCase().includes('mali') ? q : `${q}, Mali`;
  const params = new URLSearchParams({
    q: searchQuery,
    format: 'json',
    limit: '1',
  });
  try {
    const res = await fetch(`${BASE}?${params.toString()}`, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const first = data?.[0];
    if (!first?.lat || !first?.lon) return null;
    return {
      lat: Number(first.lat),
      lng: Number(first.lon),
      displayName: String(first.display_name ?? searchQuery),
    };
  } catch {
    return null;
  }
}
