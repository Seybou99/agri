/**
 * Client SeneGundo → proxy Vercel → Pl@ntNet + fallback Kindwise Crop.health
 * @see https://my.plantnet.org/doc/api/diseases
 * @see https://crop.kindwise.com/docs
 */

import { API_URL } from 'react-native-dotenv';
import type { PlantDiseaseIdentifyResult, PlantDiseaseMatch } from '@models/PlantDisease';

function getApiBase(): string | null {
  const url = typeof API_URL === 'string' && API_URL && !API_URL.includes('example.com')
    ? API_URL.trim()
    : null;
  return url ? url.replace(/\/$/, '') : null;
}

export interface DiseaseImagePayload {
  base64: string;
  mimeType: string;
}

export async function identifyPlantDiseases(
  images: DiseaseImagePayload[]
): Promise<PlantDiseaseIdentifyResult> {
  const base = getApiBase();
  if (!base) {
    throw new Error(
      'Configurez API_URL dans .env (URL Vercel) pour activer le diagnostic maladies.'
    );
  }
  if (images.length === 0) {
    throw new Error('Ajoutez au moins une photo de la plante.');
  }

  const res = await fetch(`${base}/api/v1/plantnet/diseases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images }),
  });

  const json = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    const msg =
      (json.message as string) ??
      (json.error as string) ??
      `Erreur serveur (${res.status})`;
    throw new Error(msg);
  }

  const rawResults = (json.results as Array<Record<string, unknown>>) ?? [];
  const results: PlantDiseaseMatch[] = rawResults.map((r) => ({
    name: String(r.name ?? ''),
    score: Number(r.score ?? 0),
    description: r.description ? String(r.description) : undefined,
    label: r.label ? String(r.label) : undefined,
    images: Array.isArray(r.images)
      ? (r.images as PlantDiseaseMatch['images'])
      : undefined,
  }));

  return {
    results,
    provider: json.provider as PlantDiseaseIdentifyResult['provider'],
    language: json.language ? String(json.language) : undefined,
    version: json.version ? String(json.version) : undefined,
    remainingIdentificationRequests:
      json.remainingIdentificationRequests != null
        ? Number(json.remainingIdentificationRequests)
        : undefined,
    remainingCredits:
      json.remainingCredits != null ? Number(json.remainingCredits) : undefined,
    fallbackUsed: Boolean(json.fallbackUsed),
    query: json.query as Record<string, unknown> | undefined,
  };
}

export function getProviderLabel(provider?: PlantDiseaseIdentifyResult['provider']): string {
  if (provider === 'kindwise') return 'Crop.health (Kindwise)';
  return 'Pl@ntNet';
}
