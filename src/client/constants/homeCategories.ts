import type { ImageSourcePropType } from 'react-native';
import type { MarketplaceRayon } from '@models/Product';

export type HomeCategoryId =
  | 'restaurants'
  | 'courses'
  | 'boutiques'
  | 'parapharmacie'
  | 'coursier';

export interface HomeCategory {
  id: HomeCategoryId;
  label: string;
  /** Libellé sur 2 lignes (pilule maquette). */
  labelLines?: [string, string];
  image: ImageSourcePropType;
  size: 'large' | 'small';
  rayon?: MarketplaceRayon;
}

export const HOME_CATEGORIES: HomeCategory[] = [
  {
    id: 'restaurants',
    label: 'Restaurants',
    image: require('../../../assets/image/1.webp'),
    size: 'large',
    rayon: 'PRODUITS_FERME',
  },
  {
    id: 'courses',
    label: 'Courses',
    image: require('../../../assets/image/2.webp'),
    size: 'large',
    rayon: 'INTRANTS_EQUIPEMENTS',
  },
  {
    id: 'boutiques',
    label: 'Boutiques',
    image: require('../../../assets/image/3.webp'),
    size: 'small',
  },
  {
    id: 'parapharmacie',
    label: 'Parapharmacies & Beauté',
    labelLines: ['Parapharmacies', '& Beauté'],
    image: require('../../../assets/image/4.webp'),
    size: 'small',
  },
  {
    id: 'coursier',
    label: 'Service Coursier',
    image: require('../../../assets/image/5.webp'),
    size: 'small',
  },
];

export interface FeaturedBrand {
  id: string;
  name: string;
  logoText: string;
  subLabel?: string;
  accentColor?: string;
}

/** 2 pages × 4 marques — carrousel paginé (maquette). */
export const FEATURED_BRANDS: FeaturedBrand[] = [
  { id: '1', name: 'Pizza Hut', logoText: '🍕', subLabel: 'Pizza Hut' },
  { id: '2', name: 'KFC', logoText: 'KFC', subLabel: 'KFC', accentColor: '#E4002B' },
  { id: '3', name: 'Flormar', logoText: 'FM', subLabel: 'Flormar', accentColor: '#C2185B' },
  { id: '4', name: 'Marjane', logoText: 'M', subLabel: 'Marjane', accentColor: '#F57C00' },
  { id: '5', name: 'Little Mamma', logoText: 'LM', subLabel: 'Little Mamma' },
  { id: '6', name: 'Burger King', logoText: 'BK', subLabel: 'Burger King' },
  { id: '7', name: 'Carrefour', logoText: 'C', subLabel: 'Carrefour', accentColor: '#0055A4' },
  { id: '8', name: 'Atacadao', logoText: 'A', subLabel: 'Atacadao' },
];
