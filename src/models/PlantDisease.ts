/** Résultats Pl@ntNet — maladies des plantes */

export interface PlantDiseaseReferenceImage {
  organ?: string;
  citation?: string;
  url?: { o?: string; m?: string; s?: string };
}

export interface PlantDiseaseMatch {
  name: string;
  score: number;
  description?: string;
  label?: string;
  images?: PlantDiseaseReferenceImage[];
}

export type PlantDiseaseProvider = 'plantnet' | 'kindwise';

export interface PlantDiseaseIdentifyResult {
  results: PlantDiseaseMatch[];
  provider?: PlantDiseaseProvider;
  language?: string;
  version?: string;
  remainingIdentificationRequests?: number;
  remainingCredits?: number;
  fallbackUsed?: boolean;
  query?: Record<string, unknown>;
}
