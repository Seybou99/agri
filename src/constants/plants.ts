// Base de données des besoins agronomiques des plantes (Matching Engine)
// Cette base sera utilisée pour calculer les scores d'aptitude

import { PlantRequirements } from '@models/Plant';

/** Mois en français (ordre calendaire) pour le calcul semis → récolte */
const MOIS_ORDRE = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
  'août', 'septembre', 'octobre', 'novembre', 'décembre',
] as const;

/**
 * Calcule le mois de récolte à partir du mois de semis et de la durée du cycle en mois.
 * Ex. semis juin (5) + 4 mois → octobre (9).
 */
export function getMoisRecolte(semisMois: string, cycleLengthMonths: number): string {
  const idx = MOIS_ORDRE.findIndex((m) => m.toLowerCase() === semisMois.toLowerCase());
  if (idx < 0) return semisMois;
  const recolteIdx = (idx + cycleLengthMonths) % 12;
  const mois = MOIS_ORDRE[recolteIdx];
  return mois.charAt(0).toUpperCase() + mois.slice(1);
}

export const PLANTS_REQUIREMENTS: Record<string, PlantRequirements> = {
  oignon: {
    name: 'Oignon',
    scientificName: 'Allium cepa',
    soil: {
      phMin: 5.5,
      phMax: 7.0,
      preferredTexture: 'limoneux',
      drainage: 'bon',
    },
    climate: {
      tempMin: 15,
      tempMax: 35,
      tempIdealNight: {
        min: 18,
        max: 22,
      },
      rainfallMin: 400,
      rainfallMax: 800,
    },
    waterNeeds: 'moyen',
    growingSeason: {
      start: 'octobre',
      cycleLengthMonths: 2,
    },
    yieldRange: {
      min: 20,
      max: 35,
    },
    commonDiseases: ['Mildiou', 'Pourriture blanche', 'Thrips'],
    notes: 'L\'oignon nécessite des températures nocturnes fraîches pour la bulbaison.',
    seedTypes: ['Violet de Galmi', 'Oignon blanc de Soumpi', 'Texas Early Grano', 'Red Creole'],
    practicalTips: [
      'Semis en pépinière puis repiquage. Éviter les excès d\'eau en fin de cycle.',
      'Buttage léger pour favoriser le grossissement du bulbe.',
      'Récolte quand 50–70 % des fanes sont couchées.',
    ],
  },
  
  tomate: {
    name: 'Tomate',
    scientificName: 'Solanum lycopersicum',
    soil: {
      phMin: 5.5,
      phMax: 7.0,
      preferredTexture: 'limono-sableux',
      drainage: 'bon',
    },
    climate: {
      tempMin: 18,
      tempMax: 30,
      rainfallMin: 600,
      rainfallMax: 1200,
    },
    waterNeeds: 'élevé',
    growingSeason: {
      start: 'septembre',
      cycleLengthMonths: 3,
    },
    yieldRange: {
      min: 15,
      max: 40,
    },
    commonDiseases: ['Mildiou', 'Alternariose', 'Flétrissement bactérien'],
    notes: 'La tomate nécessite un apport régulier en eau et un sol riche en matière organique.',
    seedTypes: ['Roma VF', 'Moneymaker', 'Tropimech', 'Tomate locale Mali (Tounvè)'],
    practicalTips: [
      'Tuteurage recommandé. Irrigation au goutte-à-goutte pour limiter mildiou.',
      'Paillage pour garder fraîcheur et réduire adventices.',
      'Rotation avec légumineuses (arachide, niébé) pour limiter nématodes.',
    ],
  },
  
  maïs: {
    name: 'Maïs',
    scientificName: 'Zea mays',
    soil: {
      phMin: 5.5,
      phMax: 7.5,
      preferredTexture: 'limoneux',
      drainage: 'bon',
    },
    climate: {
      tempMin: 18,
      tempMax: 35,
      rainfallMin: 500,
      rainfallMax: 1000,
      degreeDays: 1500,
    },
    waterNeeds: 'élevé',
    growingSeason: {
      start: 'juin',
      cycleLengthMonths: 4,
    },
    yieldRange: {
      min: 2,
      max: 6,
    },
    commonDiseases: ['Rouille', 'Helminthosporiose', 'Pyrale'],
    notes: 'Le maïs est très sensible au stress hydrique pendant la floraison.',
    seedTypes: ['Obatanga', 'Pool 16', 'TZEE-W', 'Variétés locales (gnima, kana)'],
    practicalTips: [
      'Semis dès les premières pluies. Écartement 80 × 40 cm environ.',
      'Irrigation critique au stade floraison–grain laiteux.',
      'Désherbage manuel ou sarclage avant le stade 6–8 feuilles.',
    ],
  },
  
  riz: {
    name: 'Riz',
    scientificName: 'Oryza sativa',
    soil: {
      phMin: 5.0,
      phMax: 7.0,
      preferredTexture: 'argileux',
      drainage: 'faible',
    },
    climate: {
      tempMin: 20,
      tempMax: 35,
      rainfallMin: 1000,
    },
    waterNeeds: 'élevé',
    growingSeason: {
      start: 'juin',
      cycleLengthMonths: 5,
    },
    yieldRange: {
      min: 3,
      max: 7,
    },
    commonDiseases: ['Pyriculariose', 'Helminthosporiose'],
    notes: 'Le riz nécessite une inondation contrôlée pendant la croissance.',
    seedTypes: ['NERICA', 'Jasmine 85', 'IR 64', 'Variétés locales (flottant, bas-fond)'],
    practicalTips: [
      'Riz irrigué : maîtrise du niveau d\'eau. Riz pluvial : zones bas-fonds.',
      'Repiquage recommandé pour meilleur tallage.',
      'Fertilisation NPK adaptée au stade tallage et initiation panicule.',
    ],
  },
  
  arachide: {
    name: 'Arachide',
    scientificName: 'Arachis hypogaea',
    soil: {
      phMin: 5.5,
      phMax: 7.0,
      preferredTexture: 'sableux',
      drainage: 'bon',
    },
    climate: {
      tempMin: 20,
      tempMax: 35,
      rainfallMin: 500,
      rainfallMax: 1000,
    },
    waterNeeds: 'moyen',
    growingSeason: {
      start: 'juin',
      cycleLengthMonths: 4,
    },
    yieldRange: {
      min: 1,
      max: 2.5,
    },
    commonDiseases: ['Pourriture des gousses', 'Cercosporiose'],
    notes: 'L\'arachide préfère les sols légers et bien drainés.',
    seedTypes: ['55-437', 'Fleur 11', 'ICGV 91114', 'Variétés locales (gnommè)'],
    practicalTips: [
      'Semis en poquets, 2 graines au 30–40 cm. Sol bien travaillé, drainant.',
      'Buttage avant floraison pour favoriser la gynophore.',
      'Rotation avec céréales (mil, sorgho) pour limiter maladies et nématodes.',
    ],
  },
};

// Liste des cultures disponibles pour les menus déroulants
export const AVAILABLE_CROPS = Object.keys(PLANTS_REQUIREMENTS);

/** Icônes pour le sélecteur visuel (Phase 2 – inclusion) */
export const CROP_ICONS: Record<string, string> = {
  oignon: '🧅',
  tomate: '🍅',
  maïs: '🌽',
  riz: '🍚',
  arachide: '🥜',
};
