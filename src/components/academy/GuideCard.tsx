import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import type { AcademyGuide } from '@models/AcademyGuide';
import {
  ACADEMY_DOMAIN_LABELS,
  ACADEMY_FILE_TYPE_ICONS,
} from '@constants/academy';
import { colors, spacing, typography } from '@theme';

interface GuideCardProps {
  guide: AcademyGuide;
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide }) => {
  const navigation = useNavigation<AppNavigationProp>();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('AcademyGuideDetail', { guideId: guide.id })}
    >
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{ACADEMY_FILE_TYPE_ICONS[guide.fileType]}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {guide.title}
        </Text>
        <Text style={styles.domain}>{ACADEMY_DOMAIN_LABELS[guide.domain]}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {guide.description}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.author}>{guide.sellerDisplayName}</Text>
          {guide.isFree ? (
            <View style={styles.freeBadge}>
              <Text style={styles.freeText}>Gratuit</Text>
            </View>
          ) : (
            <Text style={styles.price}>{formatPrice(guide.price)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primaryLight + '60',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: { fontSize: 28 },
  body: { flex: 1 },
  title: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  domain: {
    fontSize: typography.caption.fontSize,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  price: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  freeBadge: {
    backgroundColor: colors.success + '22',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  freeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
});
