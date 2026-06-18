import { useColorScheme } from 'react-native';
import { colors } from '@theme';

/** Couleurs sémantiques client — respecte le thème clair/sombre du téléphone. */
export function useClientTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return {
    isDark,
    /** Hero accueil client — vert lumineux (équivalent chaleur du jaune maquette). */
    hero: '#3A9B52',
    heroDark: colors.primaryDark,
    /** Bordure cercle + pilule catégories (équivalent ambré de la maquette). */
    categoryRingBorder: isDark ? 'rgba(255, 255, 255, 0.4)' : '#2A7340',
    /** Blob organique derrière le ring (jaune clair translucide → blanc/vert sur hero). */
    categoryBlobFill: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.34)',
    /** Deuxième bordure, plus large et transparente. */
    categoryRingBorderOuter: isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(42, 115, 64, 0.42)',
    /** Ombre sous la vague de transition. */
    heroWaveShadow: 'rgba(0, 0, 0, 0.12)',
    screen: isDark ? '#000000' : colors.background,
    surface: isDark ? '#1C1C1E' : colors.white,
    surfaceMuted: isDark ? '#2C2C2E' : '#E8E8ED',
    brandCard: isDark ? '#2C2C2E' : '#E8E8ED',
    text: isDark ? '#FFFFFF' : colors.text.primary,
    textSecondary: isDark ? '#ABABAB' : colors.text.secondary,
    border: isDark ? '#3A3A3C' : colors.gray[200],
    tabBar: isDark ? '#000000' : colors.white,
    tabActive: isDark ? colors.primaryLight : colors.primary,
    tabInactive: isDark ? '#8E8E93' : colors.gray[500],
    /** Pilule adresse sur le hero (crème comme la maquette) */
    locationPill: isDark ? 'rgba(255,255,255,0.18)' : '#F5E6B8',
    locationPillText: isDark ? colors.white : colors.text.primary,
    promoArrowBg: isDark ? '#000000' : colors.text.primary,
    promoArrowIcon: colors.white,
  };
}

export type ClientTheme = ReturnType<typeof useClientTheme>;
