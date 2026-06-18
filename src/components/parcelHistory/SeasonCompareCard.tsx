import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@theme';
import type { ParcelHistoryGroup } from '@models/ParcelHistory';
import { PLANTS_REQUIREMENTS } from '@constants/plants';

interface SeasonCompareCardProps {
  group: ParcelHistoryGroup;
  compact?: boolean;
}

function formatDelta(value: number | null, unit: string): string {
  if (value == null) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}${unit}`;
}

export const SeasonCompareCard: React.FC<SeasonCompareCardProps> = ({ group, compact }) => {
  const { comparison, locationName } = group;
  if (!comparison) {
    return (
      <View style={[styles.card, compact && styles.cardCompact]}>
        <Text style={styles.title}>{locationName.split(',')[0]}</Text>
        <Text style={styles.hint}>Un seul diagnostic pour cette parcelle. Relancez un diagnostic la saison prochaine pour comparer.</Text>
      </View>
    );
  }

  const { current, previous, scoreDelta, rainfallDelta } = comparison;
  const cropName =
    current.topCropName ??
    PLANTS_REQUIREMENTS[current.crops[0] ?? '']?.name ??
    current.crops[0] ??
    'Culture';

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <Text style={styles.badge}>SAISON N vs N-1</Text>
      <Text style={styles.title}>{locationName.split(',')[0]}</Text>
      <Text style={styles.subtitle}>{cropName} · {current.surfaceHa} ha</Text>

      <View style={styles.columns}>
        <View style={styles.col}>
          <Text style={styles.colLabel}>{previous.seasonLabel}</Text>
          <Text style={styles.colValue}>
            {previous.aptitudeScore != null ? `${Math.round(previous.aptitudeScore * 10)}%` : '—'}
          </Text>
          <Text style={styles.colMeta}>
            {previous.annualRainfall != null ? `${Math.round(previous.annualRainfall)} mm/an` : 'Pluie —'}
          </Text>
        </View>
        <View style={styles.arrowCol}>
          <Text style={styles.arrow}>→</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.colLabel}>{current.seasonLabel}</Text>
          <Text style={[styles.colValue, styles.colValueCurrent]}>
            {current.aptitudeScore != null ? `${Math.round(current.aptitudeScore * 10)}%` : '—'}
          </Text>
          <Text style={styles.colMeta}>
            {current.annualRainfall != null ? `${Math.round(current.annualRainfall)} mm/an` : 'Pluie —'}
          </Text>
        </View>
      </View>

      <View style={styles.deltaRow}>
        <View style={styles.deltaChip}>
          <Text style={styles.deltaLabel}>Aptitude</Text>
          <Text
            style={[
              styles.deltaValue,
              scoreDelta != null && scoreDelta > 0 && styles.deltaUp,
              scoreDelta != null && scoreDelta < 0 && styles.deltaDown,
            ]}
          >
            {formatDelta(scoreDelta != null ? scoreDelta * 10 : null, ' pts')}
          </Text>
        </View>
        <View style={styles.deltaChip}>
          <Text style={styles.deltaLabel}>Pluviométrie</Text>
          <Text style={styles.deltaValue}>{formatDelta(rainfallDelta, ' mm')}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardCompact: {
    padding: spacing.md,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  col: {
    flex: 1,
  },
  arrowCol: {
    paddingHorizontal: spacing.sm,
  },
  arrow: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  colLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  colValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  colValueCurrent: {
    color: colors.primaryDark,
  },
  colMeta: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  deltaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  deltaChip: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 10,
    padding: spacing.sm,
  },
  deltaLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  deltaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  deltaUp: {
    color: colors.primaryDark,
  },
  deltaDown: {
    color: colors.error,
  },
});
