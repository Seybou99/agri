// Déclaration de types pour les variables d'environnement

declare module '@expo/vector-icons';

declare module 'react-native-dotenv' {
  export const API_URL: string;
  export const API_KEY: string;
  export const ENV: 'development' | 'production' | 'test';
  
  // Firebase
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_AUTH_DOMAIN: string;
  export const FIREBASE_PROJECT_ID: string;
  export const FIREBASE_STORAGE_BUCKET: string;
  export const FIREBASE_MESSAGING_SENDER_ID: string;
  export const FIREBASE_APP_ID: string;

  /** ID client OAuth Web (obligatoire pour Firebase Auth) */
  export const GOOGLE_WEB_CLIENT_ID: string;
  /** ID client OAuth iOS — Google Cloud → Créer identifiants → iOS, Bundle ID com.senegundo.app */
  export const GOOGLE_IOS_CLIENT_ID: string;
  /** ID client OAuth Android (optionnel, pour build Android) */
  export const GOOGLE_ANDROID_CLIENT_ID: string;
  
  // APIs externes
  export const OPENWEATHER_API_KEY: string;
  /** Clé API AgroMonitoring (surveillance agricole, NDVI, météo parcelle) — https://home.agromonitoring.com */
  export const AGROMONITORING_API_KEY: string;
  export const GOOGLE_MAPS_API_KEY: string;

  // Google Earth Engine (backend / Cloud Functions)
  export const GOOGLE_APPLICATION_CREDENTIALS: string;
  export const GEE_PROJECT_ID: string;

  /** iSDAsoil — secours appel direct si proxy Vercel indisponible (préférer proxy en prod) */
  export const ISDA_USERNAME: string;
  export const ISDA_PASSWORD: string;
}
