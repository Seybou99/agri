/**
 * Vercel Serverless Function - Google Earth Engine SoilGrids
 * Endpoint: /api/getSoilFromGEE?lat=12.63&lng=-7.92
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchSoilFromGEE } from '../functions/src/geeSoilVercel';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Extraire lat/lng
  const latStr = (req.query.lat || req.body?.lat) as string | undefined;
  const lngStr = (req.query.lng || req.body?.lng) as string | undefined;

  if (!latStr || !lngStr) {
    return res.status(400).json({
      error: 'Paramètres invalides',
      message: 'Fournir lat et lng (query ou body). Ex. ?lat=12.63&lng=-7.92',
    });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({
      error: 'Coordonnées invalides',
      message: 'lat doit être entre -90 et 90, lng entre -180 et 180',
    });
  }

  try {
    const soil = await fetchSoilFromGEE(lat, lng);
    return res.status(200).json(soil);
  } catch (e) {
    console.error('getSoilFromGEE error:', e);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: e instanceof Error ? e.message : 'Erreur inconnue',
    });
  }
}
