import type { AcademyDomain, AcademyFileType } from '@models/AcademyGuide';

export const ACADEMY_DOMAINS: AcademyDomain[] = [
  'techniques_agricoles',
  'sol_parcelle',
  'irrigation',
  'elevage',
  'commercialisation',
  'economie_rurale',
  'sante_plantes',
  'autre',
];

export const ACADEMY_DOMAIN_LABELS: Record<AcademyDomain, string> = {
  techniques_agricoles: 'Techniques agricoles',
  sol_parcelle: 'Sol & parcelle',
  irrigation: 'Irrigation & eau',
  elevage: 'Élevage',
  commercialisation: 'Commercialisation',
  economie_rurale: 'Économie rurale',
  sante_plantes: 'Santé des plantes',
  autre: 'Autre',
};

export const ACADEMY_FILE_TYPES: AcademyFileType[] = [
  'pdf',
  'word',
  'excel',
  'powerpoint',
  'autre',
];

export const ACADEMY_FILE_TYPE_LABELS: Record<AcademyFileType, string> = {
  pdf: 'PDF',
  word: 'Word',
  excel: 'Excel',
  powerpoint: 'PowerPoint',
  autre: 'Autre',
};

export const ACADEMY_FILE_TYPE_ICONS: Record<AcademyFileType, string> = {
  pdf: '📄',
  word: '📝',
  excel: '📊',
  powerpoint: '📽️',
  autre: '📎',
};
