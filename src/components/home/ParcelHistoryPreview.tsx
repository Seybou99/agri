import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '@theme';
import { getLatestGroupWithComparison } from '@services/parcelHistoryStorage';
import type { ParcelHistoryGroup } from '@models/ParcelHistory';
import { SeasonCompareCard } from '@components/parcelHistory/SeasonCompareCard';

interface ParcelHistoryPreviewProps {
  onPressHistory?: () => void;
  onPressSeason?: (parcelId: string, crops: string[], lat: number, lng: number, locationName: string, surfaceHa: number) => void;
}

export const ParcelHistoryPreview: React.FC<ParcelHistoryPreviewProps> = ({
  onPressHistory,
  onPressSeason,
}) => {
  const [group, setGroup] = useState<ParcelHistoryGroup | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const latest = await getLatestGroupWithComparison();
    setGroup(latest);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (loading) return null;
  if (!group) return null;

  const latest = group.seasons[0];

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>HISTORIQUE PARCELLE</Text>
        {onPressHistory ? (
          <TouchableOpacity onPress={onPressHistory} hitSlop={12}>
            <Text style={styles.link}>Tout voir</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        disabled={!onPressSeason}
        onPress={() =>
          onPressSeason?.(
            latest.parcelId,
            latest.crops,
            latest.lat,
            latest.lng,
            latest.locationName,
            latest.surfaceHa
          )
        }
      >
        <SeasonCompareCard group={group} compact />
      </TouchableOpacity>

      {latest.offlineAvailable && (
        <Text style={styles.offlineHint}>Rapport et recommandations disponibles hors ligne</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.text.secondary,
  },
  link: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  offlineHint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
