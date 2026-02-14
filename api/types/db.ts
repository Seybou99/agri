/**
 * Types partagés pour l'API Phase 1 (Users, Fields, Diagnostics, Orders)
 * À aligner avec docs/DB_SCHEMA.sql
 */

export interface User {
  id: string;
  telephone: string;
  langue: string;
  role: 'user' | 'vendeur' | 'agent';
  localisation?: { lat: number; lng: number; name?: string };
  createdAt: string;
  updatedAt: string;
}

export interface Field {
  id: string;
  user_id: string;
  gps: { lat: number; lng: number };
  surface_ha: number;
  sol_type?: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Diagnostic {
  id: string;
  field_id?: string;
  lat: number;
  lng: number;
  locationName?: string;
  crops: string[];
  surface_ha: number;
  score: number;
  cultures_recommendations: Record<string, number>;
  recommendations: string[];
  soil?: Record<string, number>;
  climate?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: 'pending' | 'paid' | 'preparing' | 'delivered' | 'cancelled';
  payment?: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  seller_id: string;
  category: string;
  price: number;
  unit: string;
  location?: { lat: number; lng: number; name?: string };
  stock: number;
  photos?: string[];
  audio_url?: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
