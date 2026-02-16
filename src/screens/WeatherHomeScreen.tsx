/**
 * WeatherHomeScreen - Écran principal "Today"
 * Design exact selon le code fourni par l'utilisateur
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import {
  fetchCurrentWeather,
  fetchHourlyForecast,
  fetchAirQuality,
} from '@services/weather/weatherService';
import { useAuth } from '@hooks/useAuth';
import { colors } from '@theme';
import type { CurrentWeather, HourlyForecast, AirQuality } from '../types/weather';
import type { AppNavigationProp, RootStackParamList } from '@navigation/AppNavigator';

type WeatherHomeRouteProp = RouteProp<RootStackParamList, 'WeatherHome'>;

// Mapper les codes OpenWeather vers des emojis
const getWeatherEmoji = (iconCode: string): string => {
  if (iconCode.includes('01')) return '☀️';
  if (iconCode.includes('02')) return '🌤️';
  if (iconCode.includes('03')) return '☁️';
  if (iconCode.includes('04')) return '☁️';
  if (iconCode.includes('09')) return '🌧️';
  if (iconCode.includes('10')) return '🌦️';
  if (iconCode.includes('11')) return '⛈️';
  if (iconCode.includes('13')) return '❄️';
  if (iconCode.includes('50')) return '🌫️';
  return '🌤️';
};

export const WeatherHomeScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<WeatherHomeRouteProp>();
  const { userProfile } = useAuth();
  const { lat, lng, locationName } = route.params || {};
  
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string }>({
    lat: lat || -33.8688,
    lng: lng || 151.2093,
    name: locationName || 'Sydney',
  });
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [airQuality, setAirQuality] = useState<AirQuality | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLocation = async () => {
      if (lat && lng) {
        setLocation({ lat, lng, name: locationName || 'Location' });
        return;
      }

      if (userProfile?.location) {
        setLocation({
          lat: userProfile.location.lat,
          lng: userProfile.location.lng,
          name: 'Your Location',
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
            name: 'Current Location',
          });
        }
      } catch (error) {
        console.error('Erreur localisation:', error);
      }
    };

    getLocation();
  }, [lat, lng, locationName, userProfile]);

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      try {
        const [currentData, hourlyData, airQualityData] = await Promise.all([
          fetchCurrentWeather(location.lat, location.lng),
          fetchHourlyForecast(location.lat, location.lng),
          fetchAirQuality(location.lat, location.lng),
        ]);

        if (currentData) setWeather(currentData);
        if (hourlyData) setHourlyForecast(hourlyData);
        if (airQualityData) setAirQuality(airQualityData);
      } catch (error) {
        console.error('Erreur chargement météo:', error);
      } finally {
        setLoading(false);
      }
    };
    loadWeather();
  }, [location]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#60A5FA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Carte principale météo */}
        <LinearGradient
          colors={[colors.primaryLight, colors.primary]}
          style={styles.mainCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Header avec icônes */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.iconText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.iconText}>👤</Text>
            </TouchableOpacity>
          </View>

          {/* Ville et condition */}
          <Text style={styles.cityName}>{location.name}</Text>
          <Text style={styles.condition}>{weather?.description || 'Mostly Sunny'}</Text>

          {/* Température principale */}
          <Text style={styles.mainTemp}>{weather?.temp || 24}°</Text>

          {/* Grande icône météo */}
          <View style={styles.weatherIconContainer}>
            <Text style={styles.weatherIconLarge}>
              {getWeatherEmoji(weather?.icon || '02d')}
            </Text>
          </View>

          {/* Indicateurs (Vent, Humidité, Visibilité) */}
          <View style={styles.indicators}>
            <View style={styles.indicator}>
              <Text style={styles.indicatorIcon}>💨</Text>
              <Text style={styles.indicatorValue}>{weather?.windSpeed || 9}km/h</Text>
              <Text style={styles.indicatorLabel}>Vent</Text>
            </View>
            <View style={styles.indicator}>
              <Text style={styles.indicatorIcon}>💧</Text>
              <Text style={styles.indicatorValue}>{weather?.humidity || 25}%</Text>
              <Text style={styles.indicatorLabel}>Humidité</Text>
            </View>
            <View style={styles.indicator}>
              <Text style={styles.indicatorIcon}>👁️</Text>
              <Text style={styles.indicatorValue}>{weather?.visibility || 1.7}km</Text>
              <Text style={styles.indicatorLabel}>Visibilité</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Section Aujourd'hui avec prévisions horaires */}
        <View style={styles.todaySection}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayTitle}>Aujourd'hui</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Next7Days', {
                lat: location.lat,
                lng: location.lng,
                locationName: location.name,
              })}
            >
              <Text style={styles.next7DaysLink}>7 prochains jours ›</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hourlyScroll}
          >
            {hourlyForecast.map((forecast, index) => (
              <View 
                key={index} 
                style={[
                  styles.hourlyCard,
                  forecast.isNow && styles.hourlyCardHighlighted
                ]}
              >
                <Text style={[
                  styles.hourlyTime,
                  forecast.isNow && styles.hourlyTimeHighlighted
                ]}>
                  {forecast.time}
                </Text>
                <Text style={styles.hourlyIcon}>
                  {getWeatherEmoji(forecast.icon)}
                </Text>
                <Text style={[
                  styles.hourlyTemp,
                  forecast.isNow && styles.hourlyTempHighlighted
                ]}>
                  {forecast.temp}°
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Section Qualité de l'air */}
        {airQuality && (
          <View style={styles.airQualitySection}>
            <View style={styles.airQualityHeader}>
              <Text style={styles.airQualityTitle}>Qualité de l'air</Text>
              <TouchableOpacity>
                <Text style={styles.viewReportLink}>Voir le rapport ›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.airQualityCard}>
              <View style={styles.airQualityCircle}>
                <Text style={styles.airQualityIndex}>{airQuality.score}</Text>
              </View>
              <View style={styles.airQualityInfo}>
                <Text style={styles.airQualityLevel}>{airQuality.mainPollutant}</Text>
                <Text style={styles.airQualityDescription}>
                  {airQuality.description}
                </Text>
                <Text style={styles.airQualityDetails}>{airQuality.concentration}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  mainCard: {
    borderRadius: 24,
    padding: 18,
    marginTop: 30,
    marginBottom: 20,
    minHeight: 280,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
    color: colors.white,
  },
  cityName: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 2,
  },
  condition: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainTemp: {
    fontSize: 56,
    fontWeight: '200',
    color: colors.white,
    textAlign: 'center',
    letterSpacing: -2,
  },
  weatherIconContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  weatherIconLarge: {
    fontSize: 64,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  indicator: {
    alignItems: 'center',
  },
  indicatorIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  indicatorValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  indicatorLabel: {
    fontSize: 13,
    color: colors.white,
  },
  todaySection: {
    marginBottom: 24,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  next7DaysLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  hourlyScroll: {
    gap: 12,
  },
  hourlyCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    width: 80,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  hourlyCardHighlighted: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  hourlyTime: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  hourlyTimeHighlighted: {
    color: colors.primaryDark,
  },
  hourlyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  hourlyTemp: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  hourlyTempHighlighted: {
    color: colors.primaryDark,
  },
  airQualitySection: {
    marginBottom: 24,
  },
  airQualityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  airQualityTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  viewReportLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  airQualityCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  airQualityCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  airQualityIndex: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  airQualityInfo: {
    flex: 1,
  },
  airQualityLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  airQualityDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  airQualityDetails: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});
