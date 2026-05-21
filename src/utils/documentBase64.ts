import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

/** ~700 Ko en base64 — limite pratique Firestore sans Storage */
const MAX_BASE64_LENGTH = 950_000;

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
};

export function inferFileType(fileName: string): import('@models/AcademyGuide').AcademyFileType {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc' || ext === 'docx') return 'word';
  if (ext === 'xls' || ext === 'xlsx') return 'excel';
  if (ext === 'ppt' || ext === 'pptx') return 'powerpoint';
  return 'autre';
}

export function inferMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

export interface PickedDocument {
  fileName: string;
  mimeType: string;
  fileType: import('@models/AcademyGuide').AcademyFileType;
  fileBase64: string;
  sizeBytes: number;
}

export async function pickAcademyDocument(): Promise<PickedDocument> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      '*/*',
    ],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    throw new Error('Sélection annulée.');
  }

  const asset = result.assets[0];
  const fileName = asset.name ?? 'document';
  const uri = asset.uri;

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const fileBase64 = `data:${asset.mimeType ?? inferMimeType(fileName)};base64,${base64}`;

  if (fileBase64.length > MAX_BASE64_LENGTH) {
    throw new Error(
      'Fichier trop volumineux (max ~700 Ko). Compressez le PDF ou divisez le document.'
    );
  }

  return {
    fileName,
    mimeType: asset.mimeType ?? inferMimeType(fileName),
    fileType: inferFileType(fileName),
    fileBase64,
    sizeBytes: asset.size ?? Math.ceil(base64.length * 0.75),
  };
}

/** Écrit le fichier en cache et ouvre le menu de partage / ouverture */
export async function openAcademyDocument(
  fileBase64: string,
  fileName: string
): Promise<void> {
  const { shareAsync, isAvailableAsync } = await import('expo-sharing');
  const raw = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${FileSystem.cacheDirectory}academy_${Date.now()}_${safeName}`;

  await FileSystem.writeAsStringAsync(path, raw, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await isAvailableAsync()) {
    await shareAsync(path, { dialogTitle: 'Ouvrir le guide' });
  } else {
    throw new Error('Ouverture de fichier non disponible sur cet appareil.');
  }
}
