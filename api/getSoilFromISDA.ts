/**
 * Vercel Serverless Function — iSDAsoil (Afrique, 30 m)
 * Endpoint: GET /api/getSoilFromISDA?lat=12.63&lng=-7.92
 * Env : ISDA_USERNAME, ISDA_PASSWORD
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchSoilFromISDA } from '../functions/src/isdaSoilVercel';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const latStr = (req.query.lat || req.body?.lat) as string | undefined;
  const lngStr = (req.query.lng || req.body?.lng) as string | undefined;

  if (!latStr || !lngStr) {
    return res.status(400).json({
      error: 'Paramètres invalides',
      message: 'Fournir lat et lng. Ex. ?lat=12.63&lng=-7.92',
    });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({
      error: 'Coordonnées invalides',
      message: 'lat entre -90 et 90, lng entre -180 et 180',
    });
  }

  try {
    const soil = await fetchSoilFromISDA(lat, lng);
    return res.status(200).json(soil);
  } catch (e) {
    console.error('getSoilFromISDA error:', e);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: e instanceof Error ? e.message : 'Erreur inconnue',
    });
  }
}
