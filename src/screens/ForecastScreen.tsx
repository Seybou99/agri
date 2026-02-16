/**
 * ForecastScreen - Écran avec graphique de température et villes populaires
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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import * as Location from 'expo-location';
import {
  fetchTemperatureChartData,
  fetchPopularCities,
  fetchCurrentWeather,
} from '@services/weather/weatherService';
import { useAuth } from '@hooks/useAuth';
import { colors } from '@theme';
import type { TemperatureDataPoint, PopularCity, CurrentWeather } from '../types/weather';
import type { AppNavigationProp, RootStackParamList } from '@navigation/AppNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 80;
const CHART_HEIGHT = 200;

type ForecastRouteProp = RouteProp<RootStackParamList, 'Forecast'>;

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

export const ForecastScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<ForecastRouteProp>();
  const { userProfile } = useAuth();
  const { lat, lng, locationName } = route.params || {};
  
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string }>({
    lat: lat || -33.8688,
    lng: lng || 151.2093,
    name: locationName || 'Sydney',
  });
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [chartData, setChartData] = useState<TemperatureDataPoint[]>([]);
  const [popularCities, setPopularCities] = useState<PopularCity[]>([]);
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
    const loadData = async () => {
      setLoading(true);
      try {
        const [currentData, chart, cities] = await Promise.all([
          fetchCurrentWeather(location.lat, location.lng),
          fetchTemperatureChartData(location.lat, location.lng),
          fetchPopularCities(),
        ]);

        if (currentData) setWeather(currentData);
        if (chart) setChartData(chart);
        if (cities) setPopularCities(cities);
      } catch (error) {
        console.error('Erreur chargement données:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [location]);

  // Générer les points du graphique
  const generatePath = () => {
    if (chartData.length === 0) return { path: '', points: [] };
    
    const maxTemp = Math.max(...chartData.map(d => d.temp));
    const minTemp = Math.min(...chartData.map(d => d.temp));
    const tempRange = maxTemp - minTemp || 1;
    
    const points = chartData.map((point, index) => {
      const x = (index / (chartData.length - 1)) * CHART_WIDTH;
      const y = CHART_HEIGHT - ((point.temp - minTemp) / tempRange) * (CHART_HEIGHT - 40);
      return { x, y, temp: point.temp };
    });

    // Créer le path SVG avec courbe de Bézier
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currPoint = points[i];
      const midX = (prevPoint.x + currPoint.x) / 2;
      path += ` Q ${prevPoint.x} ${prevPoint.y}, ${midX} ${(prevPoint.y + currPoint.y) / 2}`;
      path += ` T ${currPoint.x} ${currPoint.y}`;
    }

    return { path, points };
  };

  const { path, points } = generatePath();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const today = new Date();
  const todayStr = `Aujourd'hui ${today.getDate()} ${today.toLocaleDateString('fr-FR', { month: 'short' })}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prévisions</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header card avec ville */}
        <LinearGradient
          colors={[colors.primaryLight, colors.primary]}
          style={styles.cityCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.cityInfo}>
            <Text style={styles.cityDate}>{todayStr}</Text>
            <View style={styles.cityRow}>
              <Text style={styles.cityIcon}>
                {getWeatherEmoji(weather?.icon || '02d')}
              </Text>
              <Text style={styles.cityName}>{location.name}</Text>
              <View style={styles.mapButton}>
                <Text style={styles.mapIcon}>📍</Text>
                <Text style={styles.mapText}>Carte</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Section graphique température */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Température</Text>
            <TouchableOpacity>
              <Text style={styles.viewReportLink}>Voir le rapport ›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartContainer}>
            {/* Timeline en haut */}
            <View style={styles.timeline}>
              {['09h', '12h', '15h', '18h', '21h', '00h'].map((time, index) => (
                <Text key={index} style={styles.timeLabel}>{time}</Text>
              ))}
            </View>

            {/* Graphique SVG */}
            {chartData.length > 0 && (
              <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={styles.chart}>
                {/* Grille de fond */}
                {[0, 1, 2, 3].map((i) => (
                  <Line
                    key={i}
                    x1="0"
                    y1={i * (CHART_HEIGHT / 3)}
                    x2={CHART_WIDTH}
                    y2={i * (CHART_HEIGHT / 3)}
                    stroke={colors.gray[200]}
                    strokeWidth="1"
                  />
                ))}

                {/* Courbe de température */}
                <Path
                  d={path}
                  stroke={colors.primary}
                  strokeWidth="3"
                  fill="none"
                />

                {/* Points et labels */}
                {points.map((point, index) => (
                  <React.Fragment key={index}>
                    <Circle
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill={colors.primary}
                    />
                    {index === 1 && (
                      <>
                        <Circle
                          cx={point.x}
                          cy={point.y}
                          r="16"
                          fill={colors.primary}
                        />
                        <SvgText
                          x={point.x}
                          y={point.y + 5}
                          fill={colors.primaryDark}
                          fontSize="12"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          {point.temp}°
                        </SvgText>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </Svg>
            )}

            {/* Jours de la semaine */}
            <View style={styles.weekDays}>
              {chartData.map((day, index) => (
                <Text key={index} style={styles.dayLabel}>{day.day}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Villes populaires */}
        <View style={styles.citiesSection}>
          <View style={styles.citiesHeader}>
            <Text style={styles.citiesTitle}>Villes populaires</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllLink}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {popularCities.map((city, index) => (
            <View key={index} style={styles.cityCard2}>
              <View style={styles.cityWeather}>
                <Text style={styles.cityIcon2}>{getWeatherEmoji(city.icon)}</Text>
                <View style={styles.cityDetails}>
                  <Text style={styles.cityName2}>{city.name}</Text>
                  <Text style={styles.cityCondition}>{city.description}</Text>
                </View>
              </View>
              <Text style={styles.cityTemp}>{city.temp}°</Text>
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
  cityCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  cityInfo: {
    gap: 8,
  },
  cityDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cityIcon: {
    fontSize: 32,
  },
  cityName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.white,
    flex: 1,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  mapIcon: {
    fontSize: 14,
  },
  mapText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500',
  },
  chartSection: {
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  viewReportLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  timeLabel: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  chart: {
    marginVertical: 20,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  dayLabel: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '500',
  },
  citiesSection: {
    marginBottom: 24,
  },
  citiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  citiesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  viewAllLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  cityCard2: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cityWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cityIcon2: {
    fontSize: 48,
  },
  cityDetails: {
    gap: 4,
  },
  cityName2: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cityCondition: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  cityTemp: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});
