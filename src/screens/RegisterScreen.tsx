import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { useAuth } from '@hooks/useAuth';
import { useGoogleAuth } from '@hooks/useGoogleAuth';
import {
  AuthScreenLayout,
  AuthTextField,
  GoogleSignInButton,
} from '@components/auth';
import { Button } from '@components/common';
import { colors, spacing, typography } from '@theme';
import { isFirebaseConfigured } from '@config/firebase';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { signUp, signInWithGoogleIdToken, isFirebaseReady } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const finishGoogle = useCallback(
    async (idToken: string) => {
      await signInWithGoogleIdToken(idToken);
      navigation.goBack();
    },
    [navigation, signInWithGoogleIdToken]
  );

  const { signInWithGoogle, googleLoading, googleReady } = useGoogleAuth(finishGoogle);

  const handleRegister = async () => {
    if (!displayName.trim()) {
      Alert.alert('Inscription', 'Indiquez votre nom.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Inscription', 'Indiquez votre e-mail.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Inscription', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Inscription', 'Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, displayName, phone, 'utilisateur');
      Alert.alert('Compte créé', 'Bienvenue sur SeneGundo !', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      const err = e as Error & { authCreated?: boolean };
      if (err.authCreated) {
        Alert.alert(
          'Compte créé (profil en attente)',
          err.message,
          [{ text: 'Continuer', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Inscription', err.message || 'Erreur');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isFirebaseReady) {
    return (
      <AuthScreenLayout
        title="Inscription"
        subtitle="Configuration Firebase requise"
        onBack={() => navigation.goBack()}
      >
        <Text style={styles.configHint}>
          Ajoutez FIREBASE_API_KEY, FIREBASE_PROJECT_ID et FIREBASE_APP_ID dans .env.
        </Text>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      title="Créer un compte"
      subtitle="Rejoignez SeneGundo pour vos diagnostics parcelle"
      onBack={() => navigation.goBack()}
      footer={
        <TouchableOpacity onPress={() => navigation.navigate('AuthLogin')}>
          <Text style={styles.footerText}>
            Déjà inscrit ? <Text style={styles.footerLink}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      }
    >
      <AuthTextField
        label="Nom complet"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Ex. Moussa Diarra"
        autoCapitalize="words"
      />
      <AuthTextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        placeholder="vous@exemple.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AuthTextField
        label="Téléphone (optionnel)"
        value={phone}
        onChangeText={setPhone}
        placeholder="+223 00 00 00 00"
        keyboardType="phone-pad"
      />
      <AuthTextField
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        placeholder="6 caractères minimum"
        secureTextEntry
      />
      <AuthTextField
        label="Confirmer le mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="••••••••"
        secureTextEntry
      />

      <Button title="S'inscrire" onPress={handleRegister} loading={loading} fullWidth />

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
