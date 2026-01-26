// Modèle Formation pour l'Académie

export type FormationCategory = 'Technique' | 'Économie' | 'Santé' | 'Commercialisation';
export type FormationType = 'pdf' | 'video' | 'audio';

export interface Formation {
  id: string;
  title: string;
  category: FormationCategory;
  description: string;
  thumbnail: string;
  fileUrl: string;
  type: FormationType;
  author: string;
  views: number;
  isFree: boolean;
  tags: string[];
  duration?: number; // En minutes pour vidéos/audios
  createdAt: Date;
  updatedAt: Date;
}
