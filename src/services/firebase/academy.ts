import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@config/firebase';
import type {
  AcademyGuide,
  AcademyGuideContent,
  AcademyOrder,
  CreateAcademyGuideInput,
  AcademyOrderStatus,
} from '@models/AcademyGuide';

const GUIDES = 'academy_guides';
const GUIDE_CONTENT = 'academy_guide_content';
const ORDERS = 'academy_orders';

function mapGuide(id: string, data: Record<string, unknown>): AcademyGuide {
  const created = data.createdAt as Timestamp | undefined;
  const updated = data.updatedAt as Timestamp | undefined;
  return {
    id,
    sellerId: String(data.sellerId ?? ''),
    sellerDisplayName: String(data.sellerDisplayName ?? ''),
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    domain: data.domain as AcademyGuide['domain'],
    fileType: data.fileType as AcademyGuide['fileType'],
    fileName: String(data.fileName ?? ''),
    mimeType: String(data.mimeType ?? ''),
    isFree: Boolean(data.isFree),
    price: Number(data.price ?? 0),
    tags: (data.tags as string[]) ?? [],
    downloadCount: Number(data.downloadCount ?? 0),
    createdAt: created?.toDate?.() ?? new Date(),
    updatedAt: updated?.toDate?.() ?? new Date(),
  };
}

function mapOrder(id: string, data: Record<string, unknown>): AcademyOrder {
  const created = data.createdAt as Timestamp | undefined;
  return {
    id,
    buyerId: String(data.buyerId ?? ''),
    buyerDisplayName: String(data.buyerDisplayName ?? ''),
    sellerId: String(data.sellerId ?? ''),
    sellerDisplayName: String(data.sellerDisplayName ?? ''),
    guideId: String(data.guideId ?? ''),
    guideTitle: String(data.guideTitle ?? ''),
    amount: Number(data.amount ?? 0),
    isFree: Boolean(data.isFree),
    status: (data.status as AcademyOrderStatus) ?? 'completed',
    createdAt: created?.toDate?.() ?? new Date(),
  };
}

export async function fetchAcademyGuides(): Promise<AcademyGuide[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const q = query(collection(db, GUIDES), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapGuide(d.id, d.data() as Record<string, unknown>));
}

export async function fetchAcademyGuide(guideId: string): Promise<AcademyGuide | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, GUIDES, guideId));
  if (!snap.exists()) return null;
  return mapGuide(snap.id, snap.data() as Record<string, unknown>);
}

export async function fetchAcademyGuideContent(
  guideId: string
): Promise<AcademyGuideContent | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, GUIDE_CONTENT, guideId));
  if (!snap.exists()) return null;
  const data = snap.data() as Record<string, unknown>;
  return {
    guideId,
    fileBase64: String(data.fileBase64 ?? ''),
    fileName: String(data.fileName ?? ''),
    mimeType: String(data.mimeType ?? ''),
  };
}

export async function createAcademyGuide(
  input: CreateAcademyGuideInput
): Promise<AcademyGuide> {
  if (!db) throw new Error('Firebase non configuré.');

  const meta = {
    sellerId: input.sellerId,
    sellerDisplayName: input.sellerDisplayName,
    title: input.title.trim(),
    description: input.description.trim(),
    domain: input.domain,
    fileType: input.fileType,
    fileName: input.fileName,
    mimeType: input.mimeType,
    isFree: input.isFree,
    price: input.isFree ? 0 : input.price,
    tags: input.tags ?? [],
    downloadCount: 0,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const guideRef = await addDoc(collection(db, GUIDES), meta);
  await setDoc(doc(db, GUIDE_CONTENT, guideRef.id), {
    guideId: guideRef.id,
    sellerId: input.sellerId,
    fileBase64: input.fileBase64,
    fileName: input.fileName,
    mimeType: input.mimeType,
    updatedAt: serverTimestamp(),
  });

  return mapGuide(guideRef.id, {
    ...meta,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

export async function fetchBuyerAcademyOrders(buyerId: string): Promise<AcademyOrder[]> {
  if (!db) return [];
  const q = query(
    collection(db, ORDERS),
    where('buyerId', '==', buyerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapOrder(d.id, d.data() as Record<string, unknown>));
}

export async function fetchSellerAcademyOrders(sellerId: string): Promise<AcademyOrder[]> {
  if (!db) return [];
  const q = query(
    collection(db, ORDERS),
    where('sellerId', '==', sellerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapOrder(d.id, d.data() as Record<string, unknown>));
}

export async function hasPurchasedGuide(
  buyerId: string,
  guideId: string
): Promise<boolean> {
  if (!db) return false;
  const q = query(
    collection(db, ORDERS),
    where('buyerId', '==', buyerId),
    where('guideId', '==', guideId),
    where('status', '==', 'completed')
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function createAcademyOrder(params: {
  buyerId: string;
  buyerDisplayName: string;
  sellerId: string;
  sellerDisplayName: string;
  guideId: string;
  guideTitle: string;
  amount: number;
  isFree: boolean;
}): Promise<AcademyOrder> {
  if (!db) throw new Error('Firebase non configuré.');

  const already = await hasPurchasedGuide(params.buyerId, params.guideId);
  if (already) {
    throw new Error('Vous possédez déjà ce guide.');
  }

  const payload = {
    ...params,
    status: 'completed' as AcademyOrderStatus,
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, ORDERS), payload);
  return mapOrder(ref.id, { ...params, status: 'completed', createdAt: Timestamp.now() });
}
