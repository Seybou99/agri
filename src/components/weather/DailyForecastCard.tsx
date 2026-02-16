/**
 * DailyForecastCard - Prévisions quotidiennes avec barres de température
 * Style glassmorphism moderne
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, spacing, typography } from '@theme';
import type { DailyForecast } from '@services/weather/openWeatherService';

interface DailyForecastCardProps {
  forecasts: DailyForecast[];
}

export const DailyForecastCard: React.FC<DailyForecastCardProps> = ({ forecasts }) => {
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

  // Calculer les températures min/max globales pour la barre
  const allTemps = forecasts.flatMap(f => [f.tempMin, f.tempMax]);
  const globalMin = Math.min(...allTemps);
  const globalMax = Math.max(...allTemps);
  const tempRange = Math.max(globalMax - globalMin, 1); // Éviter division par zéro

  const CardWrapper = Platform.OS === 'ios' ? BlurView : View;
  const cardProps = Platform.OS === 'ios' 
    ? { intensity: 20, tint: 'light' as const }
    : {};

  return (
    <CardWrapper {...cardProps} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerText}>PRÉVISIONS SUR 10 JOURS</Text>
        <Text style={styles.calendarIcon}>📅</Text>
      </View>

              {forecasts.slice(0, 10).map((forecast, index) => {
        // Calculer la position relative de la barre de température
        const barStartPercent = tempRange > 0 ? ((forecast.tempMin - globalMin) / tempRange) * 100 : 0;
        const barWidthPercent = tempRange > 0 ? ((forecast.tempMax - forecast.tempMin) / tempRange) * 100 : 10;
        const currentPosPercent = tempRange > 0 ? ((forecast.tempMin + (forecast.tempMax - forecast.tempMin) / 2) - globalMin) / tempRange * 100 : 50;

        return (
          <View key={index} style={styles.dailyItem}>
            <View style={styles.dayInfo}>
              <Text style={styles.dayName}>{forecast.day}</Text>
              <Text style={styles.weatherIcon}>{getWeatherIcon(forecast.icon)}</Text>
              {forecast.precipitation > 0 && (
                <Text style={styles.precipitation}>{forecast.precipitation}%</Text>
              )}
            </View>

            <View style={styles.temperatureBarContainer}>
              <View style={styles.temperatureBar}>
                <View
                  style={[
                    styles.temperatureBarFill,
                    {
                      left: `${barStartPercent}%`,
                      width: `${Math.max(barWidthPercent, 5)}%`,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.temperatureDot,
                    {
                      left: `${currentPosPercent}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.temps}>
              <Text style={styles.tempMin}>{forecast.tempMin}°</Text>
              <Text style={styles.tempMax}>{forecast.tempMax}°</Text>
            </View>
          </View>
        );
      })}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    ...Platform.select({
      android: { backgroundColor: colors.white },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerText: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 1,
  },
  calendarIcon: {
    fontSize: 18,
  },
  dailyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
  },
  dayInfo: {
    width: 90,
    alignItems: 'flex-start',
  },
  dayName: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
    fontSize: 14,
  },
  weatherIcon: {
    fontSize: 22,
    marginBottom: spacing.xs / 2,
  },
  precipitation: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  temperatureBarContainer: {
    flex: 1,
    marginHorizontal: spacing.lg,
  },
  temperatureBar: {
    height: 5,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    position: 'relative',
  },
  temperatureBarFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: 3,
  },
  temperatureDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
    top: -1,
    marginLeft: -3.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  temps: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 75,
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  tempMin: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  tempMax: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
