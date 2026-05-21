import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { MarketplaceProduct } from '@models/Product';
import type { MarketplaceOrder, MarketplaceSale, MarketplaceOrderLine } from '@models/MarketplaceOrder';
import {
  createMarketplaceProduct,
  fetchPublishedProducts,
  type CreateProductInput,
} from '@services/firebase/products';
import {
  placeMarketplaceOrder,
  fetchBuyerMarketplaceOrders,
  fetchSellerMarketplaceSales,
} from '@services/firebase/marketplaceOrders';
import { useAuth } from '@hooks/useAuth';
import { isFirebaseConfigured } from '@config/firebase';
import type { CartItem } from '@contexts/CartContext';

interface PlaceOrderParams {
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  deliveryAddress: string;
  phoneNumber?: string;
}

interface MarketplaceContextType {
  products: MarketplaceProduct[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
  getProductById: (id: string) => MarketplaceProduct | undefined;
  publishProduct: (input: CreateProductInput) => Promise<MarketplaceProduct>;
  myPurchases: MarketplaceOrder[];
  mySales: MarketplaceSale[];
  ordersLoading: boolean;
  refreshOrders: () => Promise<void>;
  placeOrder: (params: PlaceOrderParams) => Promise<MarketplaceOrder>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

function cartToOrderLines(items: CartItem[]): MarketplaceOrderLine[] {
  return items.map((item) => ({
    productId: item.product.id,
    productName: item.product.productName,
    sellerId: item.product.farmerId,
    sellerDisplayName: item.product.farmerDisplayName ?? 'Vendeur',
    quantity: item.quantity,
    unitPrice: item.product.price,
    lineTotal: item.product.price * item.quantity,
  }));
}

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, userProfile, isAuthenticated } = useAuth();
  const [published, setPublished] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [myPurchases, setMyPurchases] = useState<MarketplaceOrder[]>([]);
  const [mySales, setMySales] = useState<MarketplaceSale[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const refreshProducts = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setPublished([]);
      setLoading(false);
      return;
    }
    try {
      const fromFirestore = await fetchPublishedProducts();
      setPublished(fromFirestore);
    } catch (e) {
      console.warn('Chargement produits Firestore:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!user) {
      setMyPurchases([]);
      setMySales([]);
      return;
    }
    setOrdersLoading(true);
    try {
      const [purchases, sales] = await Promise.all([
        fetchBuyerMarketplaceOrders(user.uid),
        fetchSellerMarketplaceSales(user.uid),
      ]);
      setMyPurchases(purchases);
      setMySales(sales);
    } catch (e) {
      console.warn('Commandes marché:', e);
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshOrders();
    } else {
      setMyPurchases([]);
      setMySales([]);
    }
  }, [isAuthenticated, refreshOrders]);

  const products = useMemo(() => published, [published]);

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const publishProduct = useCallback(async (input: CreateProductInput) => {
    const created = await createMarketplaceProduct(input);
    setPublished((prev) => [created, ...prev]);
    return created;
  }, []);

  const placeOrder = useCallback(
    async (params: PlaceOrderParams) => {
      if (!user || !userProfile) {
        throw new Error('Connectez-vous pour passer commande.');
      }
      const order = await placeMarketplaceOrder({
        buyerId: user.uid,
        buyerDisplayName: userProfile.displayName || 'Client',
        items: cartToOrderLines(params.items),
        totalAmount: params.totalAmount,
        paymentMethod: params.paymentMethod,
        deliveryAddress: params.deliveryAddress,
        phoneNumber: params.phoneNumber,
      });
      setMyPurchases((prev) => [order, ...prev]);
      await refreshOrders();
      return order;
    },
    [user, userProfile, refreshOrders]
  );

  const value = useMemo(
    () => ({
      products,
      loading,
      refreshProducts,
      getProductById,
      publishProduct,
      myPurchases,
      mySales,
      ordersLoading,
      refreshOrders,
      placeOrder,
    }),
    [
      products,
      loading,
      refreshProducts,
      getProductById,
      publishProduct,
      myPurchases,
      mySales,
      ordersLoading,
      refreshOrders,
      placeOrder,
    ]
  );

  return (
    <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>
  );
};

export function useMarketplace(): MarketplaceContextType {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) {
    throw new Error('useMarketplace doit être utilisé dans MarketplaceProvider');
  }
  return ctx;
}
