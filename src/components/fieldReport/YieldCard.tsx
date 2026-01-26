import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { colors, spacing, typography } from '@theme';

export interface YieldCardData {
  parcelName: string;
  parcelId: string;
  expectedHarvest: string;
  yieldKgHa: string;
}

interface YieldCardProps {
  data: YieldCardData;
  onAction?: () => void;
  style?: ViewStyle;
}

/**
 * Section rendement / récolte : image, nom, date, kg/ha, bouton action.
 */
export const YieldCard: React.FC<YieldCardProps> = ({
  data,
  onAction,
  style,
}) => (
  <View style={[styles.card, style]}>
    <View style={styles.thumb}>
      <Text style={styles.thumbEmoji}>🌾</Text>
    </View>
    <View style={styles.body}>
      <Text style={styles.title}>
        {data.parcelName} {data.parcelId}
      </Text>
      <Text style={styles.label}>Récolte estimée</Text>
      <Text style={styles.date}>{data.expectedHarvest}</Text>
      <View style={styles.row}>
        <Text style={styles.yieldIcon}>🍃</Text>
        <Text style={styles.yield}>{data.yieldKgHa}</Text>
      </View>
    </View>
    <TouchableOpacity
      onPress={onAction}
      style={styles.actionBtn}
      activeOpacity={0.8}
    >
      <Text style={styles.actionIcon}>↗</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: {
    fontSize: 28,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  label: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  date: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  yieldIcon: {
    fontSize: 14,
  },
  yield: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
});
