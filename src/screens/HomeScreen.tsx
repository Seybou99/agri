/**
 * HomeScreen - Page d'accueil modernisée de SeneGundo
 * Structure dynamique avec résumé d'activité, météo, services et contenu à la une
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, typography } from '@theme';
import type { RootStackParamList } from '@navigation/AppNavigator';
import { useAuth } from '@hooks/useAuth';
import { triggerHaptic } from '@utils/haptics';
import { ActivitySummary, ServiceGrid, FeaturedSlider } from '@components/home';
import { TAB_BAR_HEIGHT, TAB_BAR_MARGIN_BOTTOM } from '@navigation/styles/tabNavigatorStyles';

export const HomeScreen: React.FC = () => {
  const tabNav = useNavigation();
  const stackNav = tabNav.getParent() as NativeStackNavigationProp<RootStackParamList> | undefined;
  const { userProfile } = useAuth();
  const insets = useSafeAreaInsets();

  // Calcul précis du padding bottom pour éviter que le contenu soit masqué
  // TabBar height (64) + margin bottom (16) + FAB qui dépasse (30) + safe area bottom
  const TAB_BAR_TOTAL_HEIGHT = TAB_BAR_HEIGHT + TAB_BAR_MARGIN_BOTTOM + 30; // 30px pour le FAB qui dépasse
  const bottomPadding = Math.max(TAB_BAR_TOTAL_HEIGHT, insets.bottom + TAB_BAR_TOTAL_HEIGHT);

  const handleNewDiagnostic = () => {
    triggerHaptic();
    stackNav?.navigate('DiagnosticMap');
  };

  const handleWeatherPress = (location: { lat: number; lng: number; name: string }) => {
    stackNav?.navigate('WeatherHome', {
      lat: location.lat,
      lng: location.lng,
      locationName: location.name,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec logo et icône profil */}
      <View style={styles.topHeader}>
        <View style={styles.topHeaderContent}>
          <Text style={styles.title}>SeneGundo</Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => stackNav?.navigate('Profile')}
            activeOpacity={0.7}
          >
            {userProfile ? (
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {userProfile.displayName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            ) : (
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M16 7a4 4 0 11-8 0 4 4 0 018 0z"
                  stroke={colors.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.tagline}>
          L'intelligence des données pour la réussite de vos récoltes
        </Text>
        {userProfile && (
          <Text style={styles.welcomeText}>
            Bonjour, {userProfile.displayName || 'Utilisateur'}
          </Text>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Résumé d'activité (Carousel) */}
        <View style={styles.section}>
          <ActivitySummary
            onDiagnosticPress={handleNewDiagnostic}
            onWeatherPress={handleWeatherPress}
          />
        </View>

        {/* Section Tableau de Bord - Grille de Services */}
        <View style={styles.section}>
          <ServiceGrid onWeatherPress={handleWeatherPress} />
        </View>

        {/* Section À la Une - Slider */}
        <View style={styles.section}>
          <FeaturedSlider />
        </View>

        {/* Message de crédibilité */}
        <View style={styles.credibilitySection}>
          <View style={styles.credibilityContent}>
            <Text style={styles.shieldIcon}>🛡️</Text>
            <Text style={styles.credibilityText}>
              Certifié par la donnée : Nos rapports utilisent les bases de données de l'IER et les
              satellites de l'ESA.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 0,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  topHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
    letterSpacing: -0.5,
  },
  profileButton: {
    padding: spacing.xs,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h4,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  tagline: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'left',
    fontStyle: 'italic',
    marginTop: spacing.xs / 2,
    lineHeight: 16,
  },
  welcomeText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    marginTop: spacing.xs / 2,
    fontWeight: '500',
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  credibilitySection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
  },
  credibilityContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  shieldIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  credibilityText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 16,
    fontSize: 11,
  },
});
