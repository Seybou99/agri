/**
 * POST /api/v1/recommendations — Recommandations agronomiques (sol, pluviométrie, région)
 * Body: { sol_type?, pluviometrie_mm?, irrigation?: boolean, region? }
 * Response: cultures_recommandees avec score d'aptitude 0–100.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../lib/cors';
import { CULTURES } from '../data/cultures';

function simpleScore(
  solType: string | undefined,
  pluviometrieMm: number | undefined,
  irrigation: boolean | undefined,
  region: string | undefined,
  culture: (typeof CULTURES)[0]
): number {
  let score = 50;
  if (solType && culture.sols_adaptes?.length) {
    const solLower = solType.toLowerCase();
    const match = culture.sols_adaptes.some((s) => s.toLowerCase().includes(solLower) || solLower.includes(s.toLowerCase()));
    if (match) score += 25;
  }
  if (pluviometrieMm != null) {
    const need = culture.eau_besoin === 'élevé' ? 800 : culture.eau_besoin === 'moyen' ? 500 : 300;
    if (pluviometrieMm >= need * 0.8) score += 15;
    if (culture.irrigue && irrigation) score += 10;
  }
  if (region && culture.zones.length) {
    const r = region.toLowerCase();
    if (culture.zones.some((z) => z.toLowerCase().includes(r))) score += 10;
  }
  return Math.min(100, Math.round(score));
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.method === 'POST' ? req.body : req.query;
  const sol_type = (body?.sol_type as string) ?? undefined;
  const pluviometrie_mm = body?.pluviometrie_mm != null ? Number(body.pluviometrie_mm) : undefined;
  const irrigation = body?.irrigation === true || body?.irrigation === 'true';
  const region = (body?.region as string) ?? undefined;

  const cultures_recommandees = CULTURES.map((c) => ({
    culture: c.nom,
    culture_id: c.id,
    score: simpleScore(sol_type, pluviometrie_mm, irrigation, region, c),
  }))
    .sort((a, b) => b.score - a.score);

  res.status(200).json({
    cultures_recommandees,
    criteres: { sol_type, pluviometrie_mm, irrigation, region },
  });
}
