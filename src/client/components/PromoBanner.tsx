import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ClientTheme } from '@client/theme/useClientTheme';
import { colors, spacing, typography } from '@theme';

interface PromoBannerProps {
  theme: ClientTheme;
  onPress?: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ theme, onPress }) => (
  <TouchableOpacity
    style={[
      styles.wrap,
      theme.isDark ? styles.wrapDark : styles.wrapLight,
      !theme.isDark && { backgroundColor: theme.surface, borderColor: theme.border },
    ]}
    activeOpacity={0.9}
    onPress={onPress}
  >
    <View style={styles.textCol}>
      <Text style={[styles.title, { color: theme.text }]}>Votre première livraison est gratuite</Text>
      <Text style={[styles.sub, { color: theme.textSecondary }]}>Offre appliquée automatiquement</Text>
    </View>

    <View style={styles.visualCol}>
      <View style={[styles.giftWrap, { backgroundColor: colors.primaryLight + '55' }]}>
        <Ionicons name="gift" size={40} color={colors.primaryDark} />
      </View>
      <View style={[styles.arrowBtn, { backgroundColor: theme.promoArrowBg }]}>
        <Ionicons name="chevron-forward" size={22} color={theme.promoArrowIcon} />
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  wrapDark: {
    paddingHorizontal: spacing.lg,
  },
  wrapLight: {
    borderRadius: 16,
    borderWidth: 1,
  },
  textCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
  },
  sub: {
    ...typography.bodySmall,
  },
  visualCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  giftWrap: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
