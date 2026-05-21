import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { authServiceInstance } from '@services/firebase/auth';
import type { User, UserRole } from '@models/User';
import { isFirebaseConfigured } from '@config/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFirebaseReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    phoneNumber: string,
    role: UserRole
  ) => Promise<void>;
  signInWithGoogleIdToken: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setUserProfile(null);
      return;
    }
    const profile = await authServiceInstance.getUserProfile(firebaseUser.uid);
    setUserProfile(profile);
  }, []);

  useEffect(() => {
    const unsubscribe = authServiceInstance.onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      await loadProfile(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const profile = await authServiceInstance.signIn(email, password);
    setUserProfile(profile);
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      phoneNumber: string,
      role: UserRole
    ) => {
      try {
        const profile = await authServiceInstance.signUp(
          email,
          password,
          displayName,
          phoneNumber,
          role
        );
        const currentUser = authServiceInstance.getCurrentUser();
        if (currentUser) setUser(currentUser);
        setUserProfile(profile);
      } catch (e) {
        const err = e as Error & { profile?: User; authCreated?: boolean };
        if (err.authCreated && err.profile) {
          const currentUser = authServiceInstance.getCurrentUser();
          if (currentUser) setUser(currentUser);
          setUserProfile(err.profile);
        }
        throw e;
      }
    },
    []
  );

  const signInWithGoogleIdToken = useCallback(async (idToken: string) => {
    const profile = await authServiceInstance.signInWithGoogleIdToken(idToken);
    setUserProfile(profile);
  }, []);

  const signOut = useCallback(async () => {
    await authServiceInstance.signOut();
    setUserProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(user);
  }, [loadProfile, user]);

  const value = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      isAuthenticated: !!user,
      isFirebaseReady: isFirebaseConfigured(),
      signIn,
      signUp,
      signInWithGoogleIdToken,
      signOut,
      refreshProfile,
    }),
    [
      user,
      userProfile,
      loading,
      signIn,
      signUp,
      signInWithGoogleIdToken,
      signOut,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return ctx;
}
