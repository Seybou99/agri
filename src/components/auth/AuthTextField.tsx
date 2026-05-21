import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, spacing, typography } from '@theme';

interface AuthTextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export const AuthTextField: React.FC<AuthTextFieldProps> = ({
  label,
  error,
  style,
  ...rest
}) => (
  <View style={styles.wrap}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error ? styles.inputError : null, style]}
      placeholderTextColor={colors.text.disabled}
      {...rest}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[200],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
  },
  inputError: { borderColor: colors.error },
  error: {
    fontSize: typography.caption.fontSize,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
