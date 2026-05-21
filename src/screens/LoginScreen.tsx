import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { useAuth } from '@hooks/useAuth';
import { useGoogleAuth } from '@hooks/useGoogleAuth';
import { AuthScreenLayout, AuthTextField, GoogleSignInButton } from '@components/auth';
import { Button } from '@components/common';
import { colors, spacing, typography } from '@theme';
import { isFirebaseConfigured, getMissingFirebaseEnvVars } from '@config/firebase';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { signIn, signInWithGoogleIdToken, isFirebaseReady } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const finishGoogle = useCallback(
    async (idToken: string) => {
      await signInWithGoogleIdToken(idToken);
      navigation.goBack();
    },
    [navigation, signInWithGoogleIdToken]
  );

  const { signInWithGoogle, googleLoading, googleReady } = useGoogleAuth(finishGoogle);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Connexion', 'Renseignez votre e-mail et mot de passe.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Connexion', e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (!isFirebaseReady) {
    return (
      <AuthScreenLayout
        title="Connexion"
        subtitle="Configuration Firebase requise"
        onBack={() => navigation.goBack()}
      >
        <Text style={styles.configHint}>
          Variables manquantes dans .env :{'\n'}
          {getMissingFirebaseEnvVars().map((v) => `• ${v}`).join('\n')}
          {'\n\n'}
          FIREBASE_API_KEY = clé « Browser key (auto created by Firebase) » (Google Cloud →
          Identifiants).{'\n'}
          FIREBASE_APP_ID = ID app Web (Firebase → Paramètres → Vos applications → Web).{'\n\n'}
          Ce ne sont pas FIREBASE_CLIENT_ID ni la clé privée du compte de service.
        </Text>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      title="Connexion"
      subtitle="Accédez à vos diagnostics et à votre profil"
      onBack={() => navigation.goBack()}
      footer={
        <TouchableOpacity onPress={() => navigation.navigate('AuthRegister')}>
          <Text style={styles.footerText}>
            Pas encore de compte ? <Text style={styles.footerLink}>Créer un compte</Text>
          </Text>
        </TouchableOpacity>
      }
    >
      <AuthTextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        placeholder="vous@exemple.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <AuthTextField
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
      />

      <Button title="Se connecter" onPress={handleEmailLogin} loading={loading} fullWidth />

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleSignInButton
        onPress={signInWithGoogle}
        loading={googleLoading}
        disabled={!googleReady}
      />
    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  configHint: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.gray[200] },
  dividerText: { fontSize: typography.caption.fontSize, color: colors.text.secondary },
  footerText: { fontSize: typography.body.fontSize, color: 'rgba(255,255,255,0.9)' },
  footerLink: { fontWeight: '700', color: colors.white, textDecorationLine: 'underline' },
});
