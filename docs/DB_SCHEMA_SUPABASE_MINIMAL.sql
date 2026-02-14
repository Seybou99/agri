-- Schéma minimal pour brancher les diagnostics sur Supabase (sans users/fields)
-- À exécuter dans Supabase : SQL Editor → New query → Coller et Run

-- Table diagnostics seule (field_id optionnel, pas de FK pour démarrer)
CREATE TABLE IF NOT EXISTS diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NULL,
  lat DECIMAL(10,6) NOT NULL,
  lng DECIMAL(10,6) NOT NULL,
  location_name VARCHAR(255),
  crops TEXT[] NOT NULL DEFAULT '{}',
  surface_ha DECIMAL(10,2) NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  cultures_recommendations JSONB NOT NULL DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  soil JSONB,
  climate JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnostics_created_at ON diagnostics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnostics_lat_lng ON diagnostics(lat, lng);

-- RLS (Row Level Security) : désactivé pour l'API avec service_role
-- Si vous activez RLS plus tard, ajoutez des policies pour l'accès.

COMMENT ON TABLE diagnostics IS 'Diagnostics de parcelles SeneGundo (Phase 1)';
