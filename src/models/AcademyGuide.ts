/** Guide / manuel publié dans l’Académie SeneGundo */

export type AcademyDomain =
  | 'techniques_agricoles'
  | 'sol_parcelle'
  | 'irrigation'
  | 'elevage'
  | 'commercialisation'
  | 'economie_rurale'
  | 'sante_plantes'
  | 'autre';

export type AcademyFileType = 'pdf' | 'word' | 'excel' | 'powerpoint' | 'autre';

export type AcademyOrderStatus = 'completed' | 'cancelled';

/** Métadonnées (liste) — sans le fichier binaire */
export interface AcademyGuide {
  id: string;
  sellerId: string;
  sellerDisplayName: string;
  title: string;
  description: string;
  domain: AcademyDomain;
  fileType: AcademyFileType;
  fileName: string;
  mimeType: string;
  isFree: boolean;
  price: number;
  tags: string[];
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademyGuideContent {
  guideId: string;
  fileBase64: string;
  fileName: string;
  mimeType: string;
}

export interface AcademyOrder {
  id: string;
  buyerId: string;
  buyerDisplayName: string;
  sellerId: string;
  sellerDisplayName: string;
  guideId: string;
  guideTitle: string;
  amount: number;
  isFree: boolean;
  status: AcademyOrderStatus;
  createdAt: Date;
}

export interface CreateAcademyGuideInput {
  sellerId: string;
  sellerDisplayName: string;
  title: string;
  description: string;
  domain: AcademyDomain;
  fileType: AcademyFileType;
  fileName: string;
  mimeType: string;
  fileBase64: string;
  isFree: boolean;
  price: number;
  tags?: string[];
}
