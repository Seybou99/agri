// Écran de sélection du terrain : lieu, GPS (lat/lng), X/Y (plan), ma position
// Phase 2 – Plan SeneGundo

import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@theme';
import { Button } from '@components/common';
import { geocodePlace } from '@services/geocoding';
import { xyToLatLng, type UtmZone } from '@utils/utmToLatLng';

const MALI_CENTER = { latitude: 12.6392, longitude: -8.0029, latitudeDelta: 8, longitudeDelta: 8 };

type TerrainMode = 'lieu' | 'gps' | 'xy' | 'position';

export const DiagnosticMapScreen: React.FC = () => {
  const mapRef = useRef<MapView | null>(null);
  const [mode, setMode] = useState<TerrainMode>('lieu');
  const [marker, setMarker] = useState<{ lat: number; lng: number; name?: string } | null>(null);

  const [placeQuery, setPlaceQuery] = useState('');
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [xInput, setXInput] = useState('');
  const [yInput, setYInput] = useState('');
  const [utmZone, setUtmZone] = useState<UtmZone>(29);

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingGeocode, setLoadingGeocode] = useState(false);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const getRootStack = useCallback(() => {
    let nav: any = navigation;
    while (nav?.getParent?.()) nav = nav.getParent();
    return nav;
  }, [navigation]);

  const setMarkerAndCenter = useCallback((lat: number, lng: number, name?: string) => {
    setMarker({ lat, lng, name });
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  }, []);

  const goToConfig = useCallback(() => {
    if (!marker) {
      Alert.alert('Emplacement requis', 'Choisissez un mode et renseignez l’emplacement (lieu, GPS, X/Y ou position).');
      return;
    }
    getRootStack()?.navigate('DiagnosticConfig', {
      lat: marker.lat,
      lng: marker.lng,
      locationName: marker.name,
    });
  }, [marker, getRootStack]);

  const onMapPress = useCallback((e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerAndCenter(latitude, longitude);
  }, [setMarkerAndCenter]);

  const searchPlace = useCallback(async () => {
    const q = placeQuery.trim();
    if (!q) {
      Alert.alert('Recherche', 'Entrez un nom de lieu (ex. Bamako, Sikasso).');
      return;
    }
    setLoadingGeocode(true);
    try {
      const result = await geocodePlace(q);
      if (result) {
        setMarkerAndCenter(result.lat, result.lng, result.displayName);
      } else {
        Alert.alert('Aucun résultat', `Aucun lieu trouvé pour « ${q} ». Essayez un autre nom.`);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de rechercher le lieu.');
    } finally {
      setLoadingGeocode(false);
    }
  }, [placeQuery, setMarkerAndCenter]);

  const applyGps = useCallback(() => {
    const lat = parseFloat(latInput.replace(',', '.').trim());
    const lng = parseFloat(lngInput.replace(',', '.').trim());
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      Alert.alert('Coordonnées invalides', 'Indiquez latitude et longitude (ex. 12.64 et -8.00).');
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert('Hors limites', 'Latitude entre -90 et 90, longitude entre -180 et 180.');
      return;
    }
    setMarkerAndCenter(lat, lng);
  }, [latInput, lngInput, setMarkerAndCenter]);

  const applyXy = useCallback(() => {
    const x = parseFloat(xInput.replace(/\s/g, '').replace(',', '.').trim());
    const y = parseFloat(yInput.replace(/\s/g, '').replace(',', '.').trim());
    if (Number.isNaN(x) || Number.isNaN(y)) {
      Alert.alert('X/Y invalides', 'Indiquez X et Y (ex. 683849 et 1402776, comme sur le plan concession).');
      return;
    }
    const result = xyToLatLng(x, y, utmZone);
    if (result) {
      setMarkerAndCenter(result.lat, result.lng);
    } else {
      Alert.alert('Conversion impossible', 'Vérifiez X, Y et la zone UTM (29 ou 30).');
    }
  }, [xInput, yInput, utmZone, setMarkerAndCenter]);

  const goToMyPosition = useCallback(async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorisez l’accès à la position pour utiliser « Ma position ».');
        setLoadingLocation(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;
      setMarkerAndCenter(latitude, longitude);
    } catch {
      Alert.alert('Erreur', 'Impossible d’obtenir votre position.');
    } finally {
      setLoadingLocation(false);
    }
  }, [setMarkerAndCenter]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={MALI_CENTER}
        onPress={onMapPress}
        mapType={Platform.OS === 'android' ? 'terrain' : 'standard'}
      >
        {marker && (
          <Marker
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            title={marker.name ?? 'Parcelle'}
            description="Emplacement sélectionné"
          />
        )}
      </MapView>

      <KeyboardAvoidingView
        style={[styles.overlay, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.sm }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {navigation.canGoBack?.() ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.backLabel}>← Retour</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.title}>Sélection du terrain</Text>
          <Text style={styles.subtitle}>Lieu, GPS, X/Y (plan) ou ma position</Text>

          <View style={styles.tabs}>
            {(['lieu', 'gps', 'xy', 'position'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.tab, mode === m && styles.tabActive]}
                onPress={() => setMode(m)}
              >
                <Text style={[styles.tabLabel, mode === m && styles.tabLabelActive]} numberOfLines={1}>
                  {m === 'lieu' ? '🔍 Lieu' : m === 'gps' ? '📌 GPS' : m === 'xy' ? '📐 X/Y' : '📍 Position'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode === 'lieu' && (
            <View style={styles.section}>
              <TextInput
                style={styles.input}
                value={placeQuery}
                onChangeText={setPlaceQuery}
                placeholder="Ex. Bamako, Sikasso, Ségou..."
                placeholderTextColor={colors.text.disabled}
                onSubmitEditing={searchPlace}
              />
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={searchPlace}
                disabled={loadingGeocode || !placeQuery.trim()}
              >
                {loadingGeocode ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.actionBtnLabel}>Rechercher</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {mode === 'gps' && (
            <View style={styles.section}>
              <TextInput
                style={styles.input}
                value={latInput}
                onChangeText={setLatInput}
                placeholder="Latitude (ex. 12.64)"
                placeholderTextColor={colors.text.disabled}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.input, { marginTop: spacing.sm }]}
                value={lngInput}
                onChangeText={setLngInput}
                placeholder="Longitude (ex. -8.00)"
                placeholderTextColor={colors.text.disabled}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                style={[styles.actionBtn, { marginTop: spacing.sm }]}
                onPress={applyGps}
                disabled={!latInput.trim() || !lngInput.trim()}
              >
                <Text style={styles.actionBtnLabel}>Valider lat/long</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'xy' && (
            <View style={styles.section}>
              <Text style={styles.hint}>Plan concession : X (Est), Y (Nord). Zone UTM Mali 29 ou 30.</Text>
              <View style={styles.zoneRow}>
                <Text style={styles.zoneLabel}>Zone UTM</Text>
                <View style={styles.zoneBtns}>
                  {([29, 30] as const).map((z) => (
                    <TouchableOpacity
                      key={z}
                      style={[styles.zoneBtn, utmZone === z && styles.zoneBtnActive]}
                      onPress={() => setUtmZone(z)}
                    >
                      <Text style={[styles.zoneBtnLabel, utmZone === z && styles.zoneBtnLabelActive]}>{z}N</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TextInput
                style={styles.input}
                value={xInput}
                onChangeText={setXInput}
                placeholder="X (ex. 683849)"
                placeholderTextColor={colors.text.disabled}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.input, { marginTop: spacing.sm }]}
                value={yInput}
                onChangeText={setYInput}
                placeholder="Y (ex. 1402776)"
                placeholderTextColor={colors.text.disabled}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                style={[styles.actionBtn, { marginTop: spacing.sm }]}
                onPress={applyXy}
                disabled={!xInput.trim() || !yInput.trim()}
              >
                <Text style={styles.actionBtnLabel}>Valider X/Y</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'position' && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={goToMyPosition}
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.actionBtnLabel}>📍 Ma position</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <Button title="Continuer" onPress={goToConfig} fullWidth disabled={!marker} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { ...StyleSheet.absoluteFillObject },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
  },
  scroll: { maxHeight: 340 },
  scrollContent: { paddingBottom: spacing.lg },
  backBtn: { alignSelf: 'flex-start', marginBottom: spacing.sm },
  backLabel: { fontSize: typography.body.fontSize, fontWeight: '600', color: colors.primary },
  title: { fontSize: typography.h3.fontSize, fontWeight: typography.h3.fontWeight, color: colors.text.primary, marginBottom: spacing.xs },
  subtitle: { fontSize: typography.bodySmall.fontSize, color: colors.text.secondary, marginBottom: spacing.md },
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.gray[200],
    alignItems: 'center',
  },
  tabActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight + '25' },
  tabLabel: { fontSize: typography.caption.fontSize, fontWeight: '600', color: colors.text.secondary },
  tabLabelActive: { color: colors.primaryDark },
  section: { marginBottom: spacing.md },
  hint: { fontSize: typography.caption.fontSize, color: colors.text.secondary, marginBottom: spacing.sm },
  zoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  zoneLabel: { fontSize: typography.bodySmall.fontSize, color: colors.text.secondary, minWidth: 72 },
  zoneBtns: { flexDirection: 'row', gap: spacing.sm },
  zoneBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  zoneBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight + '25' },
  zoneBtnLabel: { fontSize: typography.bodySmall.fontSize, fontWeight: '600', color: colors.text.secondary },
  zoneBtnLabelActive: { color: colors.primaryDark },
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
  actionBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  actionBtnLabel: { fontSize: typography.body.fontSize, fontWeight: '600', color: colors.primary },
});
