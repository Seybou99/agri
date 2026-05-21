import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from 'react-native-dotenv';

function buildFirebaseConfig() {
  const projectId = FIREBASE_PROJECT_ID?.trim();
  if (!projectId || !FIREBASE_API_KEY?.trim()) {
    return null;
  }
  return {
    apiKey: FIREBASE_API_KEY.trim(),
    authDomain: (FIREBASE_AUTH_DOMAIN?.trim() || `${projectId}.firebaseapp.com`),
    projectId,
    storageBucket: (FIREBASE_STORAGE_BUCKET?.trim() || `${projectId}.appspot.com`),
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID?.trim() || '',
    appId: FIREBASE_APP_ID?.trim() || '',
  };
}

const firebaseConfig = buildFirebaseConfig();

export function isFirebaseConfigured(): boolean {
  return firebaseConfig != null && !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
}

/** Variables manquantes pour afficher un message d’aide précis. */
export function getMissingFirebaseEnvVars(): string[] {
  const missing: string[] = [];
  if (!FIREBASE_PROJECT_ID?.trim()) missing.push('FIREBASE_PROJECT_ID');
  if (!FIREBASE_API_KEY?.trim()) missing.push('FIREBASE_API_KEY');
  if (!FIREBASE_APP_ID?.trim()) missing.push('FIREBASE_APP_ID');
  return missing;
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (isFirebaseConfigured() && firebaseConfig) {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } else {
    app = getApps()[0];
    auth = getAuth(app);
  }
  db = getFirestore(app);
}

export { app, auth, db };
