/**
 * Dataset Cultures Mali — aligné avec recommandation-api-culture.md et plants.ts app.
 * Base pour GET /cultures, /calendar, /profitability, /icons, /recommendations.
 */

export interface CultureItem {
  id: string;
  nom: string;
  categorie: string;
  zones: string[];
  eau_besoin: 'faible' | 'moyen' | 'élevé';
  rendement_t_ha: { min: number; max: number };
  rentabilite: 'Faible' | 'Rentable' | 'Élevée' | 'Très élevée';
  icon: string;
  cycle_jours?: number;
  sols_adaptes?: string[];
  description?: string;
  irrigue?: boolean;
}

export interface CalendarStep {
  phase: string;
  debut: string;
  fin: string;
}

export interface ProfitabilityItem {
  culture_id: string;
  culture: string;
  revenu_ha_min: number;
  revenu_ha_max: number;
  niveau: string;
}

export interface IconItem {
  culture: string;
  culture_id: string;
  icon_name: string;
  emoji: string;
  color: string;
}

/** Cultures Mali (MVP — extensible) */
export const CULTURES: CultureItem[] = [
  {
    id: 'riz',
    nom: 'Riz',
    categorie: 'Céréale',
    zones: ['Office du Niger', 'Ségou', 'Mopti'],
    eau_besoin: 'élevé',
    rendement_t_ha: { min: 4, max: 6 },
    rentabilite: 'Élevée',
    icon: 'rice',
    cycle_jours: 120,
    sols_adaptes: ['Argileux', 'Limoneux'],
    irrigue: true,
  },
  {
    id: 'maïs',
    nom: 'Maïs',
    categorie: 'Céréale',
    zones: ['Sikasso', 'Ségou', 'Koulikoro', 'Kayes'],
    eau_besoin: 'élevé',
    rendement_t_ha: { min: 2, max: 6 },
    rentabilite: 'Rentable',
    icon: 'corn',
    cycle_jours: 120,
    sols_adaptes: ['Limoneux', 'Sablo-limoneux'],
  },
  {
    id: 'oignon',
    nom: 'Oignon',
    categorie: 'Maraîchage',
    zones: ['Bamako', 'Sikasso', 'Kayes'],
    eau_besoin: 'élevé',
    rendement_t_ha: { min: 20, max: 35 },
    rentabilite: 'Très élevée',
    icon: 'onion',
    cycle_jours: 120,
    sols_adaptes: ['Sableux', 'Limoneux'],
    irrigue: true,
  },
  {
    id: 'tomate',
    nom: 'Tomate',
    categorie: 'Maraîchage',
    zones: ['Bamako', 'Sikasso', 'Ségou'],
    eau_besoin: 'élevé',
    rendement_t_ha: { min: 15, max: 40 },
    rentabilite: 'Très élevée',
    icon: 'tomato',
    cycle_jours: 90,
    sols_adaptes: ['Limono-sableux', 'Limoneux'],
  },
  {
    id: 'arachide',
    nom: 'Arachide',
    categorie: 'Légumineuse',
    zones: ['Kayes', 'Sikasso', 'Ségou'],
    eau_besoin: 'moyen',
    rendement_t_ha: { min: 1, max: 2.5 },
    rentabilite: 'Rentable',
    icon: 'peanut',
    cycle_jours: 100,
    sols_adaptes: ['Sableux', 'Sablo-limoneux'],
  },
];

/** Calendrier cultural (semis / croissance / récolte) — Mali */
export const CALENDAR: Record<string, CalendarStep[]> = {
  riz: [
    { phase: 'Pépinière', debut: 'Juin', fin: 'Juillet' },
    { phase: 'Repiquage', debut: 'Juillet', fin: 'Août' },
    { phase: 'Croissance', debut: 'Août', fin: 'Octobre' },
    { phase: 'Récolte', debut: 'Octobre', fin: 'Novembre' },
  ],
  'maïs': [
    { phase: 'Semis', debut: 'Mai', fin: 'Juin' },
    { phase: 'Croissance', debut: 'Juin', fin: 'Août' },
    { phase: 'Récolte', debut: 'Septembre', fin: 'Octobre' },
  ],
  oignon: [
    { phase: 'Pépinière', debut: 'Octobre', fin: 'Novembre' },
    { phase: 'Repiquage', debut: 'Novembre', fin: 'Décembre' },
    { phase: 'Récolte', debut: 'Février', fin: 'Mars' },
  ],
  tomate: [
    { phase: 'Semis', debut: 'Septembre', fin: 'Novembre' },
    { phase: 'Repiquage', debut: 'Novembre', fin: 'Décembre' },
    { phase: 'Récolte', debut: 'Janvier', fin: 'Mars' },
  ],
  arachide: [
    { phase: 'Semis', debut: 'Juin', fin: 'Juin' },
    { phase: 'Floraison', debut: 'Juillet', fin: 'Août' },
    { phase: 'Récolte', debut: 'Septembre', fin: 'Octobre' },
  ],
};

/** Rentabilité brute / ha (EUR) — indicatif Mali */
export const PROFITABILITY: ProfitabilityItem[] = [
  { culture_id: 'oignon', culture: 'Oignon', revenu_ha_min: 2000, revenu_ha_max: 4000, niveau: 'Très rentable' },
  { culture_id: 'tomate', culture: 'Tomate', revenu_ha_min: 1500, revenu_ha_max: 2500, niveau: 'Très rentable' },
  { culture_id: 'riz', culture: 'Riz irrigué', revenu_ha_min: 1200, revenu_ha_max: 2000, niveau: 'Rentable' },
  { culture_id: 'maïs', culture: 'Maïs', revenu_ha_min: 800, revenu_ha_max: 1500, niveau: 'Rentable' },
  { culture_id: 'arachide', culture: 'Arachide', revenu_ha_min: 700, revenu_ha_max: 1200, niveau: 'Rentable' },
];

/** Icônes UX (emoji + couleur catégorie) */
export const ICONS: IconItem[] = [
  { culture: 'Riz', culture_id: 'riz', icon_name: 'rice', emoji: '🍚', color: '#F4D03F' },
  { culture: 'Maïs', culture_id: 'maïs', icon_name: 'corn', emoji: '🌽', color: '#F1C40F' },
  { culture: 'Oignon', culture_id: 'oignon', icon_name: 'onion', emoji: '🧅', color: '#27AE60' },
  { culture: 'Tomate', culture_id: 'tomate', icon_name: 'tomato', emoji: '🍅', color: '#E74C3C' },
  { culture: 'Arachide', culture_id: 'arachide', icon_name: 'peanut', emoji: '🥜', color: '#D35400' },
];

export function getCultureById(id: string): CultureItem | undefined {
  return CULTURES.find((c) => c.id === id);
}

export function filterCultures(opts: {
  categorie?: string;
  rentable?: boolean;
  irrigue?: boolean;
}): CultureItem[] {
  let list = [...CULTURES];
  if (opts.categorie) {
    const cat = opts.categorie.toLowerCase();
    list = list.filter((c) => c.categorie.toLowerCase().includes(cat));
  }
  if (opts.rentable === true) {
    list = list.filter((c) => c.rentabilite === 'Rentable' || c.rentabilite === 'Très élevée' || c.rentabilite === 'Élevée');
  }
  if (opts.irrigue === true) {
    list = list.filter((c) => c.irrigue === true);
  }
  return list;
}
