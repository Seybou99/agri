/**
 * Carte « Mon dernier rapport » sur l’accueil (données persistées localement).
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '@theme';
import type { LastReportSnapshot } from '@services/lastReportStorage';
import { PLANTS_REQUIREMENTS } from '@constants/plants';

interface LastReportCardProps {
  report: LastReportSnapshot | null;
  loading?: boolean;
  onPress?: () => void;
  onNewDiagnostic?: () => void;
}

function formatTexture(texture?: string): string {
  if (!texture) return '—';
  const t = texture.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function cropLine(report: LastReportSnapshot): string {
  const names = report.crops
    .slice(0, 2)
    .map((k) => PLANTS_REQUIREMENTS[k]?.name ?? k)
    .join(' · ');
  const extra = report.crops.length > 2 ? ` +${report.crops.length - 2}` : '';
  return `${names}${extra}`;
}

export const LastReportCard: React.FC<LastReportCardProps> = ({
  report,
  loading,
  onPress,
  onNewDiagnostic,
}) => {
  if (loading) {
    return (
      <View style={styles.wrap}>
        <View style={[styles.card, styles.cardPlaceholder]}>
          <Text style={styles.placeholderText}>Chargement du dernier rapport…</Text>
        </View>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.wrap}>
        <TouchableOpacity style={styles.emptyCard} onPress={onNewDiagnostic} activeOpacity={0.85}>
          <Text style={styles.emptyTitle}>Mon dernier rapport</Text>
          <Text style={styles.emptyBody}>
            Lancez un diagnostic parcelle pour voir ici votre dernier rapport (sol, cultures, aptitude).
          </Text>
          <Text style={styles.emptyCta}>+ Nouveau diagnostic</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const aptitudePct =
    report.aptitudeScore != null ? Math.round(Math.min(100, report.aptitudeScore * 10)) : null;

  return (
    <View style={styles.wrap}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} disabled={!onPress}>
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <Text style={styles.badge}>DERNIER RAPPORT</Text>
          <Text style={styles.headline}>
            {report.topCropName ?? cropLine(report)}
            {report.locationName ? ` · ${report.locationName.split(',')[0]}` : ''}
          </Text>

          {aptitudePct != null && (
            <View style={styles.scoreRow}>
              <Text style={styles.scoreValue}>{aptitudePct}</Text>
              <Text style={styles.scoreSuffix}>% aptitude</Text>
            </View>
          )}

          {aptitudePct != null && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${aptitudePct}%` }]} />
            </View>
          )}

          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Sol</Text>
              <Text style={styles.metricValue}>{formatTexture(report.soilTexture)}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>pH</Text>
              <Text style={styles.metricValue}>
                {report.ph != null ? report.ph.toFixed(1).replace('.', ',') : '—'}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Récolte</Text>
              <Text style={styles.metricValue}>{report.harvestLabel ?? '—'}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Surface</Text>
              <Text style={styles.metricValue}>{report.surfaceHa} ha</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  card: {
    borderRadius: 20,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  cardPlaceholder: {
    backgroundColor: colors.gray[200],
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.primaryDark,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptyBody: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  emptyCta: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.sm,
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.primaryLight,
    lineHeight: 52,
  },
  scoreSuffix: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: 3,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metric: {
    minWidth: '42%',
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});
