import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors, spacing, typography } from '@theme';

interface GoogleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress,
  loading,
  disabled,
}) => (
  <TouchableOpacity
    style={[styles.btn, (disabled || loading) && styles.btnDisabled]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.85}
  >
    {loading ? (
      <ActivityIndicator color={colors.text.primary} />
    ) : (
      <View style={styles.row}>
        <Text style={styles.g}>G</Text>
        <Text style={styles.label}>Continuer avec Google</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  btnDisabled: { opacity: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  g: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
