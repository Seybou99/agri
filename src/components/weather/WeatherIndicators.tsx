/**
 * WeatherIndicators - Composant pour afficher les indicateurs météo (Wind, Humidity, Visibility)
 * Style moderne avec icônes et valeurs
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, typography } from '@theme';

interface WeatherIndicatorsProps {
  windSpeed: number; // km/h
  humidity: number; // %
  visibility: number; // km
}

export const WeatherIndicators: React.FC<WeatherIndicatorsProps> = ({
  windSpeed,
  humidity,
  visibility,
}) => {
  const Indicator = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
    <View style={styles.indicator}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Indicator
        icon={
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9.59 4.59A2 2 0 1111 8H2m10-4v8m0-8h8m-8 0a2 2 0 104 0m-4 8a2 2 0 104 0m-4 0h8m-8 0v8m8-8v8m0-8h8m-8 0a2 2 0 104 0m4 0a2 2 0 104 0"
              stroke={colors.white}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        }
        value={`${windSpeed}km/h`}
        label="Wind"
      />
      
      <Indicator
        icon={
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2.69l5.66 5.66a8 8 0 11-11.32 0z"
              stroke={colors.white}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              stroke={colors.white}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        }
        value={`${humidity}%`}
        label="Humidity"
      />
      
      <Indicator
        icon={
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
              stroke={colors.white}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 9a3 3 0 100 6 3 3 0 000-6z"
              stroke={colors.white}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        }
        value={`${visibility}km`}
        label="Visibility"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  indicator: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginBottom: spacing.xs,
    opacity: 0.9,
  },
  value: {
    ...typography.body,
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  label: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    opacity: 0.7,
  },
});
