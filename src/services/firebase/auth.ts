// Service d'authentification Firebase
// NOTE: Firebase n'est pas installé actuellement. Ce fichier est un stub.
// Pour activer Firebase, installez : npm install firebase

import { User } from '@models/User';

export interface AuthService {
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, displayName: string, phoneNumber: string) => Promise<any>;
  signOut: () => Promise<void>;
  onAuthStateChange: (callback: (user: any | null) => void) => () => void;
  getCurrentUser: () => any | null;
  getUserProfile: (uid: string) => Promise<User | null>;
  updateUserProfile: (uid: string, data: Partial<User>) => Promise<void>;
}

class AuthServiceImpl implements AuthService {
  async signIn(_email: string, _password: string): Promise<any> {
    throw new Error('Firebase n\'est pas installé. Installez-le avec: npm install firebase');
  }

  async signUp(
    _email: string,
    _password: string,
    _displayName: string,
    _phoneNumber: string
  ): Promise<any> {
    throw new Error('Firebase n\'est pas installé. Installez-le avec: npm install firebase');
  }

  async signOut(): Promise<void> {
    throw new Error('Firebase n\'est pas installé. Installez-le avec: npm install firebase');
  }

  onAuthStateChange(callback: (user: any | null) => void): () => void {
    // Retourner une fonction de désabonnement vide
    callback(null);
    return () => {};
  }

  getCurrentUser(): any | null {
    return null;
  }

  async getUserProfile(_uid: string): Promise<User | null> {
    return null;
  }

  async updateUserProfile(_uid: string, _data: Partial<User>): Promise<void> {
    throw new Error('Firebase n\'est pas installé. Installez-le avec: npm install firebase');
  }
}

export const authServiceInstance = new AuthServiceImpl();
