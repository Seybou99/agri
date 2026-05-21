/**
 * Proxy Pl@ntNet — identification de maladies (clé API côté serveur uniquement).
 * @see https://my.plantnet.org/doc/api/diseases
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from './cors';

export interface PlantNetImageInput {
  base64: string;
  mimeType?: string;
}

export async function handlePlantNetDiseasesIdentify(
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

  const apiKey = process.env.PLANTNET_API_KEY ?? process.env.PLANTNET_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'Configuration serveur',
      message: 'Ajoutez PLANTNET_API_KEY dans les variables Vercel.',
    });
    return;
  }

  const body = req.body as { images?: PlantNetImageInput[] } | undefined;
  const images = body?.images;

  if (!Array.isArray(images) || images.length === 0) {
    res.status(400).json({ error: 'Au moins une image est requise.' });
    return;
  }
  if (images.length > 5) {
    res.status(400).json({ error: 'Maximum 5 images par requête (Pl@ntNet).' });
    return;
  }

  try {
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

    const plantNetRes = await fetch(url.toString(), {
      method: 'POST',
      body: form,
    });

    const rawText = await plantNetRes.text();
    let payload: unknown;
    try {
      payload = JSON.parse(rawText) as unknown;
    } catch {
      res.status(502).json({
        error: 'Réponse Pl@ntNet invalide',
        detail: rawText.slice(0, 300),
      });
      return;
    }

    if (!plantNetRes.ok) {
      res.status(plantNetRes.status >= 400 ? plantNetRes.status : 502).json({
        error: 'Erreur Pl@ntNet',
        detail: payload,
      });
      return;
    }

    res.status(200).json(payload);
  } catch (e) {
    console.error('plantnet diseases:', e);
    res.status(500).json({
      error: 'Erreur serveur',
      message: e instanceof Error ? e.message : 'Erreur inconnue',
    });
  }
}
