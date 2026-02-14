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
            <View style={styles.overlay} />
            <Text style={styles.icon}>{getWeatherIcon(forecast.icon)}</Text>
            <Text style={styles.temp}>{forecast.temp}°</Text>
          </BlurView>
        ) : (
          <View key={index} style={styles.card}>
            <View style={styles.overlay} />
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
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 22,
    padding: spacing.lg,
    marginRight: 60, // Espacement augmenté selon maquette (60px au lieu de spacing.md)
    minWidth: 90,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    // Overlay sombre pour améliorer le contraste
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 22,
  },
  icon: {
    fontSize: 40, // Icônes plus grandes selon maquette (36 -> 40)
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  temp: {
    ...typography.h4,
    color: colors.white,
    fontWeight: '700',
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
