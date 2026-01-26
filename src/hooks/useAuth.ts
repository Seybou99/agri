// Hook pour gérer l'authentification
// NOTE: Firebase n'est pas installé actuellement. Ce hook fonctionne en mode stub.
import { useState, useEffect } from 'react';
import { authServiceInstance } from '@services/firebase/auth';
import { User } from '@models/User';

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authServiceInstance.onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const profile = await authServiceInstance.getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    return await authServiceInstance.signIn(email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    phoneNumber: string
  ) => {
    return await authServiceInstance.signUp(email, password, displayName, phoneNumber);
  };

  const signOut = async () => {
    await authServiceInstance.signOut();
  };

  return {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };
}
