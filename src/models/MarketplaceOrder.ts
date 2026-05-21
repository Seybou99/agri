/** Commandes et ventes du Marché SeneGundo */

export type MarketplaceOrderStatus = 'completed' | 'cancelled';

export interface MarketplaceOrderLine {
  productId: string;
  productName: string;
  sellerId: string;
  sellerDisplayName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface MarketplaceOrder {
  id: string;
  buyerId: string;
  buyerDisplayName: string;
  items: MarketplaceOrderLine[];
  totalAmount: number;
  paymentMethod: string;
  deliveryAddress: string;
  phoneNumber?: string;
  status: MarketplaceOrderStatus;
  createdAt: Date;
}

export interface MarketplaceSale {
  id: string;
  orderId: string;
  buyerId: string;
  buyerDisplayName: string;
  sellerId: string;
  sellerDisplayName: string;
  items: MarketplaceOrderLine[];
  totalAmount: number;
  status: MarketplaceOrderStatus;
  createdAt: Date;
}

export interface PlaceMarketplaceOrderInput {
  buyerId: string;
  buyerDisplayName: string;
  items: MarketplaceOrderLine[];
  totalAmount: number;
  paymentMethod: string;
  deliveryAddress: string;
  phoneNumber?: string;
}
