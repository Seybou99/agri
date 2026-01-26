import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@theme';

export type GrowthPeriod = 'W' | 'M' | 'Y';

export interface GrowthChartData {
  value: string;
  trend: 'up' | 'down';
  period: GrowthPeriod;
  bars: number[]; // hauteurs relatives 0–100
  labels?: string[]; // ex. ['Avr, 20', 'Mai, 20']
}

interface GrowthChartProps {
  data: GrowthChartData;
  onPeriodChange?: (p: GrowthPeriod) => void;
  style?: ViewStyle;
}

const PERIODS: GrowthPeriod[] = ['W', 'M', 'Y'];
const CHART_HEIGHT = 120;

/**
 * Graphique pluviométrie : titre, valeur (mm/mois), tendance, filtres W/M/Y, barres.
 */
export const GrowthChart: React.FC<GrowthChartProps> = ({
  data,
  onPeriodChange,
  style,
}) => {
  const maxBar = useMemo(
    () => (data.bars.length ? Math.max(...data.bars) : 100),
    [data.bars]
  );

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Pluviométrie</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{data.value}</Text>
            <Text style={data.trend === 'up' ? styles.trendUp : styles.trendDown}>
              {data.trend === 'up' ? '↑' : '↓'}
            </Text>
          </View>
        </View>
        <View style={styles.filters}>
          {PERIODS.map((p) => {
            const isActive = data.period === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => onPeriodChange?.(p)}
                style={[styles.filter, isActive && styles.filterActive]}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.filterText, isActive && styles.filterTextActive]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={styles.chart}>
        {data.bars.map((h, i) => {
          const barHeight = maxBar > 0
            ? Math.max(10, (h / maxBar) * CHART_HEIGHT)
            : 10;
          return (
            <View key={i} style={styles.barWrap}>
              <View style={[styles.bar, { height: barHeight }]} />
            </View>
          );
        })}
      </View>
      {data.labels && data.labels.length >= 2 && (
        <View style={styles.axis}>
          <Text style={styles.axisLabel}>{data.labels[0]}</Text>
          <Text style={styles.axisLabel}>{data.labels[data.labels.length - 1]}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text.primary,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text.primary,
  },
  trendUp: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.primary,
  },
  trendDown: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.error,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  filter: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  filterText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 4,
    marginBottom: spacing.sm,
  },
  barWrap: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    minHeight: 8,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
  },
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  axisLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
});
