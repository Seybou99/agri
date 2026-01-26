/**
 * Cloud Functions SeneGundo
 * - getSoilFromGEE : données sol (SoilGrids) via Google Earth Engine pour un point lat/lng
 */

import * as functions from 'firebase-functions';
import { fetchSoilFromGEE, type GEESoilResult } from './geeSoil';

/**
 * GET ou POST ?lat=12.63&lng=-7.92
 * Retourne JSON { ph, clay, sand, silt, organicCarbon, nitrogen, texture, ... }
 */
export const getSoilFromGEE = functions.https.onRequest(async (req: any, res: any) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  let lat: number;
  let lng: number;

  if (req.method === 'POST' && req.body && typeof req.body.lat === 'number' && typeof req.body.lng === 'number') {
    lat = req.body.lat;
    lng = req.body.lng;
  } else {
    const latStr = (req.query.lat ?? req.body?.lat) as string | undefined;
    const lngStr = (req.query.lng ?? req.body?.lng) as string | undefined;
    lat = parseFloat(latStr ?? '');
    lng = parseFloat(lngStr ?? '');
  }

  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({
      error: 'Paramètres invalides',
      message: 'Fournir lat et lng (query ou body). Ex. ?lat=12.63&lng=-7.92',
    });
    return;
  }

  try {
    const soil: GEESoilResult = await fetchSoilFromGEE(lat, lng);
    res.status(200).json(soil);
  } catch (e) {
    console.error('getSoilFromGEE error:', e);
    res.status(500).json({
      error: 'Erreur serveur',
      message: e instanceof Error ? e.message : 'Erreur inconnue',
    });
  }
});
