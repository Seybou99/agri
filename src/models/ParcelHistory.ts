import type { ClimateData } from '@services/agronomy/climateService';
import type { SoilData } from '@services/agronomy/soilService';
import type { MatchingResult } from '@services/agronomy/matchingEngine';
export interface ApiRecommendationRow {
  culture: string;
  culture_id: string;
  score: number;
}

export interface CachedIdealCropItem {
  key: string;
  name: string;
  result: MatchingResult;
}

export interface ParcelSeasonSummary {
  id: string;
  parcelId: string;
  parcelStableKey: string;
  seasonYear: number;
  seasonLabel: string;
  createdAt: number;
  locationName: string;
  crops: string[];
  surfaceHa: number;
  lat: number;
  lng: number;
  topCropKey?: string;
  topCropName?: string;
  aptitudeScore?: number;
  soilTexture?: string;
  ph?: number;
  harvestLabel?: string;
  annualRainfall?: number;
  averageTemperature?: number;
  apiRecommendations?: ApiRecommendationRow[];
  idealCropsSummary?: Array<{ key: string; name: string; score: number }>;
  offlineAvailable: boolean;
}

export interface OfflineCachedReport {
  parcelId: string;
  parcelStableKey: string;
  seasonYear: number;
  seasonLabel: string;
  cachedAt: number;
  locationName: string;
  crops: string[];
  surfaceHa: number;
  lat: number;
  lng: number;
  soil: SoilData | null;
  climate: ClimateData | null;
  matchingByCrop: Record<string, MatchingResult>;
  idealCrops: CachedIdealCropItem[];
  otherCrops: CachedIdealCropItem[];
  apiRecommendations: ApiRecommendationRow[];
  harvestLabel?: string;
  topCropKey?: string;
  topCropName?: string;
  aptitudeScore?: number;
}

export interface ParcelHistoryGroup {
  parcelStableKey: string;
  locationName: string;
  lat: number;
  lng: number;
  seasons: ParcelSeasonSummary[];
  /** Saison la plus récente vs précédente (même parcelle). */
  comparison?: {
    current: ParcelSeasonSummary;
    previous: ParcelSeasonSummary;
    scoreDelta: number | null;
    rainfallDelta: number | null;
  };
}
