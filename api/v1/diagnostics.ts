/**
 * POST /api/v1/diagnostics — Enregistrer un diagnostic (Phase 1)
 * GET  /api/v1/diagnostics?id=xxx — Récupérer un diagnostic par id
 * Persistance : Supabase (PostgreSQL) si configuré, sinon mémoire.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../lib/cors';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import type { Diagnostic } from '../types/db';

const store = new Map<string, Diagnostic>();

function generateId(): string {
  return 'diag_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
}

function rowToDiagnostic(row: Record<string, unknown>): Diagnostic {
  return {
    id: String(row.id),
    field_id: row.field_id != null ? String(row.field_id) : undefined,
    lat: Number(row.lat),
    lng: Number(row.lng),
    locationName: row.location_name != null ? String(row.location_name) : undefined,
    crops: Array.isArray(row.crops) ? row.crops.map(String) : [],
    surface_ha: Number(row.surface_ha) || 0,
    score: Number(row.score) ?? 0,
    cultures_recommendations: (row.cultures_recommendations as Record<string, number>) ?? {},
    recommendations: Array.isArray(row.recommendations) ? row.recommendations.map(String) : [],
    soil: row.soil as Record<string, number> | undefined,
    climate: row.climate as Record<string, unknown> | undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const supabase = getSupabase();

  if (req.method === 'GET') {
    const id = req.query.id as string | undefined;
    if (!id) {
      res.status(400).json({ error: 'Paramètre id requis. Ex. ?id=diag_xxx ou ?id=uuid' });
      return;
    }
    if (supabase) {
      const { data, error } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') {
          res.status(404).json({ error: 'Diagnostic non trouvé' });
          return;
        }
        console.error('Supabase GET diagnostics:', error);
        res.status(500).json({ error: 'Erreur base de données' });
        return;
      }
      res.status(200).json(rowToDiagnostic(data as Record<string, unknown>));
      return;
    }
    const diagnostic = store.get(id);
    if (!diagnostic) {
      res.status(404).json({ error: 'Diagnostic non trouvé' });
      return;
    }
    res.status(200).json(diagnostic);
    return;
  }

  if (req.method === 'POST') {
    const body = req.body as {
      lat: number;
      lng: number;
      locationName?: string;
      crops: string[];
      surface_ha: number;
      score?: number;
      cultures_recommendations?: Record<string, number>;
      recommendations?: string[];
      soil?: Record<string, number>;
      climate?: Record<string, unknown>;
    };
    if (!body || typeof body.lat !== 'number' || typeof body.lng !== 'number') {
      res.status(400).json({
        error: 'Body invalide',
        message: 'Fournir lat, lng, crops (array), surface_ha (number)',
      });
      return;
    }
    const now = new Date().toISOString();
    const payload = {
      lat: body.lat,
      lng: body.lng,
      location_name: body.locationName ?? null,
      crops: Array.isArray(body.crops) ? body.crops : [],
      surface_ha: Number(body.surface_ha) || 0,
      score: Number(body.score) ?? 0,
      cultures_recommendations: body.cultures_recommendations ?? {},
      recommendations: body.recommendations ?? [],
      soil: body.soil ?? null,
      climate: body.climate ?? null,
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('diagnostics')
        .insert(payload)
        .select('*')
        .single();
      if (error) {
        console.error('Supabase POST diagnostics:', error);
        res.status(500).json({
          error: 'Erreur base de données',
          message: error.message,
        });
        return;
      }
      const diagnostic = rowToDiagnostic(data as Record<string, unknown>);
      res.status(201).json(diagnostic);
      return;
    }

    const id = generateId();
    const diagnostic: Diagnostic = {
      id,
      lat: body.lat,
      lng: body.lng,
      locationName: body.locationName,
      crops: Array.isArray(body.crops) ? body.crops : [],
      surface_ha: Number(body.surface_ha) || 0,
      score: Number(body.score) ?? 0,
      cultures_recommendations: body.cultures_recommendations ?? {},
      recommendations: body.recommendations ?? [],
      soil: body.soil,
      climate: body.climate,
      createdAt: now,
      updatedAt: now,
    };
    store.set(id, diagnostic);
    res.status(201).json(diagnostic);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
