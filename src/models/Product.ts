// Modèle Product pour la Marketplace

export type ProductCategory = 'Légumes' | 'Fruits' | 'Céréales' | 'Intrants' | 'Semences' | 'Engrais';
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
  category: ProductCategory;
  description: string;
  price: number; // Prix unitaire en FCFA
  unit: string; // "kg", "sac", "unité"
  stockQuantity: number;
  location: ProductLocation;
  images: string[];
  deliveryOptions: DeliveryOption[];
  isCertified: boolean; // Si le diagnostic a été fait sur ce terrain
  diagnosticId?: string; // Lien vers le diagnostic SeneGundo
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
