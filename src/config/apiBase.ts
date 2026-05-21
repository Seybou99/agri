/**
 * URL de l’API Vercel (projet agri → agri-ruddy.vercel.app).
 * .env.local (téléchargé par `vercel env pull`) peut contenir une ancienne URL — on la corrige ici.
 */
import { API_URL } from 'react-native-dotenv';

/** Projet actuellement déployé (npm run deploy:api) */
export const VERCEL_API_BASE = 'https://agri-ruddy.vercel.app';

const DEPRECATED_HOSTS = ['agrimali-app.vercel.app', 'api.example.com'];

export function getApiBaseUrl(): string | null {
  let url = typeof API_URL === 'string' ? API_URL.trim() : '';
  if (!url || DEPRECATED_HOSTS.some((h) => url.includes(h))) {
    url = VERCEL_API_BASE;
  }
  return url.replace(/\/$/, '') || null;
}
