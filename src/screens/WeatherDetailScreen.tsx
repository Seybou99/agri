/**
 * WeatherDetailScreen - Détails complets de la météo avec design glassmorphism moderne
 * Restructuré pour correspondre exactement à la maquette de référence
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import * as Location from 'expo-location';
import { colors, spacing, typography } from '@theme';
import {
  fetchCurrentWeather,
  fetchHourlyForecast,
  fetchDailyForecast,
} from '@services/weather/openWeatherService';
import { HourlyCarousel, DailyForecastCard } from '@components/weather';
import { useAuth } from '@hooks/useAuth';
import type { AppNavigationProp } from '@navigation/AppNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type WeatherDetailRouteProp = RouteProp<
  { WeatherDetail: { lat?: number; lng?: number; locationName?: string } },
  'WeatherDetail'
>;

export const WeatherDetailScreen: React.FC = () => {
  const route = useRoute<WeatherDetailRouteProp>();
  const navigation = useNavigation<AppNavigationProp>();
  const { userProfile } = useAuth();
  const { lat, lng, locationName } = route.params || {};

  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  }>({ lat: lat || 12.65, lng: lng || -7.99, name: locationName || 'Bamako' });
  const [weather, setWeather] = useState<{
    temp: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    description: string;
    icon: string;
    windSpeed: number;
    isMock?: boolean;
  } | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([]);
  const [dailyForecast, setDailyForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLocation = async () => {
      if (lat && lng) {
        setLocation({ lat, lng, name: locationName || 'Position' });
        return;
      }

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
  }, [lat, lng, locationName, userProfile]);

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
            feelsLike: Math.round(currentData.feelsLike),
            humidity: currentData.humidity,
            pressure: currentData.pressure,
            description: currentData.description,
            icon: currentData.icon,
            windSpeed: currentData.windSpeed,
            isMock: currentData.isMock,
          });
        }

        if (hourlyData) {
          setHourlyForecast(hourlyData);
        }

        if (dailyData) {
          setDailyForecast(dailyData);
        }
      } catch (error) {
        console.error('Erreur chargement météo:', error);
      } finally {
        setLoading(false);
      }
    };
    loadWeather();
  }, [location]);

  // Fond clair aligné avec le reste de l'app (vert / blanc)
  const getBackgroundColor = () => {
    if (!weather) return colors.background;
    const desc = weather.description.toLowerCase();
    if (desc.includes('pluie') || desc.includes('rain')) {
      return colors.gray[100];
    }
    if (desc.includes('nuage') || desc.includes('cloud')) {
      return colors.gray[50];
    }
    return '#E8F5E9'; // Vert très clair (thème agricole)
  };

  // Gradient de fallback si pas d'image de fond
  const BackgroundComponent = ({ children }: { children: React.ReactNode }) => {
    // Pour l'instant, on utilise un fond solide avec gradient simulé
    // Si vous ajoutez une image weather-background.jpg dans assets/image/, décommentez le code ImageBackground
    return (
      <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
        {children}
      </View>
    );
    
    // Code pour utiliser une image de fond (à décommenter si vous ajoutez l'image)
    /*
    return (
      <ImageBackground
        source={require('@assets/image/weather-background.jpg')}
        style={styles.container}
        resizeMode="cover"
      >
        {children}
      </ImageBackground>
    );
    */
  };

  return (
    <BackgroundComponent>
      <SafeAreaView style={styles.safeArea}>
        {/* Header minimaliste avec bouton retour */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke={colors.primaryDark}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Chargement des données météo...</Text>
            </View>
          ) : weather ? (
            <>
              {/* SECTION 1: Carousel prévisions horaires (EN PREMIER selon maquette) */}
              {hourlyForecast.length > 0 && (
                <HourlyCarousel forecasts={hourlyForecast} />
              )}

              {/* SECTION 2: Header localisation + température actuelle */}
              <View style={styles.locationHeader}>
                <View style={styles.locationIndicator}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                      stroke={colors.primary}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={styles.locationLabel}>BUREAU</Text>
                </View>
                <Text style={styles.locationName}>{location.name}</Text>
                <View style={styles.currentWeather}>
                  <Text style={styles.temperature}>{weather.temp}°</Text>
                  <Text style={styles.separator}>|</Text>
                  <Text style={styles.condition}>
                    {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
                  </Text>
                </View>
              </View>

              {/* SECTION 3: Carte prévisions quotidiennes (10 jours) */}
              {dailyForecast.length > 0 && (
                <DailyForecastCard forecasts={dailyForecast.slice(0, 10)} />
              )}

              {/* Indicateur données mock */}
              {weather.isMock && (
                <View style={styles.mockBanner}>
                  <Text style={styles.mockBannerText}>
                    ⚠️ Données de démonstration
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorTitle}>Données météo indisponibles</Text>
              <Text style={styles.errorText}>
                Impossible de charger les données météo pour cette localisation.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Navigation bottom glassmorphism (style maquette) */}
        {Platform.OS === 'ios' ? (
          <BlurView intensity={30} tint="light" style={styles.bottomNav}>
            <View style={styles.bottomNavContent}>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.7}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                stroke={colors.primaryDark}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <View style={styles.navButtonActive}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke={colors.primaryDark}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <View style={styles.navDots}>
              <View style={styles.navDot} />
              <View style={styles.navDot} />
              <View style={styles.navDot} />
            </View>
          </View>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.7}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                stroke={colors.primaryDark}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
            </View>
          </BlurView>
        ) : (
          <View style={styles.bottomNav}>
            <View style={styles.bottomNavOverlay} />
            <View style={styles.bottomNavContent}>
              <TouchableOpacity style={styles.navButton} activeOpacity={0.7}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    stroke={colors.primaryDark}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
              <View style={styles.navButtonActive}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke={colors.primaryDark}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <View style={styles.navDots}>
                  <View style={styles.navDot} />
                  <View style={styles.navDot} />
                  <View style={styles.navDot} />
                </View>
              </View>
              <TouchableOpacity style={styles.navButton} activeOpacity={0.7}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                    stroke={colors.primaryDark}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </BackgroundComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  backButton: {
    padding: spacing.xs,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Espace pour la navigation bottom
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  locationHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationLabel: {
    ...typography.caption,
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: spacing.xs / 2,
  },
  locationName: {
    ...typography.h1,
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 36,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  currentWeather: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperature: {
    ...typography.h1,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 42,
  },
  separator: {
    ...typography.h3,
    color: colors.text.secondary,
    marginHorizontal: spacing.md,
    fontSize: 20,
  },
  condition: {
    ...typography.h4,
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  mockBanner: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.4)',
  },
  mockBannerText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    ...Platform.select({
      android: {
        backgroundColor: colors.white,
      },
    }),
  },
  bottomNavContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl + 20,
  },
  bottomNavOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  navButton: {
    padding: spacing.sm,
    borderRadius: 20,
  },
  navButtonActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  navDots: {
    flexDirection: 'row',
    marginLeft: spacing.xs,
    gap: 3,
  },
  navDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.primaryDark,
    opacity: 0.9,
  },
});
