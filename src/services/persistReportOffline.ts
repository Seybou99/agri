import type { ApiRecommendationRow, OfflineCachedReport } from '@models/ParcelHistory';
import { saveOfflineReport } from '@services/offlineReportCache';
import { appendParcelSeason } from '@services/parcelHistoryStorage';
import { saveLastReport, type LastReportSnapshot } from '@services/lastReportStorage';
import { getParcelStableKey, getSeasonLabel, getSeasonYear } from '@utils/parcelSeason';
import type { SoilData } from '@services/agronomy/soilService';
import type { ClimateData } from '@services/agronomy/climateService';
import type { MatchingResult } from '@services/agronomy/matchingEngine';
import type { IdealCropItem } from '@hooks/useDiagnosticReport';

export interface PersistReportInput {
  parcelId: string;
  locationName: string;
  crops: string[];
  surfaceHa: number;
  lat: number;
  lng: number;
  soil: SoilData;
  climate: ClimateData;
  matchingByCrop: Record<string, MatchingResult>;
  idealCrops: IdealCropItem[];
  otherCrops: IdealCropItem[];
  apiRecommendations: ApiRecommendationRow[];
  topCropKey?: string;
  topCropName?: string;
  aptitudeScore?: number;
  harvestLabel?: string;
}

export async function persistReportOffline(input: PersistReportInput): Promise<void> {
  const createdAt = Date.now();
  const parcelStableKey = getParcelStableKey(input.lat, input.lng, input.locationName);
  const seasonYear = getSeasonYear(createdAt);
  const seasonLabel = getSeasonLabel(createdAt);

  const lastReport: LastReportSnapshot = {
    parcelId: input.parcelId,
    locationName: input.locationName,
    crops: input.crops,
    surfaceHa: input.surfaceHa,
    lat: input.lat,
    lng: input.lng,
    createdAt,
    topCropKey: input.topCropKey,
    topCropName: input.topCropName,
    aptitudeScore: input.aptitudeScore,
    soilTexture: input.soil.texture,
    ph: input.soil.ph,
    harvestLabel: input.harvestLabel,
    offlineAvailable: true,
  };

  const cache: OfflineCachedReport = {
    parcelId: input.parcelId,
    parcelStableKey,
    seasonYear,
    seasonLabel,
    cachedAt: createdAt,
    locationName: input.locationName,
    crops: input.crops,
    surfaceHa: input.surfaceHa,
    lat: input.lat,
    lng: input.lng,
    soil: input.soil,
    climate: input.climate,
    matchingByCrop: input.matchingByCrop,
    idealCrops: input.idealCrops,
    otherCrops: input.otherCrops,
    apiRecommendations: input.apiRecommendations,
    harvestLabel: input.harvestLabel,
    topCropKey: input.topCropKey,
    topCropName: input.topCropName,
    aptitudeScore: input.aptitudeScore,
  };

  await Promise.all([
    saveLastReport(lastReport),
    saveOfflineReport(cache),
    appendParcelSeason({
      parcelId: input.parcelId,
      locationName: input.locationName,
      crops: input.crops,
      surfaceHa: input.surfaceHa,
      lat: input.lat,
      lng: input.lng,
      createdAt,
      topCropKey: input.topCropKey,
      topCropName: input.topCropName,
      aptitudeScore: input.aptitudeScore,
      soilTexture: input.soil.texture,
      ph: input.soil.ph,
      harvestLabel: input.harvestLabel,
      annualRainfall: input.climate.annualRainfall,
      averageTemperature: input.climate.averageTemperature,
      apiRecommendations: input.apiRecommendations,
      idealCropsSummary: input.idealCrops.slice(0, 5).map((c) => ({
        key: c.key,
        name: c.name,
        score: c.result.score,
      })),
      offlineAvailable: true,
    }),
  ]);
}
