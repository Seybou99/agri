import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@theme';

const TABS = ['Overview', 'Analysis', 'Notes', 'Schedule'] as const;

export type ReportTabId = (typeof TABS)[number];

interface ReportTabsProps {
  active: ReportTabId;
  onSelect: (tab: ReportTabId) => void;
}

/**
 * Onglets horizontaux (Overview, Analysis, Notes, Schedule).
 * Actif : fond vert foncé, texte blanc. Inactif : fond blanc, texte gris.
 */
export const ReportTabs: React.FC<ReportTabsProps> = ({ active, onSelect }) => (
  <View style={styles.container}>
    {TABS.map((tab) => {
      const isActive = active === tab;
      return (
        <TouchableOpacity
          key={tab}
          onPress={() => onSelect(tab)}
          style={[styles.tab, isActive && styles.tabActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  tabActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  tabText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.white,
  },
});
