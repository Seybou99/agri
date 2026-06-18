/**
 * Historique parcelle par lieu (saisons successives, comparaison N vs N-1).
 */
import * as FileSystem from 'expo-file-system/legacy';
import type { ApiRecommendationRow, ParcelHistoryGroup, ParcelSeasonSummary } from '@models/ParcelHistory';
import { getParcelStableKey, getSeasonLabel, getSeasonYear } from '@utils/parcelSeason';
import type { LastReportSnapshot } from '@services/lastReportStorage';

const HISTORY_FILE = 'senegundo-parcel-history.json';
const MAX_ENTRIES = 50;

interface HistoryStore {
  version: 1;
  entries: ParcelSeasonSummary[];
}

function getFilePath(): string | null {
  const dir = FileSystem.documentDirectory;
  return dir ? `${dir}${HISTORY_FILE}` : null;
}

async function readStore(): Promise<HistoryStore> {
  const path = getFilePath();
  if (!path) return { version: 1, entries: [] };
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return { version: 1, entries: [] };
    const raw = await FileSystem.readAsStringAsync(path);
    const data = JSON.parse(raw) as HistoryStore;
    if (data?.version !== 1 || !Array.isArray(data.entries)) {
      return { version: 1, entries: [] };
    }
    return data;
  } catch {
    return { version: 1, entries: [] };
  }
}

async function writeStore(store: HistoryStore): Promise<void> {
  const path = getFilePath();
  if (!path) return;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(store));
}

export interface AppendSeasonInput {
  parcelId: string;
  locationName: string;
  crops: string[];
  surfaceHa: number;
  lat: number;
  lng: number;
  createdAt?: number;
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
  offlineAvailable?: boolean;
}

export async function appendParcelSeason(input: AppendSeasonInput): Promise<ParcelSeasonSummary> {
  const createdAt = input.createdAt ?? Date.now();
  const parcelStableKey = getParcelStableKey(input.lat, input.lng, input.locationName);
  const seasonYear = getSeasonYear(createdAt);
  const seasonLabel = getSeasonLabel(createdAt);

  const entry: ParcelSeasonSummary = {
    id: `${input.parcelId}-${seasonYear}`,
    parcelId: input.parcelId,
    parcelStableKey,
    seasonYear,
    seasonLabel,
    createdAt,
    locationName: input.locationName,
    crops: input.crops,
    surfaceHa: input.surfaceHa,
    lat: input.lat,
    lng: input.lng,
    topCropKey: input.topCropKey,
    topCropName: input.topCropName,
    aptitudeScore: input.aptitudeScore,
    soilTexture: input.soilTexture,
    ph: input.ph,
    harvestLabel: input.harvestLabel,
    annualRainfall: input.annualRainfall,
    averageTemperature: input.averageTemperature,
    apiRecommendations: input.apiRecommendations,
    idealCropsSummary: input.idealCropsSummary,
    offlineAvailable: input.offlineAvailable ?? true,
  };

  const store = await readStore();
  const withoutDup = store.entries.filter((e) => e.parcelId !== input.parcelId);
  store.entries = [entry, ...withoutDup]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_ENTRIES);
  await writeStore(store);
  return entry;
}

export async function listParcelSeasons(): Promise<ParcelSeasonSummary[]> {
  const store = await readStore();
  return [...store.entries].sort((a, b) => b.createdAt - a.createdAt);
}

function buildComparison(
  seasons: ParcelSeasonSummary[]
): ParcelHistoryGroup['comparison'] | undefined {
  if (seasons.length < 2) return undefined;
  const current = seasons[0];
  const previous = seasons[1];
  const scoreDelta =
    current.aptitudeScore != null && previous.aptitudeScore != null
      ? Math.round((current.aptitudeScore - previous.aptitudeScore) * 10) / 10
      : null;
  const rainfallDelta =
    current.annualRainfall != null && previous.annualRainfall != null
      ? Math.round(current.annualRainfall - previous.annualRainfall)
      : null;
  return { current, previous, scoreDelta, rainfallDelta };
}

export async function getParcelHistoryGroups(): Promise<ParcelHistoryGroup[]> {
  const entries = await listParcelSeasons();
  const byKey = new Map<string, ParcelSeasonSummary[]>();

  for (const e of entries) {
    const list = byKey.get(e.parcelStableKey) ?? [];
    list.push(e);
    byKey.set(e.parcelStableKey, list);
  }

  const groups: ParcelHistoryGroup[] = [];
  for (const [, seasons] of byKey) {
    const sorted = [...seasons].sort((a, b) => b.createdAt - a.createdAt);
    const latest = sorted[0];
    groups.push({
      parcelStableKey: latest.parcelStableKey,
      locationName: latest.locationName,
      lat: latest.lat,
      lng: latest.lng,
      seasons: sorted,
      comparison: buildComparison(sorted),
    });
  }

  return groups.sort((a, b) => b.seasons[0].createdAt - a.seasons[0].createdAt);
}

/** Dernière saison pour une parcelle stable (accueil). */
export async function getLatestGroupWithComparison(): Promise<ParcelHistoryGroup | null> {
  const groups = await getParcelHistoryGroups();
  return groups[0] ?? null;
}

export function seasonSummaryFromLastReport(
  report: LastReportSnapshot,
  extras?: Partial<AppendSeasonInput>
): AppendSeasonInput {
  return {
    parcelId: report.parcelId,
    locationName: report.locationName,
    crops: report.crops,
    surfaceHa: report.surfaceHa,
    lat: report.lat,
    lng: report.lng,
    createdAt: report.createdAt,
    topCropKey: report.topCropKey,
    topCropName: report.topCropName,
    aptitudeScore: report.aptitudeScore,
    soilTexture: report.soilTexture,
    ph: report.ph,
    harvestLabel: report.harvestLabel,
    ...extras,
  };
}
