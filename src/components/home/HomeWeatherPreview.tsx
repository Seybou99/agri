/**
 * Aperçu météo compact pour l’accueil (carte blanche, une ligne).
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { colors, spacing, typography } from '@theme';
import { fetchCurrentWeather } from '@services/weather/openWeatherService';
import { useAuth } from '@hooks/useAuth';

interface HomeWeatherPreviewProps {
  onPress?: (location: { lat: number; lng: number; name: string }) => void;
}

export const HomeWeatherPreview: React.FC<HomeWeatherPreviewProps> = ({ onPress }) => {
  const { userProfile } = useAuth();
  const [location, setLocation] = useState({ lat: 12.6392, lng: -8.0029, name: 'Bamako' });
  const [temp, setTemp] = useState<number | null>(null);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let loc = { lat: 12.6392, lng: -8.0029, name: 'Bamako' };
      if (userProfile?.location) {
        loc = {
          lat: userProfile.location.lat,
          lng: userProfile.location.lng,
          name: 'Votre zone',
        };
      } else {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const pos = await Location.getCurrentPositionAsync({});
            loc = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              name: 'Position actuelle',
            };
          }
        } catch {
          /* garde Bamako */
        }
      }
      if (cancelled) return;
      setLocation(loc);
      setLoading(true);
      const w = await fetchCurrentWeather(loc.lat, loc.lng);
      if (cancelled) return;
      if (w) {
        setTemp(Math.round(w.temp));
        setDescription(w.description);
      } else {
        setTemp(null);
        setDescription('Indisponible');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userProfile?.location?.lat, userProfile?.location?.lng]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(location)}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <Text style={styles.emoji}>⛅</Text>
      <View style={styles.body}>
        <Text style={styles.label}>Météo du jour</Text>
        <Text style={styles.place} numberOfLines={1}>
          {location.name.split(',')[0]}
          {description ? ` · ${description}` : ''}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Text style={styles.temp}>{temp != null ? `${temp}°C` : '—'}</Text>
      )}
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  body: {
    flex: 1,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  place: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  temp: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  chevron: {
    fontSize: 22,
    color: colors.text.secondary,
    fontWeight: '300',
  },
});
