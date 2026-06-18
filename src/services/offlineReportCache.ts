/**
 * Cache offline des rapports complets (sol, climat, scores, recommandations).
 */
import * as FileSystem from 'expo-file-system/legacy';
import type { OfflineCachedReport } from '@models/ParcelHistory';

const INDEX_FILE = 'senegundo-offline-reports.json';
const MAX_CACHED_REPORTS = 40;

interface OfflineReportIndex {
  version: 1;
  byParcelId: Record<string, OfflineCachedReport>;
  order: string[];
}

function getIndexPath(): string | null {
  const dir = FileSystem.documentDirectory;
  return dir ? `${dir}${INDEX_FILE}` : null;
}

async function readIndex(): Promise<OfflineReportIndex> {
  const path = getIndexPath();
  if (!path) return { version: 1, byParcelId: {}, order: [] };
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return { version: 1, byParcelId: {}, order: [] };
    const raw = await FileSystem.readAsStringAsync(path);
    const data = JSON.parse(raw) as OfflineReportIndex;
    if (data?.version !== 1 || !data.byParcelId) {
      return { version: 1, byParcelId: {}, order: [] };
    }
    return data;
  } catch {
    return { version: 1, byParcelId: {}, order: [] };
  }
}

async function writeIndex(index: OfflineReportIndex): Promise<void> {
  const path = getIndexPath();
  if (!path) return;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(index));
}

export async function saveOfflineReport(report: OfflineCachedReport): Promise<void> {
  const index = await readIndex();
  index.byParcelId[report.parcelId] = report;
  index.order = [report.parcelId, ...index.order.filter((id) => id !== report.parcelId)].slice(
    0,
    MAX_CACHED_REPORTS
  );
  const allowed = new Set(index.order);
  for (const id of Object.keys(index.byParcelId)) {
    if (!allowed.has(id)) delete index.byParcelId[id];
  }
  await writeIndex(index);
}

export async function loadOfflineReport(parcelId: string): Promise<OfflineCachedReport | null> {
  const index = await readIndex();
  const report = index.byParcelId[parcelId];
  if (!report?.parcelId) return null;
  return report;
}

export async function listOfflineReportIds(): Promise<string[]> {
  const index = await readIndex();
  return index.order;
}
