/**
 * GET /api/v1/calendar — Calendrier cultural (query: culture=mais | riz | oignon | tomate | arachide)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../lib/cors';
import { CALENDAR, getCultureById } from '../data/cultures';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const cultureId = (req.query.culture as string)?.toLowerCase()?.trim();
  if (!cultureId) {
    res.status(400).json({
      error: 'Paramètre culture requis. Ex: ?culture=mais',
      cultures_disponibles: Object.keys(CALENDAR),
    });
    return;
  }

  const etapes = CALENDAR[cultureId];
  const culture = getCultureById(cultureId);

  if (!etapes) {
    res.status(404).json({
      error: 'Calendrier non trouvé pour cette culture',
      culture: cultureId,
      cultures_disponibles: Object.keys(CALENDAR),
    });
    return;
  }

  res.status(200).json({
    culture: culture?.nom ?? cultureId,
    culture_id: cultureId,
    saison: cultureId === 'oignon' || cultureId === 'tomate' ? 'Contre-saison / irrigué' : 'Hivernage',
    etapes,
  });
}
