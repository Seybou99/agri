/**
 * ACCÈS RAPIDE — grille 2×2 + bandeau données certifiées
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { colors, spacing } from '@theme';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '@navigation/AppNavigator';

type IconVariant = 'onDark' | 'onOrange' | 'onLight';

type QuickAccessItem = {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  titleColor: string;
  subtitleColor: string;
  border?: boolean;
  iconVariant: IconVariant;
  iconColor: string;
  ionIcon?: ComponentProps<typeof Ionicons>['name'];
  mciIcon?: ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress: () => void;
};

const ICON_BOX_BG: Record<IconVariant, string> = {
  onDark: 'rgba(255,255,255,0.18)',
  onOrange: 'rgba(255,255,255,0.22)',
  onLight: colors.gray[100],
};

function QuickCardIcon({ item }: { item: QuickAccessItem }) {
  if (item.mciIcon) {
    return <MaterialCommunityIcons name={item.mciIcon} size={24} color={item.iconColor} />;
  }
  return <Ionicons name={item.ionIcon!} size={24} color={item.iconColor} />;
}

function QuickCard({ item }: { item: QuickAccessItem }) {
  return (
    <TouchableOpacity
      style={[
        styles.quickCard,
        { backgroundColor: item.backgroundColor },
        item.border && styles.quickCardBorder,
      ]}
      onPress={item.onPress}
      activeOpacity={0.85}
    >
      <View style={styles.quickCardBody}>
        <View style={[styles.iconBox, { backgroundColor: ICON_BOX_BG[item.iconVariant] }]}>
          <QuickCardIcon item={item} />
        </View>
        <View style={styles.quickTextBlock}>
          <Text style={[styles.quickTitle, { color: item.titleColor }]}>{item.title}</Text>
          <Text style={[styles.quickSubtitle, { color: item.subtitleColor }]}>{item.subtitle}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const ServiceGrid: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();

  const items: QuickAccessItem[] = [
    {
      id: 'diagnostic',
      title: 'Diagnostic',
      subtitle: 'À partir de 5 000 FCFA',
      backgroundColor: colors.primaryDark,
      titleColor: colors.white,
      subtitleColor: 'rgba(255,255,255,0.85)',
      iconVariant: 'onDark',
      iconColor: colors.white,
      ionIcon: 'bar-chart-outline',
      onPress: () => navigation.navigate('DiagnosticMap'),
    },
    {
      id: 'academy',
      title: 'Académie',
      subtitle: 'Formations & guides',
      backgroundColor: colors.white,
      titleColor: colors.text.primary,
      subtitleColor: colors.text.secondary,
      border: true,
      iconVariant: 'onLight',
      iconColor: colors.primaryDark,
      ionIcon: 'book-outline',
      onPress: () => navigation.navigate('MainTabs', { screen: 'Academy' }),
    },
    {
      id: 'elevage',
      title: 'Élevage',
      subtitle: 'Suivi & conseils',
      backgroundColor: '#E67E22',
      titleColor: colors.white,
      subtitleColor: 'rgba(255,255,255,0.9)',
      iconVariant: 'onOrange',
      iconColor: colors.white,
      mciIcon: 'paw',
      onPress: () => navigation.navigate('MainTabs', { screen: 'Academy' }),
    },
    {
      id: 'shop',
      title: 'Boutique',
      subtitle: 'Intrants & semences',
      backgroundColor: colors.white,
      titleColor: colors.text.primary,
      subtitleColor: colors.text.secondary,
      border: true,
      iconVariant: 'onLight',
      iconColor: colors.primaryDark,
      ionIcon: 'bag-handle-outline',
      onPress: () => navigation.navigate('MainTabs', { screen: 'Marketplace' }),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>ACCÈS RAPIDE</Text>

      <View style={styles.grid}>
        <View style={styles.row}>
          <QuickCard item={items[0]} />
          <QuickCard item={items[1]} />
        </View>
        <View style={styles.row}>
          <QuickCard item={items[2]} />
          <QuickCard item={items[3]} />
        </View>
      </View>

      <View style={styles.certified}>
        <Text style={styles.certifiedIcon}>🛡️</Text>
        <View style={styles.certifiedTextWrap}>
          <Text style={styles.certifiedTitle}>Données certifiées</Text>
          <Text style={styles.certifiedSources}>iSDAsoil · NASA POWER · ESA Sentinel</Text>
        </View>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>Vérifié</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  grid: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.md,
    minHeight: 118,
  },
  quickCardBorder: {
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  /** Colonne icône + texte, ancrée en haut à gauche (maquette). */
  quickCardBody: {
    gap: 10,
    alignSelf: 'stretch',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTextBlock: {
    alignSelf: 'stretch',
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'left',
  },
  quickSubtitle: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'left',
  },
  certified: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  certifiedIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  certifiedTextWrap: {
    flex: 1,
  },
  certifiedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  certifiedSources: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: colors.primaryLight + '40',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});
