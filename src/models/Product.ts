// Modèle Product pour la Marketplace

/**
 * Rayons du Marketplace SeneGundo
 * 1. INTRANTS_EQUIPEMENTS : Semences, engrais, outils (B2B)
 * 2. PRODUITS_FERME : Légumes, fruits, céréales (B2C)
 * 3. ELEVAGE : Bétail, investissement (Investissement)
 */
export type MarketplaceRayon = 
  | 'INTRANTS_EQUIPEMENTS'  // Rayon 1 : Intrants & Équipements
  | 'PRODUITS_FERME'         // Rayon 2 : Produits de la Ferme
  | 'ELEVAGE';               // Rayon 3 : Élevage

/**
 * Catégories détaillées par rayon
 */
export type ProductCategory = 
  // Rayon Intrants & Équipements
  | 'Semences'
  | 'Engrais'
  | 'Outils'
  | 'Irrigation'
  // Rayon Produits de la Ferme
  | 'Légumes'
  | 'Fruits'
  | 'Céréales'
  // Rayon Élevage
  | 'Bovins'
  | 'Ovins'
  | 'Caprins'
  | 'Volaille'
  | 'Services_Veterinaires';

export type DeliveryOption = 'click_and_collect' | 'delivery' | 'pickup';

export interface ProductLocation {
  geopoint: {
    latitude: number;
    longitude: number;
  };
  name: string; // Nom du point de retrait
  address?: string;
}

export interface MarketplaceProduct {
  id: string;
  farmerId: string;
  productName: string;
  rayon: MarketplaceRayon; // Rayon principal (INTRANTS_EQUIPEMENTS, PRODUITS_FERME, ELEVAGE)
  category: ProductCategory; // Catégorie détaillée
  description: string;
  price: number; // Prix unitaire en FCFA
  unit: string; // "kg", "sac", "unité", "tête" (pour bétail)
  stockQuantity: number;
  location: ProductLocation;
  images: string[];
  deliveryOptions: DeliveryOption[];
  isCertified: boolean; // Badge "Certifié par SeneGundo" - si le diagnostic a été fait sur ce terrain
  diagnosticId?: string; // Lien vers le diagnostic SeneGundo
  // Pour le rayon Élevage
  livestockPack?: {
    includes: string[]; // Ex: ["Achat", "Suivi vétérinaire", "Assurance"]
    veterinaryFollowUp?: boolean;
    insurance?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'ready_for_pickup' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  pickupPoint?: string;
  createdAt: Date;
  updatedAt: Date;
}
