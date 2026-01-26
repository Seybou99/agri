// Modèle Diagnostic pour Firestore

export type DiagnosticStatus = 'pending' | 'paid' | 'processing' | 'completed' | 'failed';
export type SuitabilityLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DiagnosticResults {
  score: number; // Score de 0 à 10
  soilType: string;
  ph: number;
  suitability: SuitabilityLevel;
  alerts: string[];
  recommendations: string[];
  generatedAt: Date;
  
  // Données détaillées
  soilData?: {
    texture: string;
    organicCarbon: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  
  climateData?: {
    annualRainfall: number;
    averageTemperature: number;
    temperatureRange: {
      min: number;
      max: number;
    };
  };
  
  yieldEstimate?: {
    min: number; // tonnes/hectare
    max: number; // tonnes/hectare
    average: number;
  };
  
  calendar?: {
    optimalPlantingStart: string; // Mois
    optimalPlantingEnd: string;
    harvestPeriod: string;
  };
}

export interface Diagnostic {
  id: string;
  userId: string;
  culture: string; // Ex: "oignon", "tomate", "maïs"
  surface: number; // en hectares
  coordinates: Coordinates;
  locationName: string; // Ex: "Baguinéda"
  status: DiagnosticStatus;
  paymentRef?: string;
  results?: DiagnosticResults;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
