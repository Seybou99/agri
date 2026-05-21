import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import type { AcademyGuide } from '@models/AcademyGuide';
import { colors, spacing, typography } from '@theme';
import { GuideCard } from './GuideCard';

interface GuideListProps {
  guides: AcademyGuide[];
}

export const GuideList: React.FC<GuideListProps> = ({ guides }) => {
  if (guides.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyText}>Aucun guide disponible pour le moment</Text>
        <Text style={styles.emptyHint}>
          Les agriculteurs et administrateurs peuvent publier des manuels avec le bouton +
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={guides}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <GuideCard guide={item} />}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyHint: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
