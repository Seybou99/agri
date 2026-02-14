/**
 * GET /api/v1/cultures/:id — Détail d'une culture (ex. /api/v1/cultures/oignon)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../lib/cors';
import { getCultureById } from '../../data/cultures';

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

  const id = req.query.id as string;
  if (!id) {
    res.status(400).json({ error: 'Paramètre id requis' });
    return;
  }

  const culture = getCultureById(id);
  if (!culture) {
    res.status(404).json({ error: 'Culture non trouvée' });
    return;
  }

  res.status(200).json({
    ...culture,
    description: culture.description ?? `Culture ${culture.categorie} pratiquée au Mali.`,
  });
}
