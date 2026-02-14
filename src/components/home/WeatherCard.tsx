/**
 * WeatherCard - Carte météo avec design glassmorphism
 * Design inspiré de la maquette Apple Weather
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Platform 
} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, spacing, typography } from '@theme';
import { fetchCurrentWeather, fetchHourlyForecast, fetchDailyForecast } from '@services/weather/openWeatherService';
import { useAuth } from '@hooks/useAuth';
import type { HourlyForecast, DailyForecast } from '@services/weather/openWeatherService';

interface WeatherCardProps {
  location?: { lat: number; lng: number; name: string };
  onPress?: (location: { lat: number; lng: number; name: string }) => void;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ location: propLocation, onPress }) => {
  const { userProfile } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string }>(
    propLocation || { lat: 48.8566, lng: 2.3522, name: 'Paris' }
  );
  const [weather, setWeather] = useState<{
    temp: number;
    description: string;
    windSpeed: number;
    isMock?: boolean;
  } | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propLocation) {
      setLocation(propLocation);
      return;
    }

    const getLocation = async () => {
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
  }, [propLocation, userProfile]);

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      try {
        const [currentData, hourlyData, dailyData] = await Promise.all([
          fetchCurrentWeather(location.lat, location.lng),
          fetchHourlyForecast(location.lat, location.lng),
          fetchDailyForecast(location.lat, location.lng),
        ]);

        if (currentData) {
          setWeather({
            temp: Math.round(currentData.temp),
            description: currentData.description,
            windSpeed: currentData.windSpeed,
            isMock: currentData.isMock,
          });
        }

        if (hourlyData) {
          setHourlyForecast(hourlyData.slice(0, 8));
        }

        if (dailyData) {
          setDailyForecast(dailyData.slice(0, 10));
        }
      } catch (error) {
        console.error('Erreur chargement météo:', error);
      } finally {
        setLoading(false);
      }
    };
    loadWeather();
  }, [location]);

  const getWeatherIcon = (icon: string) => {
    if (icon.includes('01d')) return '☀️';
    if (icon.includes('01n')) return '🌙';
    if (icon.includes('02')) return '⛅';
    if (icon.includes('03') || icon.includes('04')) return '☁️';
    if (icon.includes('09') || icon.includes('10')) return '🌧️';
    if (icon.includes('11')) return '⛈️';
    if (icon.includes('13')) return '❄️';
    if (icon.includes('50')) return '🌫️';
    return '☁️';
  };

  const getSummaryText = () => {
    if (!weather) return '';
    const desc = weather.description.toLowerCase();
    if (desc.includes('pluie') || desc.includes('rain')) {
      return `Temps pluvieux pour le reste de la journée. Rafales de vent allant jusqu'à ${Math.round(weather.windSpeed * 3.6)} km/h.`;
    }
    if (desc.includes('nuage') || desc.includes('cloud')) {
      return `Temps nuageux pour le reste de la journée. Rafales de vent allant jusqu'à ${Math.round(weather.windSpeed * 3.6)} km/h.`;
    }
    return `Temps dégagé pour le reste de la journée. Rafales de vent allant jusqu'à ${Math.round(weather.windSpeed * 3.6)} km/h.`;
  };

  const formatTime = (timeStr: string) => {
    if (timeStr === 'Maintenant') return 'Maint.';
    return timeStr;
  };

  // Fonction pour obtenir le gradient selon la météo et l'heure
  const getWeatherGradient = (): [string, string, string] => {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 20;
    
    if (isNight) {
      // Nuit - bleu foncé à violet
      return ['#1e3c72', '#2a5298', '#7e8ba3'];
    }
    
    const desc = weather?.description.toLowerCase() || '';
    
    if (desc.includes('pluie') || desc.includes('rain')) {
      // Pluie - gris bleuté
      return ['#6B7B8C', '#8B9DAF', '#A8BACF'];
    }
    
    if (desc.includes('nuage') || desc.includes('cloud')) {
      // Nuageux - bleu gris
      return ['#7B8FA0', '#99ACC0', '#B5C8DC'];
    }
    
    // Ensoleillé - bleu ciel lumineux
    return ['#4A90E2', '#67B5F5', '#87CEEB'];
  };

  const GlassCard = ({ children, style }: any) => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView intensity={30} tint="light" style={[styles.glassCard, style]}>
          {children}
        </BlurView>
      );
    }
    
    // Fallback pour Android
    return (
      <View style={[styles.glassCard, styles.glassCardAndroid, style]}>
        {children}
      </View>
    );
  };

  // Calculer les températures min/max globales pour la barre de température
  const allTemps = dailyForecast.flatMap(f => [f.tempMin, f.tempMax]);
  const globalMin = dailyForecast.length > 0 ? Math.min(...allTemps) : 0;
  const globalMax = dailyForecast.length > 0 ? Math.max(...allTemps) : 20;
  const tempRange = Math.max(globalMax - globalMin, 1);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(location)}
      style={styles.touchableContainer}
    >
      <LinearGradient
        colors={getWeatherGradient() as [string, string, string]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header avec localisation */}
          <View style={styles.header}>
            <Text style={styles.locationLabel}>📍 BUREAU</Text>
            <Text style={styles.locationName}>{location.name}</Text>
            <Text style={styles.currentTemp}>{weather?.temp || '--'}°</Text>
            <Text style={styles.weatherDescription}>
              {weather?.description ? weather.description.charAt(0).toUpperCase() + weather.description.slice(1) : 'Nuageux'}
            </Text>
          </View>

          {/* Carte avec effet glassmorphism */}
          <GlassCard>
            {/* Section Résumé */}
            <View style={styles.summarySection}>
              <Text style={styles.summaryText}>{getSummaryText()}</Text>
            </View>

            {/* Ligne de séparation */}
            <View style={styles.separator} />

            {/* Section Prévisions Horaires */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyContainer}
            >
              {loading ? (
                <Text style={styles.loadingText}>Chargement...</Text>
              ) : hourlyForecast.length > 0 ? (
                hourlyForecast.map((forecast, index) => (
                  <View key={index} style={styles.hourlyItem}>
                    <Text style={styles.hourlyTime}>{formatTime(forecast.time)}</Text>
                    <Text style={styles.hourlyIcon}>{getWeatherIcon(forecast.icon)}</Text>
                    <Text style={styles.hourlyTemp}>{forecast.temp}°</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>Données indisponibles</Text>
              )}
            </ScrollView>
          </GlassCard>

          {/* Section Prévisions sur 10 jours */}
          {dailyForecast.length > 0 && (
            <GlassCard style={styles.dailyCardSpacing}>
              <View style={styles.dailyHeader}>
                <Text style={styles.dailyHeaderIcon}>📅</Text>
                <Text style={styles.dailyHeaderText}>PRÉVISIONS SUR 10 JOURS</Text>
              </View>
              
              {dailyForecast.map((day, index) => {
                // Calculer la position relative de la barre de température
                const barStartPercent = tempRange > 0 ? ((day.tempMin - globalMin) / tempRange) * 100 : 0;
                const barWidthPercent = tempRange > 0 ? ((day.tempMax - day.tempMin) / tempRange) * 100 : 10;
                
                return (
                  <View key={index}>
                    <View style={styles.dailyRow}>
                      <Text style={styles.dayName}>{day.day}</Text>
                      <View style={styles.dailyRowCenter}>
                        <Text style={styles.dailyIcon}>{getWeatherIcon(day.icon)}</Text>
                        {day.precipitation > 0 && (
                          <Text style={styles.precipProb}>{day.precipitation}%</Text>
                        )}
                      </View>
                      <View style={styles.tempRange}>
                        <Text style={styles.tempMin}>{day.tempMin}°</Text>
                        <View style={styles.tempBar}>
                          <View 
                            style={[
                              styles.tempBarFill,
                              {
                                left: `${barStartPercent}%`,
                                width: `${Math.max(barWidthPercent, 5)}%`,
                              },
                            ]} 
                          />
                        </View>
                        <Text style={styles.tempMax}>{day.tempMax}°</Text>
                      </View>
                    </View>
                    {index < dailyForecast.length - 1 && <View style={styles.dailySeparator} />}
                  </View>
                );
              })}
            </GlassCard>
          )}
        </ScrollView>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchableContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.xl,
  },
  locationLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  locationName: {
    ...typography.h1,
    color: colors.white,
    fontSize: 34,
    fontWeight: '300',
    marginBottom: spacing.sm,
  },
  currentTemp: {
    fontSize: 96,
    fontWeight: '200',
    color: colors.white,
    lineHeight: 96,
  },
  weatherDescription: {
    ...typography.body,
    color: colors.white,
    fontSize: 20,
    fontWeight: '500',
  },
  glassCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassCardAndroid: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)', // Plus opaque sur Android
  },
  summarySection: {
    padding: spacing.lg,
  },
  summaryText: {
    ...typography.bodySmall,
    color: colors.white,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  separator: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: spacing.lg,
  },
  hourlyContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 60, // Espacement selon maquette
    minWidth: 60,
  },
  hourlyTime: {
    ...typography.caption,
    color: colors.white,
    fontSize: 14,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  hourlyIcon: {
    fontSize: 40, // Icônes plus grandes selon maquette
    marginBottom: spacing.xs,
  },
  hourlyTemp: {
    ...typography.body,
    color: colors.white,
    fontSize: 20,
    fontWeight: '400',
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.8,
  },
  noDataText: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.8,
  },
  dailyCardSpacing: {
    marginTop: 0,
  },
  dailyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  dailyHeaderIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  dailyHeaderText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  dayName: {
    ...typography.body,
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
    width: 80,
  },
  dailyRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  dailyIcon: {
    fontSize: 28,
  },
  precipProb: {
    ...typography.caption,
    color: '#5DADE2',
    fontSize: 13,
    fontWeight: '600',
  },
  tempRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tempMin: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 18,
    fontWeight: '500',
    width: 32,
    textAlign: 'right',
  },
  tempBar: {
    width: 100,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  tempBarFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#5DADE2',
    borderRadius: 2,
  },
  tempMax: {
    ...typography.body,
    color: colors.white,
    fontSize: 18,
    fontWeight: '500',
    width: 32,
  },
  dailySeparator: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: spacing.xs / 2,
    marginHorizontal: spacing.lg,
  },
});
