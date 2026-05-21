/**
 * Diagnostic maladie de plante — photo + Pl@ntNet (via proxy Vercel)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { Button } from '@components/common';
import { identifyPlantDiseases, getProviderLabel } from '@services/plantnetDiseasesApi';
import type { PlantDiseaseProvider } from '@models/PlantDisease';
import type { PlantDiseaseMatch } from '@models/PlantDisease';
import {
  capturePlantPhoto,
  pickPlantPhotoFromGallery,
  MAX_PLANT_DISEASE_IMAGES,
  type PlantPhotoCapture,
} from '@utils/plantDiseaseImage';
import { colors, spacing, typography } from '@theme';

interface CapturedPhoto extends PlantPhotoCapture {
  id: string;
}

export const PlantDiseaseScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlantDiseaseMatch[] | null>(null);
  const [quotaLeft, setQuotaLeft] = useState<number | undefined>();
  const [provider, setProvider] = useState<PlantDiseaseProvider | undefined>();
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const addPhoto = (capture: PlantPhotoCapture) => {
    setPhotos((prev) => {
      if (prev.length >= MAX_PLANT_DISEASE_IMAGES) return prev;
      return [...prev, { ...capture, id: `${Date.now()}_${prev.length}` }];
    });
    setResults(null);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setResults(null);
    setProvider(undefined);
  };

  const handleCamera = async () => {
    try {
      const shot = await capturePlantPhoto();
      if (shot) addPhoto(shot);
    } catch (e) {
      Alert.alert('Caméra', e instanceof Error ? e.message : 'Erreur');
    }
  };

  const handleGallery = async () => {
    try {
      const shot = await pickPlantPhotoFromGallery();
      if (shot) addPhoto(shot);
    } catch (e) {
      Alert.alert('Galerie', e instanceof Error ? e.message : 'Erreur');
    }
  };

  const handleAnalyze = async () => {
    if (photos.length === 0) {
      Alert.alert('Photo requise', 'Prenez au moins une photo claire de la plante malade.');
      return;
    }
    setLoading(true);
    setResults(null);
    setProvider(undefined);
    try {
      const data = await identifyPlantDiseases(photos.map((p) => p.payload));
      setResults(data.results);
      setProvider(data.provider);
      setFallbackUsed(Boolean(data.fallbackUsed));
      setQuotaLeft(
        data.provider === 'kindwise'
          ? data.remainingCredits
          : data.remainingIdentificationRequests
      );
      if (data.results.length === 0) {
        Alert.alert(
          'Aucun résultat',
          `${getProviderLabel(data.provider)} n’a pas reconnu de maladie. Essayez une photo plus nette.`
        );
      }
    } catch (e) {
      Alert.alert('Analyse', e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const formatScore = (score: number) => `${Math.round(score * 100)} %`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke={colors.text.primary}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnostic maladie</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Photographiez la plante</Text>
          <Text style={styles.heroText}>
            Identification par Pl@ntNet (INRAE), puis Crop.health Kindwise si le quota Pl@ntNet
            est atteint. Jusqu’à {MAX_PLANT_DISEASE_IMAGES} photos de la même plante.
          </Text>
        </View>

        <View style={styles.photoRow}>
          {photos.map((p) => (
            <View key={p.id} style={styles.thumbWrap}>
              <Image source={{ uri: p.previewUri }} style={styles.thumb} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(p.id)}>
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < MAX_PLANT_DISEASE_IMAGES && (
            <View style={styles.addSlot}>
              <Text style={styles.addIcon}>🌿</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleCamera}>
            <Text style={styles.secondaryBtnText}>📷 Caméra</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleGallery}>
            <Text style={styles.secondaryBtnText}>🖼️ Galerie</Text>
          </TouchableOpacity>
        </View>

        <Button
          title={loading ? 'Analyse en cours…' : 'Analyser la maladie'}
          onPress={handleAnalyze}
          loading={loading}
          fullWidth
        />

        {provider && (
          <View style={[styles.providerBadge, fallbackUsed && styles.providerBadgeFallback]}>
            <Text style={styles.providerBadgeText}>
              {fallbackUsed
                ? `↪ Bascule automatique · ${getProviderLabel(provider)}`
                : `Via ${getProviderLabel(provider)}`}
            </Text>
          </View>
        )}

        {quotaLeft != null && (
          <Text style={styles.quota}>
            {provider === 'kindwise'
              ? `Crédits Kindwise restants : ${quotaLeft}`
              : `Identifications Pl@ntNet restantes aujourd’hui : ${quotaLeft}`}
          </Text>
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Analyse par intelligence artificielle…</Text>
          </View>
        )}

        {results && results.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>Résultats probables</Text>
            {results.map((item, index) => (
              <View key={`${item.name}-${index}`} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultRank}>#{index + 1}</Text>
                  <Text style={styles.resultScore}>{formatScore(item.score)}</Text>
                </View>
                <Text style={styles.resultName}>
                  {item.description || item.label || item.name}
                </Text>
                {item.name && item.description ? (
                  <Text style={styles.resultCode}>Code EPPO : {item.name}</Text>
                ) : null}
                {item.images?.[0]?.url?.m ? (
                  <Image
                    source={{ uri: item.images[0].url!.m }}
                    style={styles.refImage}
                    resizeMode="cover"
                  />
                ) : null}
              </View>
            ))}
            <Text style={styles.disclaimer}>
              Résultat indicatif — confirmez avec un agronome. Source :{' '}
              {getProviderLabel(provider)}.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.linkParcel}
          onPress={() => navigation.navigate('DiagnosticMap')}
        >
          <Text style={styles.linkParcelText}>Diagnostic complet de parcelle (sol & météo) →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  back: { padding: spacing.xs, marginRight: spacing.sm },
  headerTitle: { ...typography.h4, flex: 1 },
  spacer: { width: 40 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: {
    backgroundColor: colors.primaryLight + '40',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  heroTitle: { ...typography.h4, color: colors.primaryDark, marginBottom: spacing.xs },
  heroText: { ...typography.bodySmall, color: colors.text.secondary, lineHeight: 20 },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  thumbWrap: { position: 'relative' },
  thumb: { width: 96, height: 96, borderRadius: 12 },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  addSlot: {
    width: 96,
    height: 96,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
  },
  addIcon: { fontSize: 32 },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  secondaryBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
  },
  secondaryBtnText: { fontWeight: '600', color: colors.text.primary },
  providerBadge: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '60',
  },
  providerBadgeFallback: {
    backgroundColor: '#FFF3E0',
  },
  providerBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  quota: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  loadingBox: { alignItems: 'center', padding: spacing.xl },
  loadingText: { marginTop: spacing.md, color: colors.text.secondary },
  results: { marginTop: spacing.xl },
  resultsTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.md },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  resultRank: { fontWeight: '700', color: colors.primary },
  resultScore: { fontWeight: '700', color: colors.primaryDark },
  resultName: { ...typography.body, fontWeight: '600', color: colors.text.primary },
  resultCode: { ...typography.caption, color: colors.text.secondary, marginTop: 4 },
  refImage: { width: '100%', height: 140, borderRadius: 8, marginTop: spacing.sm },
  disclaimer: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.md,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  linkParcel: { marginTop: spacing.lg, alignItems: 'center' },
  linkParcelText: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
