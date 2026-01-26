// Modèle User pour Firestore

export type UserRole = 'investor' | 'farmer' | 'buyer';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  location?: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  isPremium: boolean;
}

export interface UserProfile extends User {
  // Données additionnelles pour le profil
  avatarUrl?: string;
  bio?: string;
  verified: boolean;
}
