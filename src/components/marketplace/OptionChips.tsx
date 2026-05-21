import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '@theme';

interface OptionChipsProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  getLabel?: (value: T) => string;
}

export function OptionChips<T extends string>({
  label,
  options,
  value,
  onChange,
  getLabel = (v) => v,
}: OptionChipsProps<T>) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {options.map((opt) => {
            const active = opt === value;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onChange(opt)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {getLabel(opt)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

interface MultiOptionChipsProps<T extends string> {
  label: string;
  options: readonly T[];
  values: T[];
  onToggle: (value: T) => void;
  getLabel?: (value: T) => string;
}

export function MultiOptionChips<T extends string>({
  label,
  options,
  values,
  onToggle,
  getLabel = (v) => v,
}: MultiOptionChipsProps<T>) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.rowWrap}>
        {options.map((opt) => {
          const active = values.includes(opt);
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onToggle(opt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {getLabel(opt)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.sm, paddingRight: spacing.md },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.primary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
