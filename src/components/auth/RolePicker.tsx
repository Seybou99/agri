import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { UserRole } from '@models/User';
import { SIGNUP_ROLES, USER_ROLE_LABELS } from '@constants/userRoles';
import { colors, spacing, typography } from '@theme';

interface RolePickerProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export const RolePicker: React.FC<RolePickerProps> = ({ value, onChange }) => (
  <View style={styles.wrap}>
    <Text style={styles.label}>Je suis</Text>
    <View style={styles.row}>
      {SIGNUP_ROLES.map((role) => {
        const active = value === role;
        return (
          <TouchableOpacity
            key={role}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(role)}
            activeOpacity={0.85}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {USER_ROLE_LABELS[role]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
    <Text style={styles.hint}>Le rôle administrateur est attribué par l'équipe SeneGundo.</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '35',
  },
  chipText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  chipTextActive: { color: colors.primaryDark },
  hint: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    lineHeight: 16,
  },
});
