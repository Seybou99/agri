/**
 * Kindwise Crop.health (Plant.id crop) — identification maladies
 * @see https://crop.kindwise.com/docs
 * @see https://documenter.getpostman.com/view/24599534/2s93z5A4v2
 */

import type { PlantNetImageInput } from './plantnetDiseases';

const CROP_HEALTH_BASE = 'https://crop.kindwise.com/api/v1';

export interface UnifiedDiseaseMatch {
  name: string;
  score: number;
  description?: string;
  label?: string;
  images?: Array<{ url?: { m?: string; s?: string }; citation?: string }>;
}

export interface UnifiedDiseaseResponse {
  provider: 'plantnet' | 'kindwise';
  results: UnifiedDiseaseMatch[];
  language?: string;
  version?: string;
  remainingIdentificationRequests?: number;
  remainingCredits?: number;
  fallbackUsed?: boolean;
}

function toDataUri(img: PlantNetImageInput): string {
  if (img.base64.startsWith('data:')) return img.base64;
  const mime = img.mimeType ?? 'image/jpeg';
  return `data:${mime};base64,${img.base64}`;
}

function pickLabel(details: Record<string, unknown> | undefined, fallback: string): string {
  if (!details) return fallback;
  const cn = details.common_names;
  if (Array.isArray(cn) && cn[0]) return String(cn[0]);
  if (cn && typeof cn === 'object') {
    const first = Object.values(cn as Record<string, string[]>).flat()[0];
    if (first) return String(first);
  }
  return fallback;
}

function mapKindwiseSuggestions(data: Record<string, unknown>): UnifiedDiseaseMatch[] {
  const result = data.result as Record<string, unknown> | undefined;
  const disease = result?.disease as Record<string, unknown> | undefined;
  const suggestions = (disease?.suggestions as Array<Record<string, unknown>>) ?? [];

  return suggestions.slice(0, 5).map((s) => {
    const details = (s.details as Record<string, unknown>) ?? {};
    const name = String(s.name ?? s.id ?? 'Inconnu');
    const similar = (s.similar_images as Array<Record<string, unknown>>) ?? [];
    const images = similar
      .map((sim) => {
        const url = sim.url as Record<string, string> | undefined;
        if (!url?.m && !url?.s) return null;
        return {
          url: { m: url.m, s: url.s },
          citation: sim.citation ? String(sim.citation) : undefined,
        };
      })
      .filter(Boolean) as UnifiedDiseaseMatch['images'];

    const desc =
      (details.description ? String(details.description) : '') ||
      (details.wiki_description ? String(details.wiki_description) : '') ||
      (details.symptoms ? String(details.symptoms) : '');

    return {
      name: String(details.eppo_code ?? s.id ?? name),
      score: Number(s.probability ?? 0),
      label: pickLabel(details, name),
      description: desc || name,
      images: images?.length ? images : undefined,
    };
  });
}

export async function identifyWithKindwiseCropHealth(
  images: PlantNetImageInput[]
): Promise<UnifiedDiseaseResponse> {
  const apiKey =
    process.env.PLANT_ID_API_KEY ??
    process.env.KINDWISE_API_KEY ??
    process.env.CROP_HEALTH_API_KEY;
  if (!apiKey) {
    throw new Error('PLANT_ID_API_KEY non configurée sur le serveur (Kindwise Crop.health).');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Api-Key': apiKey,
  };

  const createRes = await fetch(`${CROP_HEALTH_BASE}/identification`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      images: images.map(toDataUri),
      similar_images: true,
    }),
  });

  const createText = await createRes.text();
  let created: Record<string, unknown>;
  try {
    created = JSON.parse(createText) as Record<string, unknown>;
  } catch {
    throw new Error(`Réponse Kindwise invalide: ${createText.slice(0, 200)}`);
  }

  if (!createRes.ok) {
    if (createRes.status === 429) {
      throw new Error('Quota Kindwise Crop.health épuisé (100 crédits/jour). Réessayez demain.');
    }
    throw new Error(
      `Kindwise erreur ${createRes.status}: ${JSON.stringify(created).slice(0, 300)}`
    );
  }

  const accessToken = created.access_token ? String(created.access_token) : '';
  let fullData = created;

  if (accessToken) {
    const detailUrl = new URL(`${CROP_HEALTH_BASE}/identification/${accessToken}`);
    detailUrl.searchParams.set('language', 'fr');
    detailUrl.searchParams.set(
      'details',
      'common_names,description,symptoms,treatment,eppo_code'
    );

    const detailRes = await fetch(detailUrl.toString(), { headers: { 'Api-Key': apiKey } });
    if (detailRes.ok) {
      fullData = (await detailRes.json()) as Record<string, unknown>;
    }
  }

  let remainingCredits: number | undefined;
  try {
    const usageRes = await fetch(`${CROP_HEALTH_BASE}/usage_info`, {
      headers: { 'Api-Key': apiKey },
    });
    if (usageRes.ok) {
      const usage = (await usageRes.json()) as Record<string, unknown>;
      const remaining = usage.remaining as Record<string, unknown> | undefined;
      if (remaining?.total != null) {
        remainingCredits = Number(remaining.total);
      } else if (usage.remaining_credits != null) {
        remainingCredits = Number(usage.remaining_credits);
      }
    }
  } catch {
    /* usage_info optionnel */
  }

  return {
    provider: 'kindwise',
    results: mapKindwiseSuggestions(fullData),
    language: 'fr',
    version: 'crop.kindwise.com/api/v1',
    remainingCredits,
    fallbackUsed: true,
  };
}
