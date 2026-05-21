/**
 * Config Firebase client — toujours le projet SeneGundo (agriculture-b70c9).
 * Ne pas mélanger avec d’autres projets dans .env.local (ex. gestion-94304).
 */
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from 'react-native-dotenv';

/** Projet où sont Auth + Firestore + vos règles firestore.rules */
export const EXPECTED_FIREBASE_PROJECT_ID = 'agriculture-b70c9';

export function buildClientFirebaseConfig() {
  const projectId = FIREBASE_PROJECT_ID?.trim();
  if (!projectId || !FIREBASE_API_KEY?.trim()) {
    return null;
  }
  if (projectId !== EXPECTED_FIREBASE_PROJECT_ID) {
    console.warn(
      `[Firebase] FIREBASE_PROJECT_ID="${projectId}" — attendu "${EXPECTED_FIREBASE_PROJECT_ID}". ` +
        'Vérifiez .env (pas un autre projet dans .env.local).'
    );
  }
  return {
    apiKey: FIREBASE_API_KEY.trim(),
    authDomain: FIREBASE_AUTH_DOMAIN?.trim() || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket:
      FIREBASE_STORAGE_BUCKET?.trim() || `${projectId}.firebasestorage.app`,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID?.trim() || '',
    appId: FIREBASE_APP_ID?.trim() || '',
  };
}
