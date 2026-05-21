import type { MarketplaceRayon, ProductCategory } from '@models/Product';

export const CATEGORIES_BY_RAYON: Record<MarketplaceRayon, ProductCategory[]> = {
  INTRANTS_EQUIPEMENTS: ['Semences', 'Engrais', 'Outils', 'Irrigation'],
  PRODUITS_FERME: ['Légumes', 'Fruits', 'Céréales'],
  ELEVAGE: ['Bovins', 'Ovins', 'Caprins', 'Volaille', 'Services_Veterinaires'],
};

export const MARKETPLACE_UNITS = ['kg', 'sac', 'sachet', 'unité', 'kit', 'tête', 'litre'] as const;

export const DELIVERY_OPTION_LABELS: Record<
  'click_and_collect' | 'delivery' | 'pickup',
  string
> = {
  click_and_collect: 'Retrait sur place',
  delivery: 'Livraison',
  pickup: 'Enlèvement ferme',
};
