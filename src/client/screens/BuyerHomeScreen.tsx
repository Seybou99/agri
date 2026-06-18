/**
 * Accueil client — hero fixe + contenu scrollable (évite le scroll imbriqué qui « revient »).
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { BuyerTabParamList } from '@client/navigation/BuyerTabNavigator';
import { useClientTheme } from '@client/theme/useClientTheme';
import { CategoryGrid } from '@client/components/CategoryGrid';
import { HomeWaveDivider } from '@client/components/HomeWaveDivider';
import { BrandCarousel } from '@client/components/BrandCarousel';
import { PromoBanner } from '@client/components/PromoBanner';
import type { HomeCategory } from '@client/constants/homeCategories';
import { getBuyerTabBarTotalHeight } from '@client/constants/layout';
import { spacing } from '@theme';

export const BuyerHomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const t = useClientTheme();
  const tabNav = useNavigation<BottomTabNavigationProp<BuyerTabParamList>>();

  const onCategoryPress = useCallback(
    (category: HomeCategory) => {
      tabNav.navigate('Explorer', category.rayon ? { initialRayon: category.rayon } : undefined);
    },
    [tabNav]
  );

  return (
    <View style={[styles.root, { backgroundColor: t.screen }]}>
      <StatusBar barStyle={t.isDark ? 'light-content' : 'dark-content'} />

      {/* Hero fixe — ne bouge plus au scroll du carrousel */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.xs, backgroundColor: t.hero }]}>
        <TouchableOpacity
          style={[styles.locationPill, { backgroundColor: t.locationPill }]}
          activeOpacity={0.85}
        >
          <Ionicons name="business-outline" size={18} color={t.locationPillText} />
          <Text style={[styles.locationText, { color: t.locationPillText }]}>Appartement</Text>
          <Ionicons name="chevron-down" size={16} color={t.locationPillText} />
        </TouchableOpacity>

        <View style={styles.categoryWrap}>
          <CategoryGrid onCategoryPress={onCategoryPress} />
        </View>
        <HomeWaveDivider
          topColor={t.hero}
          bottomColor={t.screen}
          shadowWaveColor={t.heroWaveShadow}
        />
      </View>

      {/* Contenu scrollable */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: getBuyerTabBarTotalHeight(insets.bottom) + spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>SeneGundo, c&apos;est pour vous</Text>
          <TouchableOpacity hitSlop={12} accessibilityLabel="Informations">
            <Ionicons name="information-circle-outline" size={24} color={t.textSecondary} />
          </TouchableOpacity>
        </View>

        <BrandCarousel theme={t} onBrandPress={() => tabNav.navigate('Explorer')} />

        <View style={styles.promoWrap}>
          <PromoBanner theme={t} onPress={() => tabNav.navigate('Explorer')} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hero: {
    zIndex: 2,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: 28,
    marginBottom: spacing.sm,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryWrap: {
    paddingTop: 48,
  },
  scroll: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.3,
  },
  promoWrap: {
    paddingHorizontal: spacing.lg,
  },
});
