/**
 * Next7DaysScreen - Écran prévisions sur 7 jours
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
import { fetch7DayForecast } from '@services/weather/weatherService';
import { useAuth } from '@hooks/useAuth';
import { colors } from '@theme';
import type { DailyForecast } from '../types/weather';
import type { AppNavigationProp, RootStackParamList } from '@navigation/AppNavigator';

type Next7DaysRouteProp = RouteProp<RootStackParamList, 'Next7Days'>;

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

export const Next7DaysScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<Next7DaysRouteProp>();
  const { userProfile } = useAuth();
  const { lat, lng, locationName } = route.params || {};
  
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string }>({
    lat: lat || -33.8688,
    lng: lng || 151.2093,
    name: locationName || 'Sydney',
  });
  const [forecasts, setForecasts] = useState<DailyForecast[]>([]);
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
    const loadForecasts = async () => {
      setLoading(true);
      try {
        const data = await fetch7DayForecast(location.lat, location.lng);
        if (data) setForecasts(data);
      } catch (error) {
        console.error('Erreur chargement prévisions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadForecasts();
  }, [location]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const tomorrowForecast = forecasts[0];
  const otherDays = forecasts.slice(1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>7 prochains jours</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('Forecast', {
            lat: location.lat,
            lng: location.lng,
            locationName: location.name,
          })}
        >
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Carte Demain - gradient vert */}
        {tomorrowForecast && (
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            style={styles.tomorrowCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            {/* Grande icône météo */}
            <View style={styles.tomorrowIconContainer}>
              <Text style={styles.tomorrowIconLarge}>☁️</Text>
              <View style={styles.rainIndicator}>
                <Text style={styles.rainIcon}>💧💧💧</Text>
              </View>
            </View>

            {/* Info météo demain */}
            <View style={styles.tomorrowInfo}>
              <Text style={styles.tomorrowLabel}>Demain</Text>
              <Text style={styles.tomorrowCondition}>
                {tomorrowForecast.description}
              </Text>
              <Text style={styles.tomorrowTemp}>
                {tomorrowForecast.tempMax}°/{tomorrowForecast.tempMin}°
              </Text>
            </View>

            {/* Indicateurs du bas */}
            <View style={styles.tomorrowIndicators}>
              <View style={styles.tomorrowIndicator}>
                <Text style={styles.tomorrowIndicatorIcon}>💨</Text>
                <Text style={styles.tomorrowIndicatorValue}>{tomorrowForecast.windSpeed}km/h</Text>
                <Text style={styles.tomorrowIndicatorLabel}>Vent</Text>
              </View>
              <View style={styles.tomorrowIndicator}>
                <Text style={styles.tomorrowIndicatorIcon}>💧</Text>
                <Text style={styles.tomorrowIndicatorValue}>{tomorrowForecast.humidity}%</Text>
                <Text style={styles.tomorrowIndicatorLabel}>Humidité</Text>
              </View>
              <View style={styles.tomorrowIndicator}>
                <Text style={styles.tomorrowIndicatorIcon}>👁️</Text>
                <Text style={styles.tomorrowIndicatorValue}>{tomorrowForecast.visibility}km</Text>
                <Text style={styles.tomorrowIndicatorLabel}>Visibilité</Text>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Liste des 7 jours - Cartes individuelles */}
        <View style={styles.weekList}>
          {otherDays.map((day, index) => (
            <View key={index} style={styles.dayRow}>
              <Text style={styles.dayName}>{day.day}</Text>
              <View style={styles.dayWeather}>
                <Text style={styles.dayIcon}>{getWeatherEmoji(day.icon)}</Text>
                <Text style={styles.dayCondition}>{day.description}</Text>
              </View>
              <Text style={styles.dayTemp}>{day.tempMax}°/{day.tempMin}°</Text>
            </View>
          ))}
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.primaryDark,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    color: colors.primaryDark,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  tomorrowCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tomorrowIconContainer: {
    marginRight: 20,
    position: 'relative',
  },
  tomorrowIconLarge: {
    fontSize: 100,
  },
  rainIndicator: {
    position: 'absolute',
    bottom: -10,
    left: 15,
  },
  rainIcon: {
    fontSize: 20,
  },
  tomorrowInfo: {
    flex: 1,
  },
  tomorrowLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  tomorrowCondition: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
  },
  tomorrowTemp: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  tomorrowIndicators: {
    flexDirection: 'column',
    gap: 12,
  },
  tomorrowIndicator: {
    alignItems: 'center',
  },
  tomorrowIndicatorIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tomorrowIndicatorValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  tomorrowIndicatorLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  weekList: {
    gap: 16,
  },
  dayRow: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    width: 100,
  },
  dayWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dayIcon: {
    fontSize: 32,
  },
  dayCondition: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  dayTemp: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryDark,
  },
});
