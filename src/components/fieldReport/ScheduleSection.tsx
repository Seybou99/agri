import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@theme';
import { PLANTS_REQUIREMENTS } from '@constants/plants';
import type { IdealCropItem } from '@hooks/useDiagnosticReport';

interface ScheduleSectionProps {
  idealCrops: IdealCropItem[];
  selectedCrops: string[];
  style?: ViewStyle;
}

/**
 * Section Calendrier : semis et récolte par culture (sélectionnées + idéales).
 */
export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  idealCrops,
  selectedCrops,
  style,
}) => {
  const keys = Array.from(new Set([...selectedCrops, ...idealCrops.map((c) => c.key)]));
  const items = keys
    .map((k) => {
      const p = PLANTS_REQUIREMENTS[k];
      if (!p) return null;
      const start = p.growingSeason?.start ?? '–';
      const end = p.growingSeason?.end ?? '–';
      return { key: k, name: p.name, semis: start, recolte: end };
    })
    .filter(Boolean) as { key: string; name: string; semis: string; recolte: string }[];

  if (!items.length) {
    return (
      <View style={[styles.empty, style]}>
        <Text style={styles.emptyText}>
          Sélectionnez un terrain pour voir le calendrier cultural (semis, récolte).
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Calendrier cultural</Text>
      <Text style={styles.subtitle}>
        Périodes optimales de semis et de récolte par culture.
      </Text>

      <View style={styles.card}>
        <View style={styles.rowHeader}>
          <Text style={[styles.cell, styles.cellName]}>Culture</Text>
          <Text style={[styles.cell, styles.cellSmall]}>Semis</Text>
          <Text style={[styles.cell, styles.cellSmall]}>Récolte</Text>
        </View>
        {items.map(({ key, name, semis, recolte }) => (
          <View key={key} style={styles.row}>
            <Text style={[styles.cell, styles.cellName]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.cell, styles.cellSmall]}>{semis}</Text>
            <Text style={[styles.cell, styles.cellSmall]}>{recolte}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Adaptez selon la variété et les conditions locales. Les dates sont indicatives.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  title: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  rowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[100],
  },
  cell: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
  },
  cellName: {
    flex: 1,
    fontWeight: '600',
  },
  cellSmall: {
    width: 80,
    textTransform: 'capitalize',
  },
  footer: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});
