/**
 * Persistance locale du dernier rapport diagnostic (expo-file-system).
 */
import * as FileSystem from 'expo-file-system/legacy';

export interface LastReportSnapshot {
  parcelId: string;
  locationName: string;
  crops: string[];
  surfaceHa: number;
  lat: number;
  lng: number;
  createdAt: number;
  topCropKey?: string;
  topCropName?: string;
  /** Score 0–10 du meilleur match */
  aptitudeScore?: number;
  soilTexture?: string;
  ph?: number;
  harvestLabel?: string;
}

const FILE_NAME = 'senegundo-last-report.json';

function getFilePath(): string | null {
  const dir = FileSystem.documentDirectory;
  return dir ? `${dir}${FILE_NAME}` : null;
}

export async function saveLastReport(snapshot: LastReportSnapshot): Promise<void> {
  const path = getFilePath();
  if (!path) return;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(snapshot));
}

export async function loadLastReport(): Promise<LastReportSnapshot | null> {
  const path = getFilePath();
  if (!path) return null;
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(path);
    const data = JSON.parse(raw) as LastReportSnapshot;
    if (!data?.parcelId || !Array.isArray(data.crops)) return null;
    return data;
  } catch {
    return null;
  }
}

export async function patchLastReport(
  patch: Partial<LastReportSnapshot>
): Promise<LastReportSnapshot | null> {
  const current = await loadLastReport();
  if (!current) return null;
  const next = { ...current, ...patch };
  await saveLastReport(next);
  return next;
}
