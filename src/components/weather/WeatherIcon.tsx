/**
 * WeatherIcon - Composant pour afficher les icônes météo en style 3D moderne
 * Utilise des emojis stylisés pour correspondre à la maquette
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface WeatherIconProps {
  icon: string; // Code icône OpenWeather (ex: '01d', '02d', '10d')
  size?: number; // Taille de l'icône
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ icon, size = 80 }) => {
  const getIconEmoji = (iconCode: string): string => {
    // Mapping des codes OpenWeather vers des emojis 3D modernes
    if (iconCode.includes('01d')) return '☀️'; // Soleil
    if (iconCode.includes('01n')) return '🌙'; // Lune
    if (iconCode.includes('02d')) return '⛅'; // Partiellement nuageux (soleil + nuage)
    if (iconCode.includes('02n')) return '☁️'; // Nuageux la nuit
    if (iconCode.includes('03') || iconCode.includes('04')) return '☁️'; // Nuageux
    if (iconCode.includes('09') || iconCode.includes('10')) return '🌧️'; // Pluie
    if (iconCode.includes('11')) return '⛈️'; // Orage
    if (iconCode.includes('13')) return '❄️'; // Neige
    if (iconCode.includes('50')) return '🌫️'; // Brouillard
    return '☁️'; // Par défaut
  };

  return (
    <Text style={[styles.icon, { fontSize: size }]}>
      {getIconEmoji(icon)}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});
