/**
 * Calendrier cultural Mali — catégories et cultures (recommandation-api-culture.md).
 * Structure : Catégorie → Liste de cultures → Étapes (semis, croissance, récolte).
 */

export interface CalendarPhase {
  phase: string;
  debut: string;
  fin: string;
}

export interface CultureCalendarItem {
  id: string;
  nom: string;
  emoji: string;
  saison?: string;
  etapes: CalendarPhase[];
}

export interface CalendarCategory {
  id: string;
  label: string;
  emoji: string;
  cultures: CultureCalendarItem[];
}

/** Catégories et cultures Mali avec calendrier (semis / récolte) */
export const CALENDAR_CATEGORIES_MALI: CalendarCategory[] = [
  {
    id: 'cereales',
    label: 'Céréales',
    emoji: '🌾',
    cultures: [
      {
        id: 'riz',
        nom: 'Riz (irrigué / pluvial)',
        emoji: '🍚',
        saison: 'Hivernage. Contre-saison possible Déc–Mars.',
        etapes: [
          { phase: 'Pépinière', debut: 'Juin', fin: 'Juillet' },
          { phase: 'Repiquage', debut: 'Juillet', fin: 'Août' },
          { phase: 'Croissance', debut: 'Août', fin: 'Octobre' },
          { phase: 'Récolte', debut: 'Octobre', fin: 'Novembre' },
        ],
      },
      {
        id: 'maïs',
        nom: 'Maïs',
        emoji: '🌽',
        saison: 'Hivernage',
        etapes: [
          { phase: 'Semis', debut: 'Mai', fin: 'Juin' },
          { phase: 'Croissance', debut: 'Juin', fin: 'Août' },
          { phase: 'Récolte', debut: 'Septembre', fin: 'Octobre' },
        ],
      },
      {
        id: 'mil',
        nom: 'Mil',
        emoji: '🌾',
        saison: 'Hivernage',
        etapes: [
          { phase: 'Semis', debut: 'Juin', fin: 'Juillet' },
          { phase: 'Croissance', debut: 'Juillet', fin: 'Septembre' },
          { phase: 'Récolte', debut: 'Octobre', fin: 'Novembre' },
        ],
      },
      {
        id: 'sorgho',
        nom: 'Sorgho',
        emoji: '🌾',
        saison: 'Hivernage',
        etapes: [
          { phase: 'Semis', debut: 'Juin', fin: 'Juillet' },
          { phase: 'Croissance', debut: 'Juillet', fin: 'Septembre' },
          { phase: 'Récolte', debut: 'Octobre', fin: 'Novembre' },
        ],
      },
      { id: 'ble', nom: 'Blé (zones irriguées)', emoji: '🌾', saison: 'Saison fraîche', etapes: [{ phase: 'Semis', debut: 'Novembre', fin: 'Décembre' }, { phase: 'Récolte', debut: 'Mars', fin: 'Avril' }] },
      { id: 'fonio', nom: 'Fonio', emoji: '🌾', saison: 'Hivernage', etapes: [{ phase: 'Semis', debut: 'Juin', fin: 'Juillet' }, { phase: 'Récolte', debut: 'Septembre', fin: 'Octobre' }] },
    ],
  },
  {
    id: 'legumineuses',
    label: 'Légumineuses',
    emoji: '🥜',
    cultures: [
      {
        id: 'arachide',
        nom: 'Arachide',
        emoji: '🥜',
        saison: 'Hivernage',
        etapes: [
          { phase: 'Semis', debut: 'Juin', fin: 'Juin' },
          { phase: 'Floraison', debut: 'Juillet', fin: 'Août' },
          { phase: 'Récolte', debut: 'Septembre', fin: 'Octobre' },
        ],
      },
      { id: 'niebe', nom: 'Niébé (haricot cornille)', emoji: '🫘', saison: 'Hivernage', etapes: [{ phase: 'Semis', debut: 'Juin', fin: 'Juillet' }, { phase: 'Récolte', debut: 'Septembre', fin: 'Novembre' }] },
      { id: 'voandzou', nom: 'Voandzou (pois de terre)', emoji: '🫘', saison: 'Hivernage', etapes: [{ phase: 'Semis', debut: 'Juin', fin: 'Juillet' }, { phase: 'Récolte', debut: 'Octobre', fin: 'Novembre' }] },
      { id: 'soja', nom: 'Soja', emoji: '🫘', saison: 'Hivernage', etapes: [{ phase: 'Semis', debut: 'Juin', fin: 'Juillet' }, { phase: 'Récolte', debut: 'Octobre', fin: 'Novembre' }] },
      { id: 'dolique', nom: 'Dolique', emoji: '🫘', saison: 'Hivernage', etapes: [{ phase: 'Semis', debut: 'Juin', fin: 'Juillet' }, { phase: 'Récolte', debut: 'Octobre', fin: 'Novembre' }] },
    ],
  },
  {
    id: 'tubercules',
    label: 'Tubercules',
    emoji: '🥔',
    cultures: [
      { id: 'manioc', nom: 'Manioc', emoji: '🥔', saison: 'Toute l\'année (pluie)', etapes: [{ phase: 'Plantation', debut: 'Avril', fin: 'Juin' }, { phase: 'Récolte', debut: 'Octobre', fin: 'Mars' }] },
      { id: 'patate_douce', nom: 'Patate douce', emoji: '🍠', saison: 'Hivernage', etapes: [{ phase: 'Plantation', debut: 'Juin', fin: 'Juillet' }, { phase: 'Récolte', debut: 'Octobre', fin: 'Décembre' }] },
      { id: 'pomme_de_terre', nom: 'Pomme de terre', emoji: '🥔', saison: 'Saison fraîche / irrigué', etapes: [{ phase: 'Plantation', debut: 'Octobre', fin: 'Novembre' }, { phase: 'Récolte', debut: 'Janvier', fin: 'Février' }] },
      { id: 'igname', nom: 'Igname (sud Mali)', emoji: '🥔', saison: 'Hivernage', etapes: [{ phase: 'Plantation', debut: 'Avril', fin: 'Mai' }, { phase: 'Récolte', debut: 'Novembre', fin: 'Janvier' }] },
    ],
  },
  {
    id: 'oleagineux',
    label: 'Oléagineux',
    emoji: '🌻',
    cultures: [
      { id: 'sesame', nom: 'Sésame', emoji: '🌻', saison: 'Hivernage', etapes: [{ phase: 'Semis', debut: 'Juin', fin: 'Juillet' }, { phase: 'Récolte', debut: 'Octobre', fin: 'Novembre' }] },
      { id: 'tournesol', nom: 'Tournesol', emoji: '🌻', saison: 'Hivernage', etapes: [{ phase: 'Semis', debut: 'Juin', fin: 'Juillet' }, { phase: 'Récolte', debut: 'Septembre', fin: 'Octobre' }] },
      { id: 'karite', nom: 'Karité (cueillette)', emoji: '🥜', saison: 'Cueillette juin–sept', etapes: [{ phase: 'Floraison', debut: 'Février', fin: 'Avril' }, { phase: 'Récolte', debut: 'Juin', fin: 'Septembre' }] },
    ],
  },
  {
    id: 'rente',
    label: 'Cultures de rente',
    emoji: '💰',
    cultures: [
      { id: 'coton', nom: 'Coton', emoji: '☁️', saison: 'Hivernage', etapes: [{ phase: 'Semis', debut: 'Juin', fin: 'Juillet' }, { phase: 'Récolte', debut: 'Novembre', fin: 'Janvier' }] },
      { id: 'canne_sucre', nom: 'Canne à sucre', emoji: '🎋', saison: 'Office du Niger', etapes: [{ phase: 'Plantation', debut: 'Mars', fin: 'Mai' }, { phase: 'Récolte', debut: 'Décembre', fin: 'Juin' }] },
      { id: 'tabac', nom: 'Tabac', emoji: '🍃', saison: 'Localisé', etapes: [{ phase: 'Pépinière', debut: 'Septembre', fin: 'Octobre' }, { phase: 'Récolte', debut: 'Janvier', fin: 'Mars' }] },
    ],
  },
  {
    id: 'maraichage',
    label: 'Maraîchage',
    emoji: '🧅',
    cultures: [
      {
        id: 'oignon',
        nom: 'Oignon',
        emoji: '🧅',
        saison: 'Contre-saison irrigué',
        etapes: [
          { phase: 'Pépinière', debut: 'Octobre', fin: 'Novembre' },
          { phase: 'Repiquage', debut: 'Novembre', fin: 'Décembre' },
          { phase: 'Récolte', debut: 'Février', fin: 'Mars' },
        ],
      },
      {
        id: 'tomate',
        nom: 'Tomate',
        emoji: '🍅',
        saison: 'Contre-saison',
        etapes: [
          { phase: 'Semis', debut: 'Octobre', fin: 'Novembre' },
          { phase: 'Repiquage', debut: 'Novembre', fin: 'Décembre' },
          { phase: 'Récolte', debut: 'Janvier', fin: 'Mars' },
        ],
      },
      { id: 'piment', nom: 'Piment', emoji: '🌶️', saison: 'Contre-saison', etapes: [{ phase: 'Semis', debut: 'Septembre', fin: 'Octobre' }, { phase: 'Récolte', debut: 'Décembre', fin: 'Mars' }] },
      { id: 'poivron', nom: 'Poivron', emoji: '🫑', saison: 'Contre-saison', etapes: [{ phase: 'Semis', debut: 'Septembre', fin: 'Octobre' }, { phase: 'Récolte', debut: 'Décembre', fin: 'Mars' }] },
      { id: 'chou', nom: 'Chou', emoji: '🥬', saison: 'Saison fraîche', etapes: [{ phase: 'Repiquage', debut: 'Octobre', fin: 'Novembre' }, { phase: 'Récolte', debut: 'Janvier', fin: 'Mars' }] },
      { id: 'laitue', nom: 'Laitue', emoji: '🥬', saison: 'Fraîche', etapes: [{ phase: 'Semis', debut: 'Octobre', fin: 'Février' }, { phase: 'Récolte', debut: 'Novembre', fin: 'Mars' }] },
      { id: 'aubergine', nom: 'Aubergine africaine', emoji: '🍆', saison: 'Hivernage / irrigué', etapes: [{ phase: 'Semis', debut: 'Septembre', fin: 'Octobre' }, { phase: 'Récolte', debut: 'Décembre', fin: 'Mars' }] },
      { id: 'gombo', nom: 'Gombo', emoji: '🥬', saison: 'Hivernage', etapes: [{ phase: 'Semis', debut: 'Juin', fin: 'Juillet' }, { phase: 'Récolte', debut: 'Août', fin: 'Novembre' }] },
      { id: 'concombre', nom: 'Concombre', emoji: '🥒', saison: 'Irrigué', etapes: [{ phase: 'Semis', debut: 'Octobre', fin: 'Février' }, { phase: 'Récolte', debut: 'Décembre', fin: 'Avril' }] },
      { id: 'carotte', nom: 'Carotte', emoji: '🥕', saison: 'Saison fraîche', etapes: [{ phase: 'Semis', debut: 'Octobre', fin: 'Novembre' }, { phase: 'Récolte', debut: 'Janvier', fin: 'Mars' }] },
    ],
  },
  {
    id: 'fruitiers',
    label: 'Fruitiers',
    emoji: '🍉',
    cultures: [
      { id: 'mangue', nom: 'Mangue', emoji: '🥭', saison: 'Export majeur', etapes: [{ phase: 'Floraison', debut: 'Janvier', fin: 'Février' }, { phase: 'Récolte', debut: 'Avril', fin: 'Juin' }] },
      { id: 'banane', nom: 'Banane', emoji: '🍌', saison: 'Pérenne', etapes: [{ phase: 'Plantation', debut: 'Mars', fin: 'Mai' }, { phase: 'Récolte', debut: 'Toute l\'année', fin: '' }] },
      { id: 'papaye', nom: 'Papaye', emoji: '🍈', saison: 'Pérenne', etapes: [{ phase: 'Plantation', debut: 'Juin', fin: 'Juillet' }, { phase: 'Récolte', debut: 'Toute l\'année', fin: '' }] },
      { id: 'agrumes', nom: 'Agrumes (orange, citron)', emoji: '🍊', saison: 'Pérenne', etapes: [{ phase: 'Floraison', debut: 'Février', fin: 'Avril' }, { phase: 'Récolte', debut: 'Novembre', fin: 'Mars' }] },
      { id: 'goyave', nom: 'Goyave', emoji: '🍐', saison: 'Pérenne', etapes: [{ phase: 'Récolte', debut: 'Octobre', fin: 'Décembre' }] },
      { id: 'anacarde', nom: 'Anacarde (en expansion sud)', emoji: '🥜', saison: 'Sèche', etapes: [{ phase: 'Floraison', debut: 'Janvier', fin: 'Février' }, { phase: 'Récolte', debut: 'Mars', fin: 'Mai' }] },
    ],
  },
  {
    id: 'agroforesterie',
    label: 'Agroforestier / PFNL',
    emoji: '🌿',
    cultures: [
      { id: 'nere', nom: 'Néré', emoji: '🌳', saison: 'Cueillette', etapes: [{ phase: 'Floraison', debut: 'Février', fin: 'Mars' }, { phase: 'Récolte gousses', debut: 'Mai', fin: 'Juillet' }] },
      { id: 'baobab', nom: 'Baobab', emoji: '🌳', saison: 'Cueillette', etapes: [{ phase: 'Floraison', debut: 'Mai', fin: 'Août' }, { phase: 'Récolte fruits', debut: 'Octobre', fin: 'Décembre' }] },
      { id: 'moringa', nom: 'Moringa', emoji: '🌿', saison: 'Pérenne', etapes: [{ phase: 'Récolte feuilles', debut: 'Toute l\'année', fin: '' }] },
      { id: 'acacia_senegal', nom: 'Acacia sénégal (gomme arabique)', emoji: '🌳', saison: 'Sèche', etapes: [{ phase: 'Saignée', debut: 'Octobre', fin: 'Juin' }] },
    ],
  },
];

/** Rentabilité indicative par culture (€/ha) — Mali, toutes catégories. Priorité API si disponible. */
export interface RentabiliteItem {
  revenu_ha_min: number;
  revenu_ha_max: number;
  niveau: string;
}

export const RENTABILITE_MALI: Record<string, RentabiliteItem> = {
  // Céréales
  riz: { revenu_ha_min: 1200, revenu_ha_max: 2000, niveau: 'Rentable' },
  'maïs': { revenu_ha_min: 800, revenu_ha_max: 1500, niveau: 'Rentable' },
  mil: { revenu_ha_min: 400, revenu_ha_max: 900, niveau: 'Modéré' },
  sorgho: { revenu_ha_min: 400, revenu_ha_max: 850, niveau: 'Modéré' },
  ble: { revenu_ha_min: 900, revenu_ha_max: 1600, niveau: 'Rentable' },
  fonio: { revenu_ha_min: 500, revenu_ha_max: 1000, niveau: 'Modéré' },
  // Légumineuses
  arachide: { revenu_ha_min: 700, revenu_ha_max: 1200, niveau: 'Rentable' },
  niebe: { revenu_ha_min: 450, revenu_ha_max: 900, niveau: 'Modéré' },
  voandzou: { revenu_ha_min: 400, revenu_ha_max: 800, niveau: 'Modéré' },
  soja: { revenu_ha_min: 600, revenu_ha_max: 1100, niveau: 'Rentable' },
  dolique: { revenu_ha_min: 350, revenu_ha_max: 700, niveau: 'Modéré' },
  // Tubercules
  manioc: { revenu_ha_min: 500, revenu_ha_max: 1000, niveau: 'Modéré' },
  patate_douce: { revenu_ha_min: 600, revenu_ha_max: 1200, niveau: 'Rentable' },
  pomme_de_terre: { revenu_ha_min: 1500, revenu_ha_max: 3000, niveau: 'Très rentable' },
  igname: { revenu_ha_min: 800, revenu_ha_max: 1500, niveau: 'Rentable' },
  // Oléagineux
  sesame: { revenu_ha_min: 550, revenu_ha_max: 1100, niveau: 'Rentable' },
  tournesol: { revenu_ha_min: 500, revenu_ha_max: 1000, niveau: 'Modéré' },
  karite: { revenu_ha_min: 300, revenu_ha_max: 700, niveau: 'Cueillette' },
  // Cultures de rente
  coton: { revenu_ha_min: 600, revenu_ha_max: 1200, niveau: 'Rentable' },
  canne_sucre: { revenu_ha_min: 800, revenu_ha_max: 1600, niveau: 'Rentable' },
  tabac: { revenu_ha_min: 1000, revenu_ha_max: 2000, niveau: 'Rentable' },
  // Maraîchage
  oignon: { revenu_ha_min: 2000, revenu_ha_max: 4000, niveau: 'Très rentable' },
  tomate: { revenu_ha_min: 1500, revenu_ha_max: 2500, niveau: 'Très rentable' },
  piment: { revenu_ha_min: 1200, revenu_ha_max: 2200, niveau: 'Très rentable' },
  poivron: { revenu_ha_min: 1100, revenu_ha_max: 2000, niveau: 'Très rentable' },
  chou: { revenu_ha_min: 800, revenu_ha_max: 1500, niveau: 'Rentable' },
  laitue: { revenu_ha_min: 1000, revenu_ha_max: 1800, niveau: 'Rentable' },
  aubergine: { revenu_ha_min: 900, revenu_ha_max: 1700, niveau: 'Rentable' },
  gombo: { revenu_ha_min: 700, revenu_ha_max: 1300, niveau: 'Rentable' },
  concombre: { revenu_ha_min: 1000, revenu_ha_max: 1900, niveau: 'Rentable' },
  carotte: { revenu_ha_min: 1100, revenu_ha_max: 2000, niveau: 'Rentable' },
  // Fruitiers
  mangue: { revenu_ha_min: 1500, revenu_ha_max: 3500, niveau: 'Très rentable' },
  banane: { revenu_ha_min: 1200, revenu_ha_max: 2500, niveau: 'Rentable' },
  papaye: { revenu_ha_min: 1000, revenu_ha_max: 2000, niveau: 'Rentable' },
  agrumes: { revenu_ha_min: 1300, revenu_ha_max: 2600, niveau: 'Rentable' },
  goyave: { revenu_ha_min: 600, revenu_ha_max: 1200, niveau: 'Modéré' },
  anacarde: { revenu_ha_min: 800, revenu_ha_max: 1800, niveau: 'Rentable' },
  // Agroforestier / PFNL
  nere: { revenu_ha_min: 200, revenu_ha_max: 500, niveau: 'Cueillette' },
  baobab: { revenu_ha_min: 250, revenu_ha_max: 600, niveau: 'Cueillette' },
  moringa: { revenu_ha_min: 800, revenu_ha_max: 1500, niveau: 'Rentable' },
  acacia_senegal: { revenu_ha_min: 400, revenu_ha_max: 900, niveau: 'Modéré' },
};

export function getCategoryById(id: string): CalendarCategory | undefined {
  return CALENDAR_CATEGORIES_MALI.find((c) => c.id === id);
}

export function getCultureInCategory(categoryId: string, cultureId: string): CultureCalendarItem | undefined {
  const cat = getCategoryById(categoryId);
  return cat?.cultures.find((c) => c.id === cultureId);
}

/** Toutes les cultures de toutes les catégories (liste plate). */
export function getAllCulturesFromCategories(): CultureCalendarItem[] {
  return CALENDAR_CATEGORIES_MALI.flatMap((cat) => cat.cultures);
}
