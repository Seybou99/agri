/**
 * Variante d'app : agriculteur | acheteur
 * Priorité : app.config.js (extra.appVariant, lit APP_VARIANT du script npm)
 * puis .env via react-native-dotenv
 */
import Constants from 'expo-constants';
import { APP_VARIANT as DOTENV_VARIANT } from 'react-native-dotenv';

export type AppVariant = 'agriculteur' | 'acheteur';

function normalizeVariant(raw: string | undefined): AppVariant {
  const v = (raw ?? 'agriculteur').trim().toLowerCase();
  if (v === 'acheteur' || v === 'client' || v === 'buyer') return 'acheteur';
  return 'agriculteur';
}

function resolveVariant(): AppVariant {
  const fromExpo = Constants.expoConfig?.extra?.appVariant;
  if (typeof fromExpo === 'string' && fromExpo.length > 0) {
    return normalizeVariant(fromExpo);
  }
  return normalizeVariant(DOTENV_VARIANT);
}

export const appVariant: AppVariant = resolveVariant();

export const isBuyerApp = (): boolean => appVariant === 'acheteur';
export const isFarmerApp = (): boolean => appVariant === 'agriculteur';
