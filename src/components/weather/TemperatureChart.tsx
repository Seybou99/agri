/**
 * TemperatureChart - Graphique en courbe pour afficher l'évolution de la température
 * Style moderne avec gradient de remplissage
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors, spacing, typography } from '@theme';
import type { TemperatureDataPoint } from '@types/weather';

interface TemperatureChartProps {
  data: TemperatureDataPoint[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CHART_HEIGHT = 200;
const CHART_PADDING = 40;

export const TemperatureChart: React.FC<TemperatureChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No temperature data available</Text>
      </View>
    );
  }

  // Calculer les valeurs min/max pour l'échelle
  const temps = data.map(d => d.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp || 1;
  
  // Ajouter une marge pour l'affichage
  const yMin = minTemp - 5;
  const yMax = maxTemp + 5;
  const yRange = yMax - yMin;

  // Calculer les points du graphique
  const points = data.map((point, index) => {
    const x = CHART_PADDING + (index * (CHART_WIDTH - CHART_PADDING * 2)) / (data.length - 1);
    const y = CHART_HEIGHT - CHART_PADDING - ((point.temp - yMin) / yRange) * (CHART_HEIGHT - CHART_PADDING * 2);
    return { x, y, temp: point.temp, day: point.day };
  });

  // Créer le chemin de la courbe
  const createPath = (): string => {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    return path;
  };

  // Créer le chemin pour le remplissage (area chart)
  const createAreaPath = (): string => {
    const curvePath = createPath();
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    return `${curvePath} L ${lastPoint.x} ${CHART_HEIGHT - CHART_PADDING} L ${firstPoint.x} ${CHART_HEIGHT - CHART_PADDING} Z`;
  };

  // Trouver le point le plus élevé pour le highlight
  const maxPoint = points.reduce((max, p) => (p.temp > max.temp ? p : max), points[0]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Temperature</Text>
        <Text style={styles.viewReport}>View Report {'>'}</Text>
      </View>
      
      <View style={styles.chartContainer}>
        <View style={styles.chartWrapper}>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </LinearGradient>
          </Defs>
          
          {/* Zone remplie sous la courbe */}
          <Path
            d={createAreaPath()}
            fill="url(#gradient)"
          />
          
          {/* Courbe de température */}
          <Path
            d={createPath()}
            stroke="#60A5FA"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Points sur la courbe */}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={point.temp === maxPoint.temp ? "#3B82F6" : "#60A5FA"}
            />
          ))}
          
          {/* Highlight pour le point maximum */}
          {maxPoint && (
            <>
              <Circle
                cx={maxPoint.x}
                cy={maxPoint.y}
                r="6"
                fill="#3B82F6"
              />
              <Rect
                x={maxPoint.x - 20}
                y={maxPoint.y - 35}
                width="40"
                height="25"
                rx="4"
                fill="#3B82F6"
              />
            </>
          )}
          </Svg>
          
          {/* Highlight text pour le point maximum */}
          {maxPoint && (
            <View
              style={[
                styles.highlightLabel,
                {
                  left: maxPoint.x - 20 + spacing.md,
                  top: maxPoint.y - 35,
                },
              ]}
            >
              <Text style={styles.highlightText}>{maxPoint.temp}°</Text>
            </View>
          )}
        </View>
        
        {/* Labels des jours en bas */}
        <View style={styles.dayLabels}>
          {data.map((point, index) => (
            <Text key={index} style={styles.dayLabel}>
              {point.day}
            </Text>
          ))}
        </View>
        
        {/* Labels des heures en haut */}
        <View style={styles.timeLabels}>
          {['09h', '12h', '15h', '18h', '21h', '00h'].map((time, index) => (
            <Text key={index} style={styles.timeLabel}>
              {time}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  chartContainer: {
    backgroundColor: 'rgba(45, 45, 45, 0.6)',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartWrapper: {
    position: 'relative',
    height: CHART_HEIGHT,
  },
  dayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingHorizontal: CHART_PADDING - spacing.md,
  },
  dayLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: CHART_PADDING - spacing.md,
  },
  timeLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
  },
  noDataText: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    padding: spacing.lg,
  },
  highlightLabel: {
    position: 'absolute',
    width: 40,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
