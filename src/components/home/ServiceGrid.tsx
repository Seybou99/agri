/**
 * ServiceGrid - Grille de services (Diagnostic, Boutique, Élevage, Académie)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors, spacing, typography } from '@theme';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { useAuth } from '@hooks/useAuth';

interface ServiceCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
  isLarge?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  icon,
  color,
  onPress,
  isLarge = false,
}) => (
  <TouchableOpacity
    style={[styles.serviceCard, { backgroundColor: color }, isLarge && styles.largeCard]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.iconContainer}>{icon}</View>
    <Text style={styles.serviceTitle}>{title}</Text>
  </TouchableOpacity>
);

interface ServiceGridProps {
  onWeatherPress?: (location: { lat: number; lng: number; name: string }) => void;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ onWeatherPress }) => {
  const navigation = useNavigation<AppNavigationProp>();
  const { userProfile } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string }>({
    lat: 12.65,
    lng: -7.99,
    name: 'Bamako',
  });

  useEffect(() => {
    const getLocation = async () => {
      // Priorité 1: Localisation de l'utilisateur
      if (userProfile?.location) {
        setLocation({
          lat: userProfile.location.lat,
          lng: userProfile.location.lng,
          name: 'Votre zone',
        });
        return;
      }

      // Priorité 2: Position actuelle
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
  }, [userProfile]);

  const handleWeatherPress = () => {
    onWeatherPress?.(location);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Mon Tableau de Bord</Text>
        <Text style={styles.sectionSubtitle}>à partir de 5 000 FCFA</Text>
      </View>

      <View style={styles.grid}>
        {/* Ligne 1 - Grandes cartes */}
        <View style={styles.row}>
          <ServiceCard
            title="Diagnostic"
            color={colors.primaryLight}
            onPress={() => navigation.navigate('DiagnosticMap')}
            isLarge
            icon={
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="3" width="7" height="7" stroke={colors.primaryDark} strokeWidth="2" />
                <Rect x="14" y="3" width="7" height="7" stroke={colors.primaryDark} strokeWidth="2" />
                <Path
                  d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5"
                  stroke={colors.primaryDark}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </Svg>
            }
          />
          <ServiceCard
            title="Météo du jour"
            color={colors.primaryDark}
            onPress={handleWeatherPress}
            isLarge
            icon={
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="5" stroke={colors.white} strokeWidth="2" />
                <Path
                  d="M12 2v2M12 20v2M22 12h-2M4 12H2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93"
                  stroke={colors.white}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </Svg>
            }
          />
        </View>

        {/* Ligne 2 - Petites cartes */}
        <View style={styles.row}>
          <ServiceCard
            title="Boutique"
            color={colors.primaryDark}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Marketplace' })}
            icon={
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0"
                  stroke={colors.white}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            }
          />
          <ServiceCard
            title="Élevage"
            color={colors.secondary}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Marketplace' })}
            icon={
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  stroke={colors.white}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle cx="12" cy="9" r="2.5" fill={colors.white} />
              </Svg>
            }
          />
          <ServiceCard
            title="Académie"
            color={colors.primaryDark}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Academy' })}
            icon={
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V6a2 2 0 012-2h14a2 2 0 012 2v11a2.5 2.5 0 01-2.5 2.5H4z"
                  stroke={colors.white}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M9 9h6M9 13h6"
                  stroke={colors.white}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </Svg>
            }
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  header: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  grid: {
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  serviceCard: {
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flex: 1,
    height: 110, // Hauteur fixe pour homogénéité
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  largeCard: {
    height: 110, // Même hauteur que les petites cartes pour homogénéité
  },
  iconContainer: {
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
