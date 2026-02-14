// Modèle pour les besoins agronomiques des plantes (Matching Engine)

export interface SoilRequirements {
  phMin: number;
  phMax: number;
  preferredTexture: 'sableux' | 'limoneux' | 'argileux' | 'limono-sableux';
  drainage: 'bon' | 'moyen' | 'faible';
}

export interface ClimateRequirements {
  tempMin: number; // Température minimale en °C
  tempMax: number; // Température maximale en °C
  tempIdealNight?: {
    min: number;
    max: number;
  };
  rainfallMin: number; // Pluviométrie minimale en mm/an
  rainfallMax?: number; // Pluviométrie maximale en mm/an
  degreeDays?: number; // Somme de températures nécessaire
}

export interface PlantRequirements {
  name: string;
  scientificName?: string;
  soil: SoilRequirements;
  climate: ClimateRequirements;
  waterNeeds: 'faible' | 'moyen' | 'élevé';
  growingSeason: {
    start: string; // Mois optimal de semis (ex. "juin")
    end?: string; // Mois de récolte (optionnel, calculé si cycleLengthMonths est fourni)
    /** Durée du cycle en mois (semis → récolte). Utilisé pour calculer le mois de récolte. */
    cycleLengthMonths?: number;
  };
  yieldRange: {
    min: number; // tonnes/hectare minimum
    max: number; // tonnes/hectare maximum
  };
  commonDiseases?: string[];
  notes?: string;
  /** Semences / variétés recommandées pour la zone (ex. Mali). */
  seedTypes?: string[];
  /** Conseils pratiques (irrigation, amendements, calendrier, etc.). */
  practicalTips?: string[];
}
