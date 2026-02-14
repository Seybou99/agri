/**
 * Handler unique pour rester sous la limite de 12 fonctions (plan Hobby Vercel).
 * Routes : GET /api/v1/cultures, GET /api/v1/cultures/:id, GET /api/v1/calendar,
 *         GET /api/v1/profitability, GET /api/v1/icons, POST /api/v1/recommendations.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../lib/cors';
import {
  CULTURES,
  CALENDAR,
  PROFITABILITY,
  ICONS,
  filterCultures,
  getCultureById,
} from '../data/cultures';

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

  const slug = (req.query.slug as string[]) ?? [];
  const [segment, segment2] = slug;

  // GET /api/v1/cultures (liste)
  if (segment === 'cultures' && segment2 === undefined && req.method === 'GET') {
    const categorie = req.query.categorie as string | undefined;
    const rentable = req.query.rentable === 'true' ? true : req.query.rentable === 'false' ? false : undefined;
    const irrigue = req.query.irrigué === 'true' || req.query.irrigue === 'true' ? true : undefined;
    const data = filterCultures({ categorie, rentable, irrigue });
    return res.status(200).json({ count: data.length, data });
  }

  // GET /api/v1/cultures/:id (détail)
  if (segment === 'cultures' && segment2 && req.method === 'GET') {
    const culture = getCultureById(segment2);
    if (!culture) return res.status(404).json({ error: 'Culture non trouvée' });
    return res.status(200).json({
      ...culture,
      description: culture.description ?? `Culture ${culture.categorie} pratiquée au Mali.`,
    });
  }

  // GET /api/v1/calendar?culture=mais
  if (segment === 'calendar' && req.method === 'GET') {
    const cultureId = (req.query.culture as string)?.toLowerCase()?.trim();
    if (!cultureId) {
      return res.status(400).json({
        error: 'Paramètre culture requis. Ex: ?culture=mais',
        cultures_disponibles: Object.keys(CALENDAR),
      });
    }
    const etapes = CALENDAR[cultureId];
    const culture = getCultureById(cultureId);
    if (!etapes) {
      return res.status(404).json({
        error: 'Calendrier non trouvé pour cette culture',
        culture: cultureId,
        cultures_disponibles: Object.keys(CALENDAR),
      });
    }
    return res.status(200).json({
      culture: culture?.nom ?? cultureId,
      culture_id: cultureId,
      saison: cultureId === 'oignon' || cultureId === 'tomate' ? 'Contre-saison / irrigué' : 'Hivernage',
      etapes,
    });
  }

  // GET /api/v1/profitability
  if (segment === 'profitability' && req.method === 'GET') {
    return res.status(200).json({
      devise: 'EUR',
      source: 'Indicatif Mali (Office du Niger, Sikasso, projets agricoles)',
      data: PROFITABILITY,
    });
  }

  // GET /api/v1/icons
  if (segment === 'icons' && req.method === 'GET') {
    return res.status(200).json({ data: ICONS });
  }

  // POST /api/v1/recommendations (et GET pour compat)
  if (segment === 'recommendations' && (req.method === 'POST' || req.method === 'GET')) {
    const body = req.method === 'POST' ? req.body : req.query;
    const sol_type = (body?.sol_type as string) ?? undefined;
    const pluviometrie_mm = body?.pluviometrie_mm != null ? Number(body.pluviometrie_mm) : undefined;
    const irrigation = body?.irrigation === true || body?.irrigation === 'true';
    const region = (body?.region as string) ?? undefined;
    const cultures_recommandees = CULTURES.map((c) => ({
      culture: c.nom,
      culture_id: c.id,
      score: simpleScore(sol_type, pluviometrie_mm, irrigation, region, c),
    })).sort((a, b) => b.score - a.score);
    return res.status(200).json({
      cultures_recommandees,
      criteres: { sol_type, pluviometrie_mm, irrigation, region },
    });
  }

  res.status(404).json({
    error: 'Route non trouvée',
    path: slug.join('/'),
  });
}
