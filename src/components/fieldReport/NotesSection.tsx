import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@theme';
import type { IdealCropItem } from '@hooks/useDiagnosticReport';
import type { MatchingResult } from '@services/agronomy/matchingEngine';

interface NotesSectionProps {
  idealCrops: IdealCropItem[];
  matchingByCrop: Record<string, MatchingResult>;
  selectedCrops: string[];
  style?: ViewStyle;
}

/**
 * Section Notes : alertes et recommandations du diagnostic (matching).
 * Agrège les alertes/recos des cultures sélectionnées ou des cultures idéales.
 */
export const NotesSection: React.FC<NotesSectionProps> = ({
  idealCrops,
  matchingByCrop,
  selectedCrops,
  style,
}) => {
  const alerts: string[] = [];
  const recommendations: string[] = [];
  const seenAlert = new Set<string>();
  const seenReco = new Set<string>();

  const addFrom = (result: MatchingResult) => {
    for (const a of result.alerts) {
      if (!seenAlert.has(a)) {
        seenAlert.add(a);
        alerts.push(a);
      }
    }
    for (const r of result.recommendations) {
      if (!seenReco.has(r)) {
        seenReco.add(r);
        recommendations.push(r);
      }
    }
  };

  if (selectedCrops.length) {
    for (const k of selectedCrops) {
      const m = matchingByCrop[k];
      if (m) addFrom(m);
    }
  }
  if (alerts.length === 0 && recommendations.length === 0 && idealCrops.length) {
    for (const { result } of idealCrops) addFrom(result);
  }

  const hasAny = alerts.length > 0 || recommendations.length > 0;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Notes du diagnostic</Text>
      <Text style={styles.subtitle}>
        Alertes et recommandations selon le sol, le climat et les cultures.
      </Text>

      {!hasAny && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Aucune alerte ni recommandation spécifique pour cette zone.
          </Text>
          <Text style={styles.hint}>
            Les cultures idéales (onglet Analyse) sont adaptées au pH, à l'humidité et à la pluviométrie.
          </Text>
        </View>
      )}

      {alerts.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alertes</Text>
          {alerts.map((a, i) => (
            <Text key={i} style={styles.bullet}>⚠ {a}</Text>
          ))}
        </View>
      )}

      {recommendations.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recommandations</Text>
          {recommendations.map((r, i) => (
            <Text key={i} style={styles.bullet}>• {r}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  empty: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    fontStyle: 'italic',
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
  cardTitle: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  bullet: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 4,
  },
});
