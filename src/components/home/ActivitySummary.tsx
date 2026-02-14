/**
 * ActivitySummary - Vue d'ensemble avec diagnostic et météo
 * Météo en plein écran avec effet glassmorphism
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, spacing, typography } from '@theme';
import { useAuth } from '@hooks/useAuth';
import { WeatherCard } from './WeatherCard';

interface ActivitySummaryProps {
  onDiagnosticPress?: () => void;
  onWeatherPress?: (location: { lat: number; lng: number; name: string }) => void;
  defaultLocation?: { lat: number; lng: number; name: string };
  showWeatherFullscreen?: boolean; // Nouvelle prop pour afficher météo en plein écran
}

export const ActivitySummary: React.FC<ActivitySummaryProps> = ({
  onDiagnosticPress,
  onWeatherPress,
  defaultLocation,
  showWeatherFullscreen = false,
}) => {
  const { userProfile } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string }>(
    defaultLocation || { lat: 48.8566, lng: 2.3522, name: 'Paris' }
  );

  useEffect(() => {
    const getLocation = async () => {
      if (defaultLocation) {
        setLocation(defaultLocation);
        return;
      }

      if (userProfile?.location) {
        setLocation({
          lat: userProfile.location.lat,
          lng: userProfile.location.lng,
          name: 'Votre zone',
        });
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation({
            lat: currentLocation.coords.latitude,
            lng: currentLocation.coords.longitude,
            name: 'Position actuelle',
          });
        }
      } catch (error) {
        console.error('Erreur localisation:', error);
      }
    };

    getLocation();
  }, [userProfile, defaultLocation]);

  // Si mode plein écran météo, afficher uniquement la météo
  if (showWeatherFullscreen) {
    return <WeatherCard location={location} onPress={onWeatherPress} />;
  }

  // Mock data pour le dernier diagnostic
  const lastDiagnostic = {
    crop: 'Tomate',
    location: 'Bagounkeda',
    aptitude: 85,
  };

  return (
    <View style={styles.container}>
      {/* Carte Diagnostic - Format compact */}
      <TouchableOpacity
        style={styles.diagnosticCard}
        onPress={onDiagnosticPress}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Résumé de mon activité</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          {lastDiagnostic.crop} à {lastDiagnostic.location}
        </Text>
        <View style={styles.aptitudeContainer}>
          <Text style={styles.aptitudeValue}>{lastDiagnostic.aptitude}%</Text>
          <Text style={styles.aptitudeLabel}>Hectares d'aptitude</Text>
        </View>
        <View style={styles.chartContainer}>
          <Svg width={60} height={30} viewBox="0 0 60 30">
            <Path
              d="M 5 25 L 15 20 L 25 15 L 35 10 L 45 8 L 55 5"
              stroke={colors.primaryDark}
              strokeWidth="2"
              fill="none"
            />
            <Circle cx="55" cy="5" r="3" fill={colors.primaryDark} />
          </Svg>
        </View>
      </TouchableOpacity>

      {/* Bouton pour voir la météo complète */}
      <TouchableOpacity
        style={styles.weatherButton}
        onPress={() => onWeatherPress?.(location)}
        activeOpacity={0.8}
      >
        <Text style={styles.weatherButtonText}>Voir la météo complète</Text>
        <Text style={styles.weatherButtonIcon}>🌤️</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  diagnosticCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  cardHeader: {
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.secondary,
    fontSize: 11,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontSize: 13,
  },
  aptitudeContainer: {
    marginBottom: spacing.sm,
  },
  aptitudeValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 2,
    lineHeight: 36,
  },
  aptitudeLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 10,
  },
  chartContainer: {
    alignItems: 'flex-end',
    marginTop: spacing.xs,
  },
  weatherButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  weatherButtonIcon: {
    fontSize: 24,
  },
});