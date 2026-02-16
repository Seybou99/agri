import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { colors, spacing, typography } from '@theme';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import {
  ParcelCard,
  ReportTabs,
  KPICard,
  YieldCard,
  GrowthChart,
  NotesSection,
} from '@components/fieldReport';
import { AnalysisSection } from '@components/fieldReport/AnalysisSection';
import { CalendarGuideSection } from '@components/fieldReport/CalendarGuideSection';
import type { ReportTabId } from '@components/fieldReport';
import type { GrowthPeriod } from '@components/fieldReport';
import type { KPICardData } from '@components/fieldReport';
import type { GrowthChartData } from '@components/fieldReport';
import { PLANTS_REQUIREMENTS, getMoisRecolte } from '@constants/plants';
import { useDiagnosticReport } from '@hooks/useDiagnosticReport';
import { useRecommendationsFromApi } from '../hooks/useRecommendationsFromApi';
import { useProfitabilityFromApi } from '../hooks/useProfitabilityFromApi';
import { useCalendarGuideData } from '../hooks/useCalendarGuideData';
import { useAgroData } from '../hooks/useAgroData';
import { API_URL } from 'react-native-dotenv';

const MOCK_PARCEL_DEFAULT = {
  name: 'Parcelle oignon',
  id: 'ML-BGD-2026-089',
  culture: 'Oignon',
  stage: 'Bulbaison',
  surfaceHa: 5.2,
};

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jui', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

type FieldReportParams = {
  parcelId?: string;
  crops?: string[];
  surface?: number;
  lat?: number;
  lng?: number;
  locationName?: string;
};

function buildKpis(
  soil: { ph: number; organicCarbon: number; nitrogen: number; phosphorus: number; potassium: number } | null,
  climate: { averageTemperature: number; annualRainfall: number } | null,
  agroData?: { humidity?: number; temp?: number } | null
): KPICardData[] {
  const ph = soil?.ph ?? 6.5;
  const temp = climate?.averageTemperature ?? 28;
  const rainRaw = climate?.annualRainfall ?? 800;
  const rain = rainRaw > 0 ? rainRaw : 800;
  let humidityLabel = 'Modérée';
  if (rain < 500) humidityLabel = 'Faible';
  else if (rain > 1000) humidityLabel = 'Élevée';
  const moistureValue =
    agroData?.humidity != null
      ? `${humidityLabel} • ${agroData.humidity} % (Agro)`
      : humidityLabel;
  const tempValue =
    agroData?.temp != null
      ? `${temp} °C • ${agroData.temp} °C (Agro)`
      : `${temp} °C`;
  const n = soil?.nitrogen ?? 0.5;
  const oc = soil?.organicCarbon ?? 1;
  let nutrientsLabel = 'Moyen';
  if (oc < 0.5 || n < 0.3) nutrientsLabel = 'Faible';
  else if (oc > 1.5 && n > 0.8) nutrientsLabel = 'Élevé';

  return [
    { id: 'moisture', label: 'Humidité', value: moistureValue, icon: '💧' },
    { id: 'temp', label: 'Température', value: tempValue, icon: '🌡️' },
    { id: 'ph', label: 'pH', value: ph.toFixed(1).replace('.', ','), icon: 'pH' },
    { id: 'nutrients', label: 'Nutriments', value: nutrientsLabel, icon: '🍃' },
  ];
}

function buildYieldFromReport(
  parcel: { name: string; id: string; culture: string },
  crops: string[],
  matchingByCrop: Record<string, { score: number }>
): { parcelName: string; parcelId: string; expectedHarvest: string; yieldKgHa: string } {
  const first = crops[0];
  const plant = first ? PLANTS_REQUIREMENTS[first] : null;
  const match = first ? matchingByCrop[first] : null;
  const y = plant?.yieldRange ?? { min: 20, max: 35 };
  const factor = match ? Math.max(0.5, Math.min(1, match.score / 10)) : 1;
  const avg = ((y.min + y.max) / 2) * factor * 1000;
  const gs = plant?.growingSeason;
  const recolteMois =
    gs?.cycleLengthMonths != null && gs.start
      ? getMoisRecolte(gs.start, gs.cycleLengthMonths)
      : gs?.end ?? null;
  const harvest = recolteMois ? `Récolte ${recolteMois}` : 'Selon semis';

  let yieldStr: string;
  if (crops.length > 1) {
    const parts = crops.slice(0, 2).map((k) => {
      const p = PLANTS_REQUIREMENTS[k];
      const m = matchingByCrop[k];
      const f = m ? Math.max(0.5, Math.min(1, m.score / 10)) : 1;
      const mn = (p?.yieldRange?.min ?? 0) * 1000 * f;
      const mx = (p?.yieldRange?.max ?? 0) * 1000 * f;
      return `${p?.name ?? k}: ~${Math.round((mn + mx) / 2).toLocaleString('fr-FR')} kg/ha`;
    });
    yieldStr = parts.join(' • ');
  } else {
    yieldStr = `~${Math.round(avg).toLocaleString('fr-FR')} kg/ha`;
  }

  return {
    parcelName: parcel.name,
    parcelId: parcel.id,
    expectedHarvest: harvest,
    yieldKgHa: yieldStr,
  };
}

function buildGrowthFromClimate(climate: { monthlyRainfall: number[] } | null, period: GrowthPeriod): GrowthChartData {
  const monthly = climate?.monthlyRainfall ?? new Array(12).fill(67);
  const take = period === 'Y' ? 12 : period === 'M' ? 6 : 4;
  const bars = monthly.slice(-take);
  const max = Math.max(...bars, 1);
  const normalized = bars.map((v) => (v / max) * 100);
  const avg = bars.reduce((s, v) => s + v, 0) / bars.length;
  const recent = bars.slice(-2).reduce((s, v) => s + v, 0) / 2;
  const older = bars.slice(0, -2).length ? bars.slice(0, -2).reduce((s, v) => s + v, 0) / (bars.length - 2) : recent;
  const trend: 'up' | 'down' = recent >= older ? 'up' : 'down';
  const labels = bars.length >= 2 ? [MONTHS[12 - bars.length] ?? '', MONTHS[11]] : [];

  return {
    value: `${Math.round(avg)} mm/mois`,
    trend,
    period,
    bars: normalized,
    labels,
  };
}

export const FieldReportScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute();
  const params = route.params as FieldReportParams | undefined;
  const [activeTab, setActiveTab] = useState<ReportTabId>('Résumé');
  const [growthPeriod, setGrowthPeriod] = useState<GrowthPeriod>('M');
  const [exportingPdf, setExportingPdf] = useState(false);

  const lat = params?.lat;
  const lng = params?.lng;
  const crops = params?.crops ?? [];
  const { soil, climate, matchingByCrop, idealCrops, otherCrops, loading, error, refetch } = useDiagnosticReport(lat, lng, crops);
  const { recommendations: apiRecommendations } = useRecommendationsFromApi({
    pluviometrieMm: climate?.annualRainfall,
    region: params?.locationName,
  });
  const { byCulture: profitabilityByCulture } = useProfitabilityFromApi(crops);
  const calendarGuideData = useCalendarGuideData();
  const agroData = useAgroData(lat, lng);

  const parcel = useMemo(() => {
    if (!params?.parcelId && !crops.length) return MOCK_PARCEL_DEFAULT;
    const names = crops.map((k) => PLANTS_REQUIREMENTS[k]?.name ?? k);
    const culture = names.length ? names.join(', ') : MOCK_PARCEL_DEFAULT.culture;
    return {
      name: params?.locationName ?? 'Ma parcelle',
      id: params?.parcelId ?? 'ML-xxx',
      culture,
      stage: 'Bulbaison',
      surfaceHa: params?.surface ?? MOCK_PARCEL_DEFAULT.surfaceHa,
    };
  }, [params?.parcelId, params?.locationName, params?.surface, crops]);

  const kpis = useMemo(
    () =>
      buildKpis(soil, climate, agroData.weather ? { humidity: agroData.weather.humidity, temp: agroData.weather.temp } : null),
    [soil, climate, agroData.weather]
  );
  const yieldData = useMemo(
    () => buildYieldFromReport(parcel, crops, matchingByCrop),
    [parcel, crops, matchingByCrop]
  );
  const growthData = useMemo(
    () => buildGrowthFromClimate(climate, growthPeriod),
    [climate, growthPeriod]
  );

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  const handleExportPdf = useCallback(async () => {
    const baseUrl = typeof API_URL === 'string' && API_URL && !API_URL.includes('example.com') ? API_URL.trim() : null;
    if (!baseUrl) {
      Alert.alert(
        'Export PDF',
        'Configurez API_URL dans .env (URL de votre API Vercel) pour activer l\'export PDF.',
        [{ text: 'OK' }]
      );
      return;
    }
    setExportingPdf(true);
    try {
      const payload = {
        parcel: { ...parcel, surfaceHa: parcel.surfaceHa },
        kpis,
        yield: yieldData,
        growth: { value: growthData.value, trend: growthData.trend, period: growthData.period },
        recommendations: idealCrops.slice(0, 5).map((c) => (typeof c === 'string' ? c : (c as { name?: string }).name) || String(c)),
      };
      const url = `${baseUrl.replace(/\/$/, '')}/api/v1/report-pdf`;
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'arraybuffer';
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            resolve(xhr.response);
            return;
          }
          if (xhr.status >= 400) {
            try {
              const raw = xhr.response ? new TextDecoder().decode(new Uint8Array(xhr.response)) : '';
              const err = raw ? JSON.parse(raw) : {};
              reject(new Error((err as { message?: string }).message || `Erreur ${xhr.status}`));
            } catch {
              reject(new Error(`Erreur ${xhr.status}`));
            }
            return;
          }
          reject(new Error('Réponse vide'));
        };
        xhr.onerror = () => reject(new Error('Erreur réseau'));
        xhr.send(JSON.stringify(payload));
      });
      const bytes = new Uint8Array(arrayBuffer);
      const base64 =
        typeof Buffer !== 'undefined'
          ? Buffer.from(bytes).toString('base64')
          : (() => {
              let b = '';
              const chunk = 0x8000;
              for (let i = 0; i < bytes.length; i += chunk) {
                b += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as unknown as number[]);
              }
              return (global as any).btoa ? (global as any).btoa(b) : b;
            })();
      const filename = `rapport-senegundo-${parcel.id}-${Date.now()}.pdf`;
      const path = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, { mimeType: 'application/pdf', dialogTitle: 'Exporter le rapport' });
      } else {
        Alert.alert('PDF généré', `Fichier enregistré : ${path}`, [{ text: 'OK' }]);
      }
    } catch (e) {
      Alert.alert('Export PDF', e instanceof Error ? e.message : 'Impossible de générer le PDF.', [{ text: 'OK' }]);
    } finally {
      setExportingPdf(false);
    }
  }, [parcel, kpis, yieldData, growthData, idealCrops]);

  const handleBuySeeds = useCallback(
    (cropKey: string) => {
      // Naviguer vers le Marketplace avec filtre sur les semences de cette culture
      navigation.navigate('MainTabs', {
        screen: 'Marketplace',
        params: { filterCategory: 'Semences', filterCrop: cropKey },
      });
    },
    [navigation]
  );

  const insets = useSafeAreaInsets();
  const hasCoords = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
  const showOverview = activeTab === 'Résumé';
  const showOverviewContent = showOverview && !loading && (!hasCoords || !error);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: spacing.lg + insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <ParcelCard
          data={parcel}
          onBack={handleBack}
          onExpand={() => {}}
        />
        <ReportTabs active={activeTab} onSelect={setActiveTab} />

        {error && hasCoords && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
              <Text style={styles.retryLabel}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && hasCoords && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Chargement du rapport…</Text>
          </View>
        )}

        {showOverviewContent && (
          <>
            <View style={styles.kpiGrid}>
              {kpis.map((kpi) => (
                <KPICard key={kpi.id} data={kpi} />
              ))}
            </View>
            <YieldCard
              data={yieldData}
              onAction={() => {}}
            />
            {agroData.available && (agroData.weather || agroData.loading) && (
              <View style={styles.agroCard}>
                <Text style={styles.agroTitle}>🌾 Surveillance Agro (AgroMonitoring)</Text>
                <Text style={styles.agroSubtitle}>Météo et données parcelle (API OpenWeather Agro)</Text>
                {agroData.loading && !agroData.weather ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.sm }} />
                ) : agroData.weather ? (
                  <View style={styles.agroWeatherRow}>
                    <Text style={styles.agroTemp}>{agroData.weather.temp} °C</Text>
                    <Text style={styles.agroDesc}>{agroData.weather.description}</Text>
                    <View style={styles.agroMeta}>
                      <Text style={styles.agroMetaText}>Humidité {agroData.weather.humidity} %</Text>
                      <Text style={styles.agroMetaText}>Vent {agroData.weather.windSpeed.toFixed(1)} m/s</Text>
                      <Text style={styles.agroMetaText}>Pression {agroData.weather.pressure} hPa</Text>
                    </View>
                  </View>
                ) : null}
                {agroData.error ? (
                  <Text style={styles.agroError}>{agroData.error}</Text>
                ) : null}
              </View>
            )}
            {apiRecommendations.length > 0 && (
              <View style={styles.apiRecoCard}>
                <Text style={styles.apiRecoTitle}>Cultures recommandées (selon sol et climat)</Text>
                <View style={styles.apiRecoList}>
                  {apiRecommendations.slice(0, 5).map((r) => (
                    <View key={r.culture_id} style={styles.apiRecoRow}>
                      <Text style={styles.apiRecoName}>{r.culture}</Text>
                      <Text style={styles.apiRecoScore}>{r.score}/100</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {crops.length > 0 && Object.keys(profitabilityByCulture).length > 0 && (
              <View style={styles.apiRecoCard}>
                <Text style={styles.apiRecoTitle}>Rentabilité indicative (€/ha, Mali)</Text>
                <View style={styles.apiRecoList}>
                  {crops.map((id) => {
                    const p = profitabilityByCulture[id];
                    if (!p) return null;
                    return (
                      <View key={p.culture_id} style={styles.apiRecoRow}>
                        <Text style={styles.apiRecoName}>{p.culture}</Text>
                        <Text style={styles.apiRecoScore}>{p.revenu_ha_min} – {p.revenu_ha_max} €</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
            <GrowthChart
              data={growthData}
              onPeriodChange={setGrowthPeriod}
            />
            <TouchableOpacity
              style={styles.exportPdfButton}
              onPress={handleExportPdf}
              disabled={exportingPdf}
            >
              {exportingPdf ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.exportPdfLabel}>📄 Exporter en PDF</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'Analyse' && !loading && (
          <AnalysisSection
            idealCrops={idealCrops}
            otherCrops={otherCrops}
            onBuySeeds={handleBuySeeds}
          />
        )}
        {activeTab === 'Notes' && !loading && (
          <NotesSection
            idealCrops={idealCrops}
            matchingByCrop={matchingByCrop}
            selectedCrops={crops}
          />
        )}
        {activeTab === 'Calendrier' && !loading && (
          <CalendarGuideSection
            calendars={calendarGuideData.calendars}
            icons={calendarGuideData.icons}
            profitability={calendarGuideData.profitability}
            loading={calendarGuideData.loading}
            fromApi={calendarGuideData.fromApi}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
  },
  errorBox: {
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorText: {
    fontSize: typography.body.fontSize,
    color: colors.error,
    textAlign: 'center',
  },
  retryBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.white,
  },
  agroCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  agroTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  agroSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  agroWeatherRow: { gap: spacing.xs },
  agroTemp: { fontSize: 24, fontWeight: '700', color: colors.primary },
  agroDesc: { fontSize: typography.body.fontSize, color: colors.text.primary, textTransform: 'capitalize' },
  agroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  agroMetaText: { fontSize: typography.caption.fontSize, color: colors.text.secondary },
  agroError: { fontSize: typography.caption.fontSize, color: colors.error, marginTop: spacing.xs },
  apiRecoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  apiRecoTitle: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  apiRecoList: { gap: spacing.xs },
  apiRecoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  apiRecoName: { fontSize: typography.body.fontSize, color: colors.text.primary },
  apiRecoScore: { fontSize: typography.bodySmall.fontSize, color: colors.primary, fontWeight: '600' },
  exportPdfButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  exportPdfLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  placeholder: { minHeight: 80 },
});
