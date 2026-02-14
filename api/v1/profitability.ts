/**
 * GET /api/v1/profitability — Rentabilité par culture (Mali, revenus bruts / ha)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../lib/cors';
import { PROFITABILITY } from '../data/cultures';

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

  res.status(200).json({
    devise: 'EUR',
    source: 'Indicatif Mali (Office du Niger, Sikasso, projets agricoles)',
    data: PROFITABILITY,
  });
}
