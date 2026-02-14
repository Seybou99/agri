/**
 * CORS pour les routes API v1 (Phase 1)
 */

import type { VercelResponse } from '@vercel/node';

export function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function handleOptions(res: VercelResponse): boolean {
  setCorsHeaders(res);
  return true;
}
