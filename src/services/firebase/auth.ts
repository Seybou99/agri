import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@config/firebase';
import type { User, UserRole } from '@models/User';
import { getAuthErrorMessage } from '@utils/authErrors';

const USERS_COLLECTION = 'users';
const FIRESTORE_WRITE_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

function buildUserFromAuth(
  firebaseUser: FirebaseUser,
  extras: { displayName: string; phoneNumber?: string; role: UserRole }
): User {
  return {
    uid: firebaseUser.uid,
    displayName: extras.displayName,
    email: firebaseUser.email ?? '',
    phoneNumber: extras.phoneNumber ?? '',
    role: extras.role,
    isPremium: false,
    createdAt: new Date(),
    verified: firebaseUser.emailVerified,
    avatarUrl: firebaseUser.photoURL ?? undefined,
  };
}

function requireAuth() {
  if (!isFirebaseConfigured() || !auth || !db) {
    throw new Error(
      'Firebase non configuré. Ajoutez FIREBASE_API_KEY, FIREBASE_PROJECT_ID et FIREBASE_APP_ID dans .env (Console Firebase → Paramètres du projet).'
    );
  }
  return { auth, db };
}

function mapFirestoreUser(uid: string, data: Record<string, unknown>): User {
  const created = data.createdAt as { toDate?: () => Date } | undefined;
  return {
    uid,
    displayName: String(data.displayName ?? ''),
    email: String(data.email ?? ''),
    phoneNumber: String(data.phoneNumber ?? ''),
    role: (data.role as UserRole) ?? 'utilisateur',
    isPremium: Boolean(data.isPremium),
    createdAt: created?.toDate?.() ?? new Date(),
    location: data.location as User['location'],
    avatarUrl: data.avatarUrl ? String(data.avatarUrl) : undefined,
    verified: Boolean(data.verified),
  };
}

async function createUserDocument(
  firebaseUser: FirebaseUser,
  extras: { displayName: string; phoneNumber?: string; role: UserRole }
): Promise<User> {
  const { db: firestore } = requireAuth();
  const ref = doc(firestore, USERS_COLLECTION, firebaseUser.uid);
  const payload = {
    uid: firebaseUser.uid,
    displayName: extras.displayName,
    email: firebaseUser.email ?? '',
    phoneNumber: extras.phoneNumber ?? '',
    role: extras.role,
    isPremium: false,
    verified: firebaseUser.emailVerified,
    avatarUrl: firebaseUser.photoURL ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await withTimeout(
    setDoc(ref, payload, { merge: true }),
    FIRESTORE_WRITE_TIMEOUT_MS,
    'Délai dépassé lors de l’enregistrement du profil. Vérifiez que Firestore est activé dans Firebase Console et déployez firestore.rules.'
  );
  return mapFirestoreUser(firebaseUser.uid, {
    ...payload,
    createdAt: new Date(),
  });
}

async function ensureUserProfile(firebaseUser: FirebaseUser): Promise<User> {
  const { db: firestore } = requireAuth();
  const ref = doc(firestore, USERS_COLLECTION, firebaseUser.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return createUserDocument(firebaseUser, {
      displayName: firebaseUser.displayName ?? 'Utilisateur',
      phoneNumber: '',
      role: 'utilisateur',
    });
  }

  const data = snap.data() as Record<string, unknown>;
  if (!data.role) {
    await updateDoc(ref, { role: 'utilisateur', updatedAt: serverTimestamp() });
    data.role = 'utilisateur';
  }
  if (firebaseUser.photoURL && data.avatarUrl !== firebaseUser.photoURL) {
    await updateDoc(ref, { avatarUrl: firebaseUser.photoURL, updatedAt: serverTimestamp() });
    data.avatarUrl = firebaseUser.photoURL;
  }

  return mapFirestoreUser(firebaseUser.uid, data);
}

export interface AuthService {
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    phoneNumber: string,
    role: UserRole
  ) => Promise<User>;
  signInWithGoogleIdToken: (idToken: string) => Promise<User>;
  signOut: () => Promise<void>;
  onAuthStateChange: (callback: (user: FirebaseUser | null) => void) => () => void;
  getCurrentUser: () => FirebaseUser | null;
  getUserProfile: (uid: string) => Promise<User | null>;
  updateUserProfile: (uid: string, data: Partial<User>) => Promise<void>;
}

class AuthServiceImpl implements AuthService {
  async signIn(email: string, password: string): Promise<User> {
    const { auth: firebaseAuth } = requireAuth();
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      return ensureUserProfile(cred.user);
    } catch (e) {
      throw new Error(getAuthErrorMessage(e));
    }
  }

  async signUp(
    email: string,
    password: string,
    displayName: string,
    phoneNumber: string,
    role: UserRole
  ): Promise<User> {
    const { auth: firebaseAuth } = requireAuth();
    const safeRole: UserRole = role === 'agriculteur' ? 'agriculteur' : 'utilisateur';
    const trimmedName = displayName.trim();
    const trimmedPhone = phoneNumber.trim();

    let cred;
    try {
      cred = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      await updateProfile(cred.user, { displayName: trimmedName });
    } catch (e) {
      throw new Error(getAuthErrorMessage(e));
    }

    const fallbackProfile = buildUserFromAuth(cred.user, {
      displayName: trimmedName,
      phoneNumber: trimmedPhone,
      role: safeRole,
    });

    try {
      return await createUserDocument(cred.user, {
        displayName: trimmedName,
        phoneNumber: trimmedPhone,
        role: safeRole,
      });
    } catch (firestoreError) {
      const msg =
        firestoreError instanceof Error ? firestoreError.message : 'Erreur Firestore';
      const wrapped = new Error(
        `Compte créé, mais le profil n’a pas pu être enregistré : ${msg}\n\nFirebase Console → Firestore → Créer une base → Règles : voir firestore.rules du projet.`
      );
      (wrapped as Error & { profile?: User; authCreated?: boolean }).profile = fallbackProfile;
      (wrapped as Error & { profile?: User; authCreated?: boolean }).authCreated = true;
      throw wrapped;
    }
  }

  async signInWithGoogleIdToken(idToken: string): Promise<User> {
    const { auth: firebaseAuth } = requireAuth();
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const cred = await signInWithCredential(firebaseAuth, credential);
      return ensureUserProfile(cred.user);
    } catch (e) {
      throw new Error(getAuthErrorMessage(e));
    }
  }

  async signOut(): Promise<void> {
    const { auth: firebaseAuth } = requireAuth();
    await firebaseSignOut(firebaseAuth);
  }

  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  }

  getCurrentUser(): FirebaseUser | null {
    return auth?.currentUser ?? null;
  }

  async getUserProfile(uid: string): Promise<User | null> {
    if (!db) return null;
    try {
      const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
      if (!snap.exists()) return null;
      return mapFirestoreUser(uid, snap.data() as Record<string, unknown>);
    } catch (e) {
      console.warn('[Auth] Lecture profil Firestore:', e);
      return null;
    }
  }

  async updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
    const { db: firestore } = requireAuth();
    await updateDoc(doc(firestore, USERS_COLLECTION, uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
}

export const authServiceInstance = new AuthServiceImpl();
