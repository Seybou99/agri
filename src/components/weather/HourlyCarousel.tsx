/**
 * HourlyCarousel - Carousel horizontal compact de prévisions horaires
 * Style inspiré de la maquette : 4 cartes visibles, design épuré
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, spacing, typography } from '@theme';
import type { HourlyForecast } from '@services/weather/openWeatherService';

interface HourlyCarouselProps {
  forecasts: HourlyForecast[];
}

export const HourlyCarousel: React.FC<HourlyCarouselProps> = ({ forecasts }) => {
  const getWeatherIcon = (icon: string) => {
    if (icon.includes('01d') || icon.includes('01n')) return '☀️';
    if (icon.includes('02')) return '⛅';
    if (icon.includes('03') || icon.includes('04')) return '☁️';
    if (icon.includes('09') || icon.includes('10')) return '🌧️';
    if (icon.includes('11')) return '⛈️';
    if (icon.includes('13')) return '❄️';
    if (icon.includes('50')) return '🌫️';
    return '☁️';
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {forecasts.slice(0, 8).map((forecast, index) => (
        Platform.OS === 'ios' ? (
          <BlurView key={index} intensity={20} tint="light" style={styles.card}>
            <Text style={styles.time}>{forecast.time}</Text>
            <Text style={styles.icon}>{getWeatherIcon(forecast.icon)}</Text>
            <Text style={styles.temp}>{forecast.temp}°</Text>
          </BlurView>
        ) : (
          <View key={index} style={styles.card}>
            <Text style={styles.time}>{forecast.time}</Text>
            <Text style={styles.icon}>{getWeatherIcon(forecast.icon)}</Text>
            <Text style={styles.temp}>{forecast.temp}°</Text>
          </View>
        )
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    marginTop: spacing.md,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: spacing.lg,
    marginRight: 60,
    minWidth: 90,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  time: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  temp: {
    ...typography.h4,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 18,
  },
});
