/**
 * AirQualityCard - Carte affichant la qualité de l'air avec score circulaire
 * Style glassmorphism moderne
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import { colors, spacing, typography } from '@theme';
import type { AirQuality } from '@types/weather';

interface AirQualityCardProps {
  airQuality: AirQuality;
}

export const AirQualityCard: React.FC<AirQualityCardProps> = ({ airQuality }) => {
  const GlassCard = ({ children }: { children: React.ReactNode }) => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView intensity={20} tint="dark" style={styles.card}>
          {children}
        </BlurView>
      );
    }
    
    return (
      <View style={[styles.card, styles.cardAndroid]}>
        {children}
      </View>
    );
  };

  // Couleur du cercle selon le niveau
  const getCircleColor = (): string => {
    switch (airQuality.level) {
      case 'good':
        return '#4CAF50';
      case 'moderate':
        return '#FF9800';
      case 'unhealthy-sensitive':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <GlassCard>
      <View style={styles.header}>
        <Text style={styles.title}>Air Quality</Text>
        <Text style={styles.viewReport}>View Report {'>'}</Text>
      </View>
      
      <View style={styles.content}>
        {/* Cercle de score */}
        <View style={styles.circleContainer}>
          <Svg width={80} height={80} viewBox="0 0 80 80">
            <Circle
              cx="40"
              cy="40"
              r="35"
              stroke={getCircleColor()}
              strokeWidth="4"
              fill="none"
            />
          </Svg>
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{airQuality.score}</Text>
          </View>
        </View>
        
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.pollutant}>{airQuality.mainPollutant}</Text>
          <Text style={styles.description}>{airQuality.description}</Text>
          <Text style={styles.concentration}>{airQuality.concentration}</Text>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(45, 45, 45, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardAndroid: {
    backgroundColor: 'rgba(45, 45, 45, 0.8)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.body,
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  viewReport: {
    ...typography.bodySmall,
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  circleContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  scoreContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  descriptionContainer: {
    flex: 1,
  },
  pollutant: {
    ...typography.body,
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  concentration: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
});
