// Écran de configuration du diagnostic : cultures (multi), surface
// Phase 2 – Plan SeneGundo

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@theme';
import { Button } from '@components/common';
import { AVAILABLE_CROPS, PLANTS_REQUIREMENTS } from '@constants/plants';

export type DiagnosticConfigParams = {
  lat: number;
  lng: number;
  locationName?: string;
};

export const DiagnosticConfigScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as DiagnosticConfigParams | undefined;
  const { lat, lng, locationName } = params ?? { lat: 12.6392, lng: -8.0029 };

  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [surface, setSurface] = useState('');

  const toggleCrop = useCallback((key: string) => {
    setSelectedCrops((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  }, []);

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  const launchDiagnostic = useCallback(() => {
    if (selectedCrops.length === 0) {
      Alert.alert('Culture(s) requise(s)', 'Sélectionnez au moins une culture.');
      return;
    }
    const surfaceNum = parseFloat(surface.replace(',', '.').trim());
    if (Number.isNaN(surfaceNum) || surfaceNum <= 0) {
      Alert.alert('Surface invalide', 'Indiquez une surface en hectares (ex. 2,5).');
      return;
    }
    const parcelId = `diag-${Date.now()}`;
    const rootNav = navigation.getParent?.() ?? navigation;
    (rootNav as any).navigate('FieldReport', {
      parcelId,
      crops: selectedCrops,
      surface: surfaceNum,
      lat,
      lng,
      locationName,
    });
  }, [selectedCrops, surface, lat, lng, locationName, navigation]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.backLabel}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Configuration du diagnostic</Text>
        <Text style={styles.subtitle}>
          Choisissez une ou plusieurs cultures et la surface de votre parcelle.
        </Text>

        {locationName ? (
          <View style={styles.locationNote}>
            <Text style={styles.locationNoteText}>📍 {locationName}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.label}>Culture(s)</Text>
          <Text style={styles.hint}>Plusieurs choix possibles</Text>
          <View style={styles.cropList}>
            {AVAILABLE_CROPS.map((key) => {
              const name = PLANTS_REQUIREMENTS[key]?.name ?? key;
              const isSelected = selectedCrops.includes(key);
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.cropItem, isSelected && styles.cropItemSelected]}
                  onPress={() => toggleCrop(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cropLabel, isSelected && styles.cropLabelSelected]}>
                    {isSelected ? '✓ ' : ''}{name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Surface (hectares)</Text>
          <TextInput
            style={styles.input}
            value={surface}
            onChangeText={setSurface}
            placeholder="Ex. 2,5"
            placeholderTextColor={colors.text.disabled}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.cta}>
          <Button
            title="Lancer le diagnostic"
            onPress={launchDiagnostic}
            fullWidth
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  backLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.primary,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  locationNote: {
    marginBottom: spacing.lg,
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  locationNoteText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  cropList: {
    gap: spacing.sm,
  },
  cropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  cropItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  cropLabel: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
  },
  cropLabelSelected: {
    fontWeight: '600',
    color: colors.primaryDark,
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
  cta: {
    marginTop: spacing.lg,
  },
});
