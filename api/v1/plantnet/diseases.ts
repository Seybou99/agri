/**
 * POST /api/v1/plantnet/diseases — route dédiée (le catch-all [...slug] ne matche pas toujours 2 segments sur Vercel).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../lib/cors';
import { handlePlantDiseaseIdentify } from '../../lib/plantDiseaseIdentify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
  }
  await handlePlantDiseaseIdentify(req, res);
}
