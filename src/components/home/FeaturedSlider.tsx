/**
 * FeaturedSlider - Slider horizontal "À la une"
 * Affiche les contenus mis en avant (récoltes, investissements, etc.)
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { colors, spacing, typography } from '@theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;

interface FeaturedItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: any; // require() retourne un number en React Native
  emoji?: string;
  onPress?: () => void;
}

// Utilisation des vraies images du projet
// Note: Les chemins sont relatifs depuis src/components/home/ vers assets/image/
// Metro bundler résout mieux les require() directement dans le composant
const MOCK_FEATURED: FeaturedItem[] = [
  {
    id: '1',
    title: 'Marché local',
    subtitle: 'Produits frais de qualité',
    // @ts-ignore - require() pour les images locales
    image: require('../../../assets/image/IMG_9707.jpg'),
  },
  {
    id: '2',
    title: 'Récolte de tomates',
    subtitle: 'Certifiée SeneGundo',
    // @ts-ignore
    image: require('../../../assets/image/IMG_9708.jpg'),
  },
  {
    id: '3',
    title: 'Diaspora investissant',
    subtitle: 'Dans l\'agriculture malienne',
    // @ts-ignore
    image: require('../../../assets/image/IMG_9709.jpg'),
  },
  {
    id: '4',
    title: 'Produits de la ferme',
    subtitle: 'Directement des producteurs',
    // @ts-ignore
    image: require('../../../assets/image/IMG_9710.jpg'),
  },
  {
    id: '5',
    title: 'Innovation agricole',
    subtitle: 'Technologie au service des récoltes',
    // @ts-ignore
    image: require('../../../assets/image/IMG_9711.PNG'),
  },
  {
    id: '6',
    title: 'Communauté agricole',
    subtitle: 'Ensemble pour réussir',
    // @ts-ignore
    image: require('../../../assets/image/IMG_9712.PNG'),
  },
];

export const FeaturedSlider: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / CARD_WIDTH);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>À la Une</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {MOCK_FEATURED.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, { width: CARD_WIDTH }]}
            activeOpacity={0.9}
            onPress={item.onPress}
          >
            <View style={styles.cardContent}>
              {item.image ? (
                <Image source={item.image} style={styles.cardImage} />
              ) : item.emoji ? (
                <View style={styles.cardPlaceholder}>
                  <Text style={styles.cardEmoji}>{item.emoji}</Text>
                </View>
              ) : null}
              <View style={styles.cardOverlay}>
                <View style={styles.cardOverlayGradient} />
                <View style={styles.cardOverlayContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Indicateurs de pagination */}
      <View style={styles.indicators}>
        {MOCK_FEATURED.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentIndex && styles.indicatorActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  scrollView: {
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  card: {
    marginRight: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.gray[200],
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 64,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardOverlayGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardOverlayContent: {
    position: 'relative',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.9,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
});
