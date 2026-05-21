import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@config/firebase';
import type {
  MarketplaceProduct,
  MarketplaceRayon,
  ProductCategory,
  DeliveryOption,
} from '@models/Product';

const PRODUCTS_COLLECTION = 'products';

export interface CreateProductInput {
  farmerId: string;
  farmerDisplayName: string;
  productName: string;
  rayon: MarketplaceRayon;
  category: ProductCategory;
  description: string;
  price: number;
  unit: string;
  stockQuantity: number;
  locationName: string;
  imageBase64: string;
  deliveryOptions: DeliveryOption[];
  isCertified?: boolean;
}

function mapFirestoreProduct(id: string, data: Record<string, unknown>): MarketplaceProduct {
  const created = data.createdAt as Timestamp | undefined;
  const updated = data.updatedAt as Timestamp | undefined;
  const imageBase64 = data.imageBase64 ? String(data.imageBase64) : '';
  const location = data.location as MarketplaceProduct['location'] | undefined;

  return {
    id,
    farmerId: String(data.farmerId ?? ''),
    farmerDisplayName: data.farmerDisplayName
      ? String(data.farmerDisplayName)
      : undefined,
    productName: String(data.productName ?? ''),
    rayon: data.rayon as MarketplaceRayon,
    category: data.category as ProductCategory,
    description: String(data.description ?? ''),
    price: Number(data.price ?? 0),
    unit: String(data.unit ?? 'unité'),
    stockQuantity: Number(data.stockQuantity ?? 0),
    location: location ?? {
      geopoint: { latitude: 12.65, longitude: -7.99 },
      name: 'Bamako',
    },
    images: imageBase64 ? [imageBase64] : [],
    deliveryOptions: (data.deliveryOptions as DeliveryOption[]) ?? ['click_and_collect'],
    isCertified: Boolean(data.isCertified),
    diagnosticId: data.diagnosticId ? String(data.diagnosticId) : undefined,
    createdAt: created?.toDate?.() ?? new Date(),
    updatedAt: updated?.toDate?.() ?? new Date(),
  };
}

export async function fetchPublishedProducts(): Promise<MarketplaceProduct[]> {
  if (!isFirebaseConfigured() || !db) return [];

  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) =>
    mapFirestoreProduct(docSnap.id, docSnap.data() as Record<string, unknown>)
  );
}

export async function createMarketplaceProduct(
  input: CreateProductInput
): Promise<MarketplaceProduct> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase non configuré.');
  }

  const payload = {
    farmerId: input.farmerId,
    farmerDisplayName: input.farmerDisplayName,
    productName: input.productName.trim(),
    rayon: input.rayon,
    category: input.category,
    description: input.description.trim(),
    price: input.price,
    unit: input.unit.trim(),
    stockQuantity: input.stockQuantity,
    location: {
      geopoint: { latitude: 12.65, longitude: -7.99 },
      name: input.locationName.trim() || 'Bamako',
    },
    imageBase64: input.imageBase64,
    deliveryOptions: input.deliveryOptions,
    isCertified: input.isCertified ?? false,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, PRODUCTS_COLLECTION), payload);
  return mapFirestoreProduct(ref.id, {
    ...payload,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}
