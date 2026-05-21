import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AcademyGuide, AcademyOrder, CreateAcademyGuideInput } from '@models/AcademyGuide';
import {
  fetchAcademyGuides,
  fetchAcademyGuide,
  fetchAcademyGuideContent,
  createAcademyGuide,
  createAcademyOrder,
  fetchBuyerAcademyOrders,
  fetchSellerAcademyOrders,
  hasPurchasedGuide,
} from '@services/firebase/academy';
import { useAuth } from '@hooks/useAuth';

interface AcademyContextType {
  guides: AcademyGuide[];
  loading: boolean;
  refreshGuides: () => Promise<void>;
  getGuideById: (id: string) => AcademyGuide | undefined;
  publishGuide: (input: CreateAcademyGuideInput) => Promise<AcademyGuide>;
  purchaseGuide: (guide: AcademyGuide) => Promise<AcademyOrder>;
  canAccessGuide: (guideId: string, isFree: boolean) => Promise<boolean>;
  loadGuideContent: (guideId: string) => ReturnType<typeof fetchAcademyGuideContent>;
  myPurchases: AcademyOrder[];
  mySales: AcademyOrder[];
  refreshOrders: () => Promise<void>;
  ordersLoading: boolean;
}

const AcademyContext = createContext<AcademyContextType | undefined>(undefined);

export const AcademyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, isAuthenticated } = useAuth();
  const [guides, setGuides] = useState<AcademyGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [myPurchases, setMyPurchases] = useState<AcademyOrder[]>([]);
  const [mySales, setMySales] = useState<AcademyOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());

  const refreshGuides = useCallback(async () => {
    try {
      const list = await fetchAcademyGuides();
      setGuides(list);
    } catch (e) {
      console.warn('Académie guides:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!user) {
      setMyPurchases([]);
      setMySales([]);
      setPurchasedIds(new Set());
      return;
    }
    setOrdersLoading(true);
    try {
      const [purchases, sales] = await Promise.all([
        fetchBuyerAcademyOrders(user.uid),
        fetchSellerAcademyOrders(user.uid),
      ]);
      setMyPurchases(purchases);
      setMySales(sales);
      setPurchasedIds(new Set(purchases.map((o) => o.guideId)));
    } catch (e) {
      console.warn('Académie commandes:', e);
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshGuides();
  }, [refreshGuides]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshOrders();
    } else {
      setMyPurchases([]);
      setMySales([]);
      setPurchasedIds(new Set());
    }
  }, [isAuthenticated, refreshOrders]);

  const getGuideById = useCallback(
    (id: string) => guides.find((g) => g.id === id),
    [guides]
  );

  const publishGuide = useCallback(async (input: CreateAcademyGuideInput) => {
    const created = await createAcademyGuide(input);
    setGuides((prev) => [created, ...prev]);
    return created;
  }, []);

  const canAccessGuide = useCallback(
    async (guideId: string, isFree: boolean) => {
      if (isFree) return true;
      if (!user) return false;
      if (purchasedIds.has(guideId)) return true;
      const guide = guides.find((g) => g.id === guideId);
      if (guide?.sellerId === user.uid) return true;
      return hasPurchasedGuide(user.uid, guideId);
    },
    [user, purchasedIds, guides]
  );

  const purchaseGuide = useCallback(
    async (guide: AcademyGuide) => {
      if (!user || !userProfile) {
        throw new Error('Connectez-vous pour acheter ce guide.');
      }
      if (guide.sellerId === user.uid) {
        throw new Error('Vous ne pouvez pas acheter votre propre guide.');
      }
      const order = await createAcademyOrder({
        buyerId: user.uid,
        buyerDisplayName: userProfile.displayName || 'Acheteur',
        sellerId: guide.sellerId,
        sellerDisplayName: guide.sellerDisplayName,
        guideId: guide.id,
        guideTitle: guide.title,
        amount: guide.isFree ? 0 : guide.price,
        isFree: guide.isFree,
      });
      setMyPurchases((prev) => [order, ...prev]);
      setPurchasedIds((prev) => new Set(prev).add(guide.id));
      return order;
    },
    [user, userProfile]
  );

  const value = useMemo(
    () => ({
      guides,
      loading,
      refreshGuides,
      getGuideById,
      publishGuide,
      purchaseGuide,
      canAccessGuide,
      loadGuideContent: fetchAcademyGuideContent,
      myPurchases,
      mySales,
      refreshOrders,
      ordersLoading,
    }),
    [
      guides,
      loading,
      refreshGuides,
      getGuideById,
      publishGuide,
      purchaseGuide,
      canAccessGuide,
      myPurchases,
      mySales,
      refreshOrders,
      ordersLoading,
    ]
  );

  return <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>;
};

export function useAcademy(): AcademyContextType {
  const ctx = useContext(AcademyContext);
  if (!ctx) {
    throw new Error('useAcademy doit être utilisé dans AcademyProvider');
  }
  return ctx;
}

/** Recharge un guide si absent du cache local */
export async function resolveAcademyGuide(
  guideId: string,
  cached?: AcademyGuide
): Promise<AcademyGuide | null> {
  if (cached) return cached;
  return fetchAcademyGuide(guideId);
}
