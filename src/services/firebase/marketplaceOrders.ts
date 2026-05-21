import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@config/firebase';
import type {
  MarketplaceOrder,
  MarketplaceSale,
  MarketplaceOrderLine,
  PlaceMarketplaceOrderInput,
  MarketplaceOrderStatus,
} from '@models/MarketplaceOrder';

const ORDERS = 'marketplace_orders';
const SALES = 'marketplace_sales';

function mapOrder(id: string, data: Record<string, unknown>): MarketplaceOrder {
  const created = data.createdAt as Timestamp | undefined;
  return {
    id,
    buyerId: String(data.buyerId ?? ''),
    buyerDisplayName: String(data.buyerDisplayName ?? ''),
    items: (data.items as MarketplaceOrderLine[]) ?? [],
    totalAmount: Number(data.totalAmount ?? 0),
    paymentMethod: String(data.paymentMethod ?? ''),
    deliveryAddress: String(data.deliveryAddress ?? ''),
    phoneNumber: data.phoneNumber ? String(data.phoneNumber) : undefined,
    status: (data.status as MarketplaceOrderStatus) ?? 'completed',
    createdAt: created?.toDate?.() ?? new Date(),
  };
}

function mapSale(id: string, data: Record<string, unknown>): MarketplaceSale {
  const created = data.createdAt as Timestamp | undefined;
  return {
    id,
    orderId: String(data.orderId ?? ''),
    buyerId: String(data.buyerId ?? ''),
    buyerDisplayName: String(data.buyerDisplayName ?? ''),
    sellerId: String(data.sellerId ?? ''),
    sellerDisplayName: String(data.sellerDisplayName ?? ''),
    items: (data.items as MarketplaceOrderLine[]) ?? [],
    totalAmount: Number(data.totalAmount ?? 0),
    status: (data.status as MarketplaceOrderStatus) ?? 'completed',
    createdAt: created?.toDate?.() ?? new Date(),
  };
}

function groupItemsBySeller(items: MarketplaceOrderLine[]): Map<string, MarketplaceOrderLine[]> {
  const map = new Map<string, MarketplaceOrderLine[]>();
  for (const line of items) {
    const list = map.get(line.sellerId) ?? [];
    list.push(line);
    map.set(line.sellerId, list);
  }
  return map;
}

export async function placeMarketplaceOrder(
  input: PlaceMarketplaceOrderInput
): Promise<MarketplaceOrder> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase non configuré.');
  }

  const payload = {
    buyerId: input.buyerId,
    buyerDisplayName: input.buyerDisplayName,
    items: input.items,
    totalAmount: input.totalAmount,
    paymentMethod: input.paymentMethod,
    deliveryAddress: input.deliveryAddress,
    phoneNumber: input.phoneNumber ?? '',
    status: 'completed' as MarketplaceOrderStatus,
    createdAt: serverTimestamp(),
  };

  const orderRef = await addDoc(collection(db, ORDERS), payload);

  const bySeller = groupItemsBySeller(input.items);
  const salePromises = [...bySeller.entries()].map(([sellerId, lines]) => {
    const sellerName = lines[0]?.sellerDisplayName ?? 'Vendeur';
    const saleTotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    return addDoc(collection(db, SALES), {
      orderId: orderRef.id,
      buyerId: input.buyerId,
      buyerDisplayName: input.buyerDisplayName,
      sellerId,
      sellerDisplayName: sellerName,
      items: lines,
      totalAmount: saleTotal,
      status: 'completed',
      createdAt: serverTimestamp(),
    });
  });
  await Promise.all(salePromises);

  return mapOrder(orderRef.id, {
    ...payload,
    createdAt: Timestamp.now(),
  });
}

export async function fetchBuyerMarketplaceOrders(
  buyerId: string
): Promise<MarketplaceOrder[]> {
  if (!db) return [];
  const q = query(
    collection(db, ORDERS),
    where('buyerId', '==', buyerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapOrder(d.id, d.data() as Record<string, unknown>));
}

export async function fetchSellerMarketplaceSales(
  sellerId: string
): Promise<MarketplaceSale[]> {
  if (!db) return [];
  const q = query(
    collection(db, SALES),
    where('sellerId', '==', sellerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapSale(d.id, d.data() as Record<string, unknown>));
}
