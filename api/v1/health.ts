/**
 * GET /api/v1/health — Santé de l'API (Phase 1)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions } from '../lib/cors';

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
    status: 'ok',
    version: '1',
    service: 'SeneGundo API',
    timestamp: new Date().toISOString(),
  });
}
