import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Google from 'expo-auth-session/providers/google';
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
} from 'react-native-dotenv';

const EXPECTED_IOS_BUNDLE = 'com.senegundo.app';

/** Schéma URL imposé par Google pour le client OAuth iOS (voir console → Schéma d'URL iOS). */
export function getGoogleIosRedirectUri(iosClientId: string): string {
  const raw = iosClientId.replace('.apps.googleusercontent.com', '').trim();
  return `com.googleusercontent.apps.${raw}:/oauthredirect`;
}

export function getGoogleIosUrlScheme(iosClientId: string): string {
  const raw = iosClientId.replace('.apps.googleusercontent.com', '').trim();
  return `com.googleusercontent.apps.${raw}`;
}

/**
 * Connexion Google : client iOS + schéma URL Google.
 * Ne fonctionne pas dans Expo Go (bundle host.exp.Exponent) → utiliser `npx expo run:ios`.
 */
export function useGoogleAuth(onIdToken: (idToken: string) => Promise<void>) {
  const busyRef = useRef(false);

  const webClientId = GOOGLE_WEB_CLIENT_ID?.trim() || undefined;
  const iosClientId = GOOGLE_IOS_CLIENT_ID?.trim() || undefined;
  const androidClientId = GOOGLE_ANDROID_CLIENT_ID?.trim() || webClientId;

  const redirectUri = useMemo(() => {
    if (Platform.OS === 'ios' && iosClientId) {
      return getGoogleIosRedirectUri(iosClientId);
    }
    return undefined;
  }, [iosClientId]);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId,
    iosClientId,
    androidClientId,
    redirectUri,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!response) return;

    if (response.type === 'error') {
      setLoading(false);
      busyRef.current = false;
      Alert.alert(
        'Connexion Google',
        `Erreur OAuth (400).\n\nBundle actuel : ${Application.applicationId ?? '?'}\nURI de redirection : ${redirectUri ?? '?'}\n\nSi vous êtes sur Expo Go, lancez : npx expo run:ios`
      );
      return;
    }

    if (response.type === 'cancel' || response.type === 'dismiss') {
      setLoading(false);
      busyRef.current = false;
      return;
    }

    if (response.type === 'success') {
      const idToken = response.params?.id_token ?? response.authentication?.idToken;
      if (!idToken) {
        setLoading(false);
        busyRef.current = false;
        Alert.alert('Google', 'Jeton id_token manquant. Réessayez avec npx expo run:ios.');
        return;
      }
      void (async () => {
        try {
          await onIdToken(idToken);
        } catch (e) {
          Alert.alert('Google', e instanceof Error ? e.message : 'Erreur');
        } finally {
          setLoading(false);
          busyRef.current = false;
        }
      })();
    }
  }, [response, onIdToken, redirectUri]);

  const signInWithGoogle = useCallback(async () => {
    if (!webClientId) {
      Alert.alert('Google', 'GOOGLE_WEB_CLIENT_ID manquant dans .env');
      return;
    }

    if (Platform.OS === 'ios') {
      if (!iosClientId) {
        Alert.alert(
          'Google (iOS)',
          'Ajoutez GOOGLE_IOS_CLIENT_ID dans .env (client OAuth iOS, Bundle com.senegundo.app).'
        );
        return;
      }
      if (Application.applicationId !== EXPECTED_IOS_BUNDLE) {
        Alert.alert(
          'Google non disponible dans Expo Go',
          'Google exige le bundle com.senegundo.app.\n\nDans le terminal du projet :\nnpx expo run:ios\n\nPuis retestez « Continuer avec Google ».\n\nLa connexion e-mail fonctionne déjà dans Expo Go.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    if (!request || busyRef.current || loading) return;
    busyRef.current = true;
    setLoading(true);
    try {
      await promptAsync();
    } catch {
      setLoading(false);
      busyRef.current = false;
    }
  }, [request, promptAsync, loading, webClientId, iosClientId]);

  return {
    signInWithGoogle,
    googleLoading: loading,
    googleReady: !!request && !!(Platform.OS !== 'ios' || iosClientId),
  };
}
