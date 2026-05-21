import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_API_KEY, FIREBASE_APP_ID, FIREBASE_PROJECT_ID } from 'react-native-dotenv';
import { buildClientFirebaseConfig } from './firebaseEnv';

const firebaseConfig = buildClientFirebaseConfig();

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
