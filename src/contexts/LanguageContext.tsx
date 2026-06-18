/**
 * LanguageContext — fournit t() à toute l'app et synchronise avec useSettings.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTranslations, type LanguageCode, type Translations } from '../i18n';

const LANG_KEY = '@senegundo_lang';

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => Promise<void>;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  setLang: async () => {},
  t: getTranslations('fr'),
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LanguageCode>('fr');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY)
      .then((stored) => {
        if (stored) setLangState(stored as LanguageCode);
      })
      .catch(() => {});
  }, []);

  const setLang = async (newLang: LanguageCode) => {
    setLangState(newLang);
    try {
      await AsyncStorage.setItem(LANG_KEY, newLang);
      // Synchroniser aussi les settings globaux
      const settingsRaw = await AsyncStorage.getItem('@senegundo_settings');
      const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
      await AsyncStorage.setItem('@senegundo_settings', JSON.stringify({ ...settings, lang: newLang }));
    } catch {}
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: getTranslations(lang) }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  return useContext(LanguageContext);
}
