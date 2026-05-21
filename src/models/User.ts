// Modèle utilisateur Firestore / profil app

/** Rôles applicatifs (évolution : droits par rôle). */
export type UserRole = 'utilisateur' | 'administrateur' | 'agriculteur';

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
  avatarUrl?: string;
  verified?: boolean;
}

export interface UserProfile extends User {
  avatarUrl?: string;
  bio?: string;
  verified: boolean;
}
