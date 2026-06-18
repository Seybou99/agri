import type { LanguageCode, Translations } from './types';
import fr from './fr';
import en from './en';
import bm from './bm';
import ff from './ff';
import snk from './snk';
import tmh from './tmh';
import son from './son';

export type { LanguageCode, Translations, SurfaceUnit } from './types';

export const TRANSLATIONS: Record<LanguageCode, Translations> = { fr, en, bm, ff, snk, tmh, son };

export interface LanguageMeta {
  code: LanguageCode;
  label: string;      // nom dans la langue elle-même
  labelFr: string;    // nom en français
  flag: string;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'fr',  label: 'Français',    labelFr: 'Français',   flag: '🇫🇷' },
  { code: 'en',  label: 'English',     labelFr: 'Anglais',    flag: '🇬🇧' },
  { code: 'bm',  label: 'Bamanankan',  labelFr: 'Bambara',    flag: '🇲🇱' },
  { code: 'ff',  label: 'Fulfuldé',    labelFr: 'Peul',       flag: '🇲🇱' },
  { code: 'snk', label: 'Sooninkan',   labelFr: 'Soninké',    flag: '🇲🇱' },
  { code: 'tmh', label: 'Tamaheq',     labelFr: 'Tamasheq',   flag: '🇲🇱' },
  { code: 'son', label: 'Songhay',     labelFr: 'Sonrhaï',    flag: '🇲🇱' },
];

export function getTranslations(lang: LanguageCode): Translations {
  return TRANSLATIONS[lang] ?? fr;
}
