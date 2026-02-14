import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@theme';
import { PLANTS_REQUIREMENTS } from '@constants/plants';
import type { IdealCropItem } from '@hooks/useDiagnosticReport';

interface AnalysisSectionProps {
  idealCrops: IdealCropItem[];
  otherCrops: IdealCropItem[];
  style?: ViewStyle;
}

const SUITABILITY_LABEL: Record<string, string> = {
  'Very High': 'Très élevée',
  High: 'Élevée',
  Medium: 'Moyenne',
  Low: 'Faible',
};

/** Indicateur visuel Phase 2 : score → 🔴🟡🟢 (aligné sur matchingEngine) */
function getScoreIndicator(score: number): string {
  if (score >= 6.5) return '🟢';
  if (score >= 5) return '🟡';
  return '🔴';
}

function CropCard({
  cropKey,
  name,
  result,
  compact,
  expanded,
  onToggle,
  onBuySeeds,
}: {
  cropKey: string;
  name: string;
  result: IdealCropItem['result'];
  compact?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  onBuySeeds?: (cropKey: string) => void;
}) {
  const plant = PLANTS_REQUIREMENTS[cropKey];
  const suitability = SUITABILITY_LABEL[result.suitability] ?? result.suitability;
  const seedTypes = plant?.seedTypes ?? [];
  const tips = plant?.practicalTips ?? [];
  const showDetails = !compact || expanded;

  const indicator = getScoreIndicator(result.score);
  const header = (
    <View style={styles.cardHeader}>
      <Text style={styles.cropName}>{name}</Text>
      <View style={styles.scoreBadge}>
        <Text style={styles.scoreIndicator}>{indicator}</Text>
        <Text style={styles.scoreText}>{result.score}/10</Text>
      </View>
    </View>
  );

  const content = (
    <>
      {header}
      <Text style={styles.aptitude}>
        {compact
          ? `Aptitude : ${suitability}${showDetails ? '' : ' — Toucher pour voir semences et conseils'}`
          : `Aptitude : ${suitability} (sol ${result.details.soilScore} · climat ${result.details.climateScore} · eau ${result.details.waterScore})`}
      </Text>
      {showDetails && (
        <>
          {seedTypes.length > 0 && (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Semences recommandées</Text>
              <Text style={styles.blockContent}>{seedTypes.join(' · ')}</Text>
              {onBuySeeds && !compact && (
                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => onBuySeeds(cropKey)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buyButtonText}>🛒 Acheter les semences</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {tips.length > 0 && (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Conseils pratiques</Text>
              {tips.map((t, i) => (
                <Text key={i} style={styles.bullet}>• {t}</Text>
              ))}
            </View>
          )}
        </>
      )}
    </>
  );

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      {compact && onToggle ? (
        <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
          {content}
        </TouchableOpacity>
      ) : (
        content
      )}
    </View>
  );
}

/**
 * Section Analysis : cultures idéales pour la zone (pH, humidité, pluviométrie),
 * semences recommandées, conseils pratiques, et autres cultures.
 */
export const AnalysisSection: React.FC<AnalysisSectionProps> = ({
  idealCrops,
  otherCrops,
  style,
  onBuySeeds,
}) => {
  const [expandedOther, setExpandedOther] = useState<string | null>(null);

  if (!idealCrops.length && !otherCrops.length) {
    return (
      <View style={[styles.empty, style]}>
        <Text style={styles.emptyText}>
          Sélectionnez un terrain pour voir les cultures idéales (pH, humidité, pluviométrie).
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Cultures idéales pour la zone</Text>
      <Text style={styles.subtitle}>
        Proposition selon pH, humidité, nutriments et pluviométrie.
      </Text>

      {idealCrops.map(({ key, name, result }) => (
        <CropCard
          key={key}
          cropKey={key}
          name={name}
          result={result}
          onBuySeeds={onBuySeeds}
        />
      ))}

      {otherCrops.length > 0 && (
        <>
          <Text style={styles.otherTitle}>Autres cultures recommandées</Text>
          <Text style={styles.otherSubtitle}>
            Touchez une culture pour afficher semences et conseils.
          </Text>
          {otherCrops.map(({ key, name, result }) => (
            <CropCard
              key={key}
              cropKey={key}
              name={name}
              result={result}
              compact
              expanded={expandedOther === key}
              onToggle={() => setExpandedOther((prev) => (prev === key ? null : key))}
            />
          ))}
        </>
      )}
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
  cardCompact: {
    padding: spacing.md,
  },
  otherTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  otherSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cropName: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  scoreIndicator: {
    fontSize: 18,
    marginRight: 4,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  aptitude: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  block: {
    marginTop: spacing.sm,
  },
  blockTitle: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  blockContent: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  bullet: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 2,
  },
  buyButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buyButtonText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
  },
});
