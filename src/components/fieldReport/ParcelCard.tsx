import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, typography } from '@theme';

export interface ParcelCardData {
  name: string;
  id: string;
  culture: string;
  stage?: string;
  surfaceHa: number;
}

interface ParcelCardProps {
  data: ParcelCardData;
  onBack: () => void;
  /** Retour à l’accueil (remplace le bouton expand quand fourni). */
  onFinish?: () => void;
  onExpand?: () => void;
  style?: ViewStyle;
}

/**
 * Carte de parcelle : aperçu zone, nom, id, culture, surface.
 * Boutons retour + expand. Style maquette (coins arrondis, ombre).
 */
export const ParcelCard: React.FC<ParcelCardProps> = ({
  data,
  onBack,
  onFinish,
  onExpand,
  style,
}) => (
  <View style={[styles.card, style]}>
    <View style={styles.topBar}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.iconBtn}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityLabel="Retour"
      >
        <Text style={styles.icon}>←</Text>
      </TouchableOpacity>
      {onFinish ? (
        <TouchableOpacity
          onPress={onFinish}
          style={[styles.iconBtn, styles.iconBtnPrimary]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Retour à l'accueil"
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1v-9.5z"
              stroke={colors.white}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      ) : onExpand ? (
        <TouchableOpacity
          onPress={onExpand}
          style={styles.iconBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.icon}>↗</Text>
        </TouchableOpacity>
      ) : null}
    </View>
    <View style={styles.mapArea}>
      <View style={styles.mapShape}>
        <Text style={styles.mapEmoji}>🌾</Text>
      </View>
    </View>
    <Text style={styles.name}>{data.name}</Text>
    <Text style={styles.meta}>
      {data.id} • {data.culture}
    </Text>
    {(data.stage || data.surfaceHa) && (
      <Text style={styles.meta2}>
        {[data.stage, `${data.surfaceHa} ha`].filter(Boolean).join(' • ')}
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  icon: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  mapArea: {
    height: 140,
    backgroundColor: colors.gray[100],
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.gray[300],
  },
  mapShape: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    margin: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapEmoji: {
    fontSize: 36,
  },
  name: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  meta: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  meta2: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
});
