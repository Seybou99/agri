/**
 * Orchestration diagnostic maladies : Pl@ntNet puis Kindwise Crop.health si quota épuisé.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from './cors';
import type { PlantNetImageInput } from './plantnetDiseases';
import { identifyWithKindwiseCropHealth, type UnifiedDiseaseResponse } from './kindwiseCropHealth';

function isPlantNetQuotaExceeded(status: number, payload: unknown): boolean {
  if (status === 429 || status === 402) return true;
  const text = JSON.stringify(payload ?? {}).toLowerCase();
  if (
    text.includes('quota') ||
    text.includes('limit') ||
    text.includes('credit') ||
    text.includes('exceeded')
  ) {
    return true;
  }
  const p = payload as Record<string, unknown>;
  if (
    typeof p.remainingIdentificationRequests === 'number' &&
    p.remainingIdentificationRequests <= 0 &&
    status !== 200
  ) {
    return true;
  }
  return false;
}

function mapPlantNetPayload(payload: Record<string, unknown>): UnifiedDiseaseResponse {
  const rawResults = (payload.results as Array<Record<string, unknown>>) ?? [];
  return {
    provider: 'plantnet',
    results: rawResults.map((r) => ({
      name: String(r.name ?? ''),
      score: Number(r.score ?? 0),
      description: r.description ? String(r.description) : undefined,
      label: r.label ? String(r.label) : undefined,
      images: Array.isArray(r.images)
        ? (r.images as UnifiedDiseaseResponse['results'][0]['images'])
        : undefined,
    })),
    language: payload.language ? String(payload.language) : undefined,
    version: payload.version ? String(payload.version) : undefined,
    remainingIdentificationRequests:
      payload.remainingIdentificationRequests != null
        ? Number(payload.remainingIdentificationRequests)
        : undefined,
    fallbackUsed: false,
  };
}

async function tryPlantNet(
  images: PlantNetImageInput[]
): Promise<{ ok: true; data: UnifiedDiseaseResponse } | { ok: false; quotaExceeded: boolean; detail?: unknown }> {
  const apiKey = process.env.PLANTNET_API_KEY ?? process.env.PLANTNET_KEY;
  if (!apiKey) {
    return { ok: false, quotaExceeded: true };
  }

  const form = new FormData();
  for (const img of images) {
    const raw = img.base64.includes(',') ? img.base64.split(',')[1]! : img.base64;
    const mimeType = img.mimeType ?? 'image/jpeg';
    const buffer = Buffer.from(raw, 'base64');
    const ext = mimeType === 'image/png' ? 'png' : 'jpg';
    const blob = new Blob([buffer], { type: mimeType });
    form.append('images', blob, `plant.${ext}`);
    form.append('organs', 'auto');
  }

  const url = new URL('https://my-api.plantnet.org/v2/diseases/identify');
  url.searchParams.set('lang', 'fr');
  url.searchParams.set('include-related-images', 'true');
  url.searchParams.set('nb-results', '5');
  url.searchParams.set('api-key', apiKey);

  const plantNetRes = await fetch(url.toString(), { method: 'POST', body: form });
  const rawText = await plantNetRes.text();
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawText) as Record<string, unknown>;
  } catch {
    return { ok: false, quotaExceeded: false, detail: rawText.slice(0, 300) };
  }

  if (!plantNetRes.ok) {
    return {
      ok: false,
      quotaExceeded: isPlantNetQuotaExceeded(plantNetRes.status, payload),
      detail: payload,
    };
  }

  return { ok: true, data: mapPlantNetPayload(payload) };
}

export async function handlePlantDiseaseIdentify(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Méthode non autorisée' });
    return;
  }

  const body = req.body as { images?: PlantNetImageInput[] } | undefined;
  const images = body?.images;

  if (!Array.isArray(images) || images.length === 0) {
    res.status(400).json({ error: 'Au moins une image est requise.' });
    return;
  }
  if (images.length > 5) {
    res.status(400).json({ error: 'Maximum 5 images par requête.' });
    return;
  }

  try {
    const plantNet = await tryPlantNet(images);

    if (plantNet.ok) {
      res.status(200).json(plantNet.data);
      return;
    }

    if (plantNet.quotaExceeded) {
      try {
        const kindwise = await identifyWithKindwiseCropHealth(images);
        res.status(200).json(kindwise);
        return;
      } catch (kindwiseErr) {
        res.status(503).json({
          error: 'Quotas épuisés',
          message:
            'Pl@ntNet : quota journalier atteint. Kindwise : ' +
            (kindwiseErr instanceof Error ? kindwiseErr.message : 'indisponible'),
          plantnetDetail: plantNet.detail,
        });
        return;
      }
    }

    res.status(502).json({
      error: 'Erreur Pl@ntNet',
      detail: plantNet.detail,
    });
  } catch (e) {
    console.error('plant disease identify:', e);
    res.status(500).json({
      error: 'Erreur serveur',
      message: e instanceof Error ? e.message : 'Erreur inconnue',
    });
  }
}
