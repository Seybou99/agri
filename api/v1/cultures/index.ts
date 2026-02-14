/**
 * GET /api/v1/cultures — Liste des cultures Mali (filtres: categorie, rentable, irrigué)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../lib/cors';
import { filterCultures } from '../../data/cultures';

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

  const categorie = req.query.categorie as string | undefined;
  const rentable = req.query.rentable === 'true' ? true : req.query.rentable === 'false' ? false : undefined;
  const irrigue = req.query.irrigué === 'true' || req.query.irrigue === 'true' ? true : undefined;

  const data = filterCultures({ categorie, rentable, irrigue });
  res.status(200).json({
    count: data.length,
    data,
  });
}
