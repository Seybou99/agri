/**
 * HourlyForecastCard - Prévisions horaires avec scroll horizontal
 * Style glassmorphism moderne
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '@theme';
import type { HourlyForecast } from '@services/weather/openWeatherService';

interface HourlyForecastCardProps {
  forecasts: HourlyForecast[];
  summary?: string;
}

export const HourlyForecastCard: React.FC<HourlyForecastCardProps> = ({
  forecasts,
  summary = 'Temps nuageux pour le reste de la journée. Rafales de vent allant jusqu\'à 12 km/h.',
}) => {
  const getWeatherIcon = (icon: string) => {
    if (icon.includes('01d') || icon.includes('01n')) return '☀️';
    if (icon.includes('02')) return '⛅';
    if (icon.includes('03') || icon.includes('04')) return '☁️';
    if (icon.includes('09') || icon.includes('10')) return '🌧️';
    if (icon.includes('11')) return '⛈️';
    if (icon.includes('13')) return '❄️';
    if (icon.includes('50')) return '🌫️';
    return '☀️';
  };

  return (
    <View style={styles.card}>
      {/* Résumé textuel */}
      <Text style={styles.summary}>{summary}</Text>

      {/* Prévisions horaires scrollables */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hourlyContainer}
      >
        {forecasts.map((forecast, index) => (
          <View key={index} style={styles.hourlyItem}>
            <Text style={styles.hourlyTime}>{forecast.time}</Text>
            <Text style={styles.hourlyIcon}>{getWeatherIcon(forecast.icon)}</Text>
            <Text style={styles.hourlyTemp}>{forecast.temp}°</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  summary: {
    ...typography.bodySmall,
    color: colors.white,
    marginBottom: spacing.md,
    lineHeight: 20,
    opacity: 0.9,
  },
  hourlyContainer: {
    paddingRight: spacing.md,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    minWidth: 60,
  },
  hourlyTime: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.8,
    marginBottom: spacing.xs,
    fontSize: 11,
  },
  hourlyIcon: {
    fontSize: 24,
    marginBottom: spacing.xs / 2,
  },
  hourlyTemp: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
