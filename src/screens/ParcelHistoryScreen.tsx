/**
 * Historique des diagnostics par parcelle — comparaison saison N vs N-1.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, typography } from '@theme';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { useParcelHistory } from '@hooks/useParcelHistory';
import { SeasonCompareCard } from '@components/parcelHistory/SeasonCompareCard';
import { PLANTS_REQUIREMENTS } from '@constants/plants';

export const ParcelHistoryScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const insets = useSafeAreaInsets();
  const { groups, loading } = useParcelHistory();

  const openSeason = (parcelId: string, crops: string[], lat: number, lng: number, locationName: string, surface: number) => {
    navigation.navigate('FieldReport', {
      parcelId,
      crops,
      lat,
      lng,
      locationName,
      surface,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: spacing.sm + insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18l-6-6 6-6"
              stroke={colors.text.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Mes parcelles</Text>
          <Text style={styles.subtitle}>Suivi dans le temps · cache hors ligne</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Aucun historique</Text>
          <Text style={styles.emptyBody}>
            Lancez un diagnostic parcelle : chaque rapport sera enregistré localement. Refaites un diagnostic au
            même endroit pour comparer deux saisons.
          </Text>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => navigation.navigate('DiagnosticMap')}
          >
            <Text style={styles.ctaText}>Nouveau diagnostic</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          {groups.map((group) => (
            <View key={group.parcelStableKey} style={styles.groupBlock}>
              <SeasonCompareCard group={group} />
              <Text style={styles.timelineTitle}>Diagnostics enregistrés</Text>
              {group.seasons.map((season) => {
                const cropLine = season.crops
                  .slice(0, 2)
                  .map((k) => PLANTS_REQUIREMENTS[k]?.name ?? k)
                  .join(' · ');
                return (
                  <TouchableOpacity
                    key={season.id}
                    style={styles.seasonRow}
                    onPress={() =>
                      openSeason(
                        season.parcelId,
                        season.crops,
                        season.lat,
                        season.lng,
                        season.locationName,
                        season.surfaceHa
                      )
                    }
                    activeOpacity={0.85}
                  >
                    <View style={styles.seasonMain}>
                      <Text style={styles.seasonLabel}>{season.seasonLabel}</Text>
                      <Text style={styles.seasonCrop}>{cropLine}</Text>
                    </View>
                    <View style={styles.seasonMeta}>
                      {season.aptitudeScore != null && (
                        <Text style={styles.seasonScore}>{Math.round(season.aptitudeScore * 10)}%</Text>
                      )}
                      {season.offlineAvailable && <Text style={styles.offlineBadge}>Hors ligne</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[200],
  },
  backBtn: {
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.h4,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyBody: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  cta: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  ctaText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  groupBlock: {
    gap: spacing.md,
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  seasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  seasonMain: {
    flex: 1,
  },
  seasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  seasonCrop: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  seasonMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  seasonScore: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  offlineBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.primaryLight + '55',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
