// Déclaration de types pour les variables d'environnement

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
  
  // APIs externes
  export const OPENWEATHER_API_KEY: string;
  export const GOOGLE_MAPS_API_KEY: string;

  // Google Earth Engine (backend / Cloud Functions)
  export const GOOGLE_APPLICATION_CREDENTIALS: string;
  export const GEE_PROJECT_ID: string;
}
