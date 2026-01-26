import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '@theme';
import { Button } from '@components/common';
import type { RootStackParamList } from '@navigation/AppNavigator';

export const HomeScreen: React.FC = () => {
  const tabNav = useNavigation();
  const stackNav = tabNav.getParent() as NativeStackNavigationProp<RootStackParamList> | undefined;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>SeneGundo</Text>
        <Text style={styles.tagline}>L'intelligence des données pour la réussite de vos récoltes</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nos Services</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardIcon}>🔍</Text>
          <Text style={styles.cardTitle}>Diagnostic Agricole</Text>
          <Text style={styles.cardDescription}>
            Analysez votre terrain et découvrez la culture la plus adaptée grâce à nos données scientifiques.
          </Text>
          <Text style={styles.cardPrice}>À partir de 5 000 FCFA</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>🛒</Text>
          <Text style={styles.cardTitle}>Marketplace</Text>
          <Text style={styles.cardDescription}>
            Vendez vos récoltes et achetez des intrants certifiés adaptés à votre terrain.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>📚</Text>
          <Text style={styles.cardTitle}>Académie</Text>
          <Text style={styles.cardDescription}>
            Formez-vous aux meilleures pratiques agricoles avec nos guides et tutoriels.
          </Text>
        </View>
      </View>

      <View style={styles.ctaSection}>
        <Button
          title="Nouveau Diagnostic"
          onPress={() => stackNav?.navigate('DiagnosticMap')}
          fullWidth
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🛡️ Certifié par la donnée : Nos rapports utilisent les bases de données de l'IER et les satellites de l'ESA.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100, // Éviter le chevauchement avec la TabBar
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  tagline: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  cardPrice: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  ctaSection: {
    marginVertical: spacing.xl,
  },
  footer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  footerText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
