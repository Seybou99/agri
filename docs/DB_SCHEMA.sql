-- Phase 1 — Schéma de référence pour PostgreSQL / Supabase
-- À exécuter lors de la connexion d'une base réelle

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telephone VARCHAR(20) NOT NULL UNIQUE,
  langue VARCHAR(10) DEFAULT 'fr',
  role VARCHAR(20) DEFAULT 'user',
  localisation JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parcelles
CREATE TABLE IF NOT EXISTS fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gps JSONB NOT NULL,
  surface_ha DECIMAL(10,2) NOT NULL,
  sol_type VARCHAR(50),
  name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fields_gps ON fields USING GIN (gps);
CREATE INDEX IF NOT EXISTS idx_fields_user_id ON fields(user_id);

-- Diagnostics
CREATE TABLE IF NOT EXISTS diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
  lat DECIMAL(10,6) NOT NULL,
  lng DECIMAL(10,6) NOT NULL,
  location_name VARCHAR(255),
  crops TEXT[] NOT NULL,
  surface_ha DECIMAL(10,2) NOT NULL,
  score INTEGER NOT NULL,
  cultures_recommendations JSONB NOT NULL,
  recommendations TEXT[],
  soil JSONB,
  climate JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnostics_field_id ON diagnostics(field_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_created_at ON diagnostics(created_at DESC);

-- Commandes
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  payment VARCHAR(50),
  total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at_status ON orders(created_at DESC, status);

-- Produits (marketplace)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  unit VARCHAR(30) NOT NULL,
  location JSONB,
  stock INTEGER NOT NULL DEFAULT 0,
  photos TEXT[],
  audio_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
