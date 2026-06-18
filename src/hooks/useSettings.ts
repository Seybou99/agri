/**
 * useSettings — Préférences utilisateur persistées avec AsyncStorage
 */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LanguageCode } from '../i18n';

const KEY = '@senegundo_settings';

export type Language = LanguageCode;
export type SurfaceUnit = 'ha' | 'acres';

export interface AppSettings {
  lang: Language;
  notifMeteo: boolean;
  notifDiagnostic: boolean;
  notifMarche: boolean;
  uniteSurface: SurfaceUnit;
  modeHorsLigne: boolean;
}

const DEFAULTS: AppSettings = {
  lang: 'fr',
  notifMeteo: true,
  notifDiagnostic: true,
  notifMarche: false,
  uniteSurface: 'ha',
  modeHorsLigne: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = useCallback(async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, [settings]);

  const reset = useCallback(async () => {
    setSettings(DEFAULTS);
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {}
  }, []);

  const clearCache = useCallback(async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter((k) => k !== KEY);
      if (cacheKeys.length > 0) await AsyncStorage.multiRemove(cacheKeys);
    } catch {}
  }, []);

  return { settings, loading, update, reset, clearCache };
}
