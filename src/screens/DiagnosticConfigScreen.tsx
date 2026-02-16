// Écran de configuration du diagnostic : cultures par catégorie (multi), surface, proposition sol/climat

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
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@theme';
import { Button } from '@components/common';
import { PLANTS_REQUIREMENTS, AVAILABLE_CROPS } from '@constants/plants';
import { triggerHaptic } from '@utils/haptics';
import { fetchSoilData, fetchClimateData, calculateSuitabilityScore } from '@services/agronomy';
import { CALENDAR_CATEGORIES_MALI } from '@/data/calendarGuideMali';

export type DiagnosticConfigParams = {
  lat: number;
  lng: number;
  locationName?: string;
};

const SURFACE_PRESETS = [
  { id: 'petit' as const, label: 'Petit', ha: 0.5, desc: '≈ 0,5 ha' },
  { id: 'moyen' as const, label: 'Moyen', ha: 2, desc: '≈ 2 ha' },
  { id: 'grand' as const, label: 'Grand', ha: 5, desc: '≈ 5 ha' },
];

const MIN_TOUCH_SIZE = 48;
const PLUVIOMETRY_LOW_MM = 600; // seuil en dessous duquel on recommande l'irrigation

export const DiagnosticConfigScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as DiagnosticConfigParams | undefined;
  const { lat, lng, locationName } = params ?? { lat: 12.6392, lng: -8.0029 };

  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [surfacePreset, setSurfacePreset] = useState<'petit' | 'moyen' | 'grand' | 'autre' | null>(null);
  const [surfaceCustom, setSurfaceCustom] = useState('');
  const [withIrrigation, setWithIrrigation] = useState(false);
  const [propositionLoading, setPropositionLoading] = useState(false);

  const toggleCrop = useCallback((key: string) => {
    triggerHaptic();
    setSelectedCrops((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  }, []);

  const selectSurface = useCallback((id: 'petit' | 'moyen' | 'grand' | 'autre') => {
    triggerHaptic();
    setSurfacePreset(id);
  }, []);

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  const getSurfaceHa = useCallback((): number | null => {
    if (surfacePreset === 'autre') {
      const num = parseFloat(surfaceCustom.replace(',', '.').trim());
      return Number.isNaN(num) || num <= 0 ? null : num;
    }
    const p = SURFACE_PRESETS.find((s) => s.id === surfacePreset);
    return p ? p.ha : null;
  }, [surfacePreset, surfaceCustom]);

  const runProposition = useCallback(async () => {
    triggerHaptic();
    setPropositionLoading(true);
    try {
      const [soilData, climateData] = await Promise.all([
        fetchSoilData(lat, lng),
        fetchClimateData(lat, lng),
      ]);
      const climateForScoring = withIrrigation && climateData.annualRainfall < PLUVIOMETRY_LOW_MM
        ? { ...climateData, annualRainfall: Math.max(climateData.annualRainfall, 800) }
        : climateData;

      const scored: { key: string; score: number; name: string }[] = [];
      for (const key of AVAILABLE_CROPS) {
        const plant = PLANTS_REQUIREMENTS[key];
        if (plant) {
          const result = calculateSuitabilityScore(plant, soilData, climateForScoring);
          scored.push({ key, score: result.score, name: plant.name });
        }
      }
      scored.sort((a, b) => b.score - a.score);
      const top = scored.slice(0, 5).map((s) => s.key);
      setSelectedCrops(top);

      const rain = climateData.annualRainfall;
      if (rain < PLUVIOMETRY_LOW_MM && !withIrrigation) {
        Alert.alert(
          'Proposition appliquée',
          `Pluviométrie faible (${Math.round(rain)} mm/an) pour cette zone. Activez « Avec irrigation » pour inclure des cultures plus exigeantes en eau.`,
          [{ text: 'OK' }]
        );
      }
    } catch (e) {
      Alert.alert(
        'Erreur',
        'Impossible de charger sol et climat pour la proposition. Vérifiez votre connexion.'
      );
    } finally {
      setPropositionLoading(false);
    }
  }, [lat, lng, withIrrigation]);

  const launchDiagnostic = useCallback(() => {
    if (selectedCrops.length === 0) {
      Alert.alert('Culture(s) requise(s)', 'Sélectionnez au moins une culture.');
      return;
    }
    const surfaceNum = getSurfaceHa();
    if (surfaceNum == null) {
      Alert.alert('Surface requise', 'Choisissez Petit, Moyen, Grand ou indiquez une surface en hectares.');
      return;
    }
    triggerHaptic();
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
  }, [selectedCrops, getSurfaceHa, lat, lng, locationName, navigation]);

  const showCustomSurface = surfacePreset === 'autre';

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

        {/* Proposition selon sol, pH, pluviométrie */}
        <View style={styles.section}>
          <Text style={styles.label}>Proposition selon le sol et le climat</Text>
          <Text style={styles.hint}>
            Suggère des cultures adaptées au pH, à la pluviométrie et au sol de votre zone.
          </Text>
          <TouchableOpacity
            style={[styles.irrigationRow, withIrrigation && styles.irrigationRowActive]}
            onPress={() => { triggerHaptic(); setWithIrrigation((v) => !v); }}
            activeOpacity={0.7}
          >
            <Text style={styles.irrigationLabel}>J'ajoute un système d'irrigation</Text>
            <View style={[styles.checkbox, withIrrigation && styles.checkboxChecked]}>
              {withIrrigation ? <Text style={styles.checkboxTick}>✓</Text> : null}
            </View>
          </TouchableOpacity>
          <View style={styles.propositionCta}>
            <Button
              title={propositionLoading ? 'Chargement…' : 'Obtenir une proposition'}
              onPress={runProposition}
              fullWidth
              disabled={propositionLoading}
            />
            {propositionLoading && (
              <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
            )}
          </View>
        </View>

        {/* Cultures par catégorie */}
        <View style={styles.section}>
          <Text style={styles.label}>Culture(s)</Text>
          <Text style={styles.hint}>Touchez pour sélectionner (plusieurs choix possibles)</Text>
          {CALENDAR_CATEGORIES_MALI.map((cat) => (
            <View key={cat.id} style={styles.categoryBlock}>
              <Text style={styles.categoryTitle}>{cat.emoji} {cat.label}</Text>
              <View style={styles.cropGrid}>
                {cat.cultures.map((c) => {
                  const isSelected = selectedCrops.includes(c.id);
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.cropItem, isSelected && styles.cropItemSelected]}
                      onPress={() => toggleCrop(c.id)}
                      activeOpacity={0.7}
                      minHeight={MIN_TOUCH_SIZE}
                    >
                      <Text style={styles.cropIcon}>{c.emoji}</Text>
                      <Text style={[styles.cropLabel, isSelected && styles.cropLabelSelected]} numberOfLines={1}>
                        {isSelected ? '✓ ' : ''}{c.nom}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Surface */}
        <View style={styles.section}>
          <Text style={styles.label}>Surface</Text>
          <Text style={styles.hint}>Choisissez la taille de la parcelle</Text>
          <View style={styles.surfaceRow}>
            {SURFACE_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[styles.surfaceBtn, surfacePreset === preset.id && styles.surfaceBtnSelected]}
                onPress={() => selectSurface(preset.id)}
                activeOpacity={0.7}
                minHeight={MIN_TOUCH_SIZE}
              >
                <Text style={[styles.surfaceBtnLabel, surfacePreset === preset.id && styles.surfaceBtnLabelSelected]}>
                  {preset.label}
                </Text>
                <Text style={[styles.surfaceBtnDesc, surfacePreset === preset.id && styles.surfaceBtnLabelSelected]}>
                  {preset.desc}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.surfaceBtn, surfacePreset === 'autre' && styles.surfaceBtnSelected]}
              onPress={() => selectSurface('autre')}
              activeOpacity={0.7}
              minHeight={MIN_TOUCH_SIZE}
            >
              <Text style={[styles.surfaceBtnLabel, surfacePreset === 'autre' && styles.surfaceBtnLabelSelected]}>
                Autre
              </Text>
            </TouchableOpacity>
          </View>
          {showCustomSurface && (
            <TextInput
              style={[styles.input, { marginTop: spacing.sm }]}
              value={surfaceCustom}
              onChangeText={setSurfaceCustom}
              placeholder="Ex. 2,5 ha"
              placeholderTextColor={colors.text.disabled}
              keyboardType="decimal-pad"
            />
          )}
        </View>

        <View style={styles.cta}>
          <Button title="Lancer le diagnostic" onPress={launchDiagnostic} fullWidth />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  backBtn: { alignSelf: 'flex-start', marginBottom: spacing.md },
  backLabel: { fontSize: typography.body.fontSize, fontWeight: '600', color: colors.primary },
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
  locationNote: { marginBottom: spacing.lg, padding: spacing.sm, backgroundColor: colors.gray[50], borderRadius: 8 },
  locationNoteText: { fontSize: typography.bodySmall.fontSize, color: colors.text.secondary },
  section: { marginBottom: spacing.xl },
  label: { fontSize: typography.h4.fontSize, fontWeight: typography.h4.fontWeight, color: colors.text.primary, marginBottom: spacing.xs },
  hint: { fontSize: typography.caption.fontSize, color: colors.text.secondary, marginBottom: spacing.sm },
  irrigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[200],
    marginBottom: spacing.sm,
    minHeight: MIN_TOUCH_SIZE,
  },
  irrigationRowActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight + '15' },
  irrigationLabel: { fontSize: typography.body.fontSize, color: colors.text.primary, flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxTick: { color: colors.white, fontSize: 14, fontWeight: '700' },
  propositionCta: { marginTop: spacing.xs },
  loader: { marginTop: spacing.sm },
  categoryBlock: { marginBottom: spacing.lg },
  categoryTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  cropGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_SIZE,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[200],
    width: '48%',
  },
  cropItemSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight + '20' },
  cropIcon: { fontSize: 22, marginRight: spacing.sm },
  cropLabel: { fontSize: typography.body.fontSize, color: colors.text.primary, flex: 1 },
  cropLabelSelected: { fontWeight: '600', color: colors.primaryDark },
  surfaceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  surfaceBtn: {
    minHeight: MIN_TOUCH_SIZE,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  surfaceBtnSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight + '20' },
  surfaceBtnLabel: { fontSize: typography.body.fontSize, fontWeight: '600', color: colors.text.primary },
  surfaceBtnDesc: { fontSize: typography.caption.fontSize, color: colors.text.secondary, marginTop: 2 },
  surfaceBtnLabelSelected: { color: colors.primaryDark },
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
  cta: { marginTop: spacing.lg },
});
