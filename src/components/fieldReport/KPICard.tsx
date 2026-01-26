import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@theme';

export interface KPICardData {
  id: string;
  label: string;
  value: string;
  icon: string; // emoji ou caractère unique
}

interface KPICardProps {
  data: KPICardData;
  style?: ViewStyle;
}

/**
 * Carte KPI : icône, label, valeur. Style maquette (arrondi, ombre).
 */
export const KPICard: React.FC<KPICardProps> = ({ data, style }) => (
  <View style={[styles.card, style]}>
    <Text style={styles.icon}>{data.icon}</Text>
    <Text style={styles.label}>{data.label}</Text>
    <Text style={styles.value}>{data.value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 24,
    marginBottom: spacing.sm,
    color: colors.primaryDark,
  },
  label: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  value: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
