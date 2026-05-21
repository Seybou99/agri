/**
 * MarketplaceScreen - Marché SeneGundo
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { MarketplaceRayon } from '@models/Product';
import { colors, spacing, typography } from '@theme';
import { ProductList } from '../components/marketplace/ProductList';
import type { TabParamList } from '@navigation/TabNavigator';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { useCart } from '@contexts/CartContext';
import { useMarketplace } from '@contexts/MarketplaceContext';
import { useAuth } from '@hooks/useAuth';
import { canSellOnMarketplace } from '@constants/marketplaceRoles';

const RAYONS: { key: MarketplaceRayon; label: string; icon: string }[] = [
  { key: 'INTRANTS_EQUIPEMENTS', label: 'Intrants & Équipements', icon: '🌱' },
  { key: 'PRODUITS_FERME', label: 'Produits Frais', icon: '🥬' },
  { key: 'ELEVAGE', label: 'Bétail & Élevage', icon: '🐄' },
];

type MarketplaceRouteProp = RouteProp<TabParamList, 'Marketplace'>;

export const MarketplaceScreen: React.FC = () => {
  const route = useRoute<MarketplaceRouteProp>();
  const navigation = useNavigation<AppNavigationProp>();
  const { totalItems } = useCart();
  const { products } = useMarketplace();
  const { userProfile, isAuthenticated } = useAuth();
  const filterCategory = route.params?.filterCategory;
  const filterCrop = route.params?.filterCrop;

  const canAddProduct =
    isAuthenticated && canSellOnMarketplace(userProfile?.role);

  const [selectedRayon, setSelectedRayon] = useState<MarketplaceRayon>(
    filterCategory === 'Semences' ? 'INTRANTS_EQUIPEMENTS' : 'INTRANTS_EQUIPEMENTS'
  );

  useEffect(() => {
    if (filterCategory === 'Semences') {
      setSelectedRayon('INTRANTS_EQUIPEMENTS');
    }
  }, [filterCategory]);

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.rayon === selectedRayon);
    if (filterCategory) {
      list = list.filter((p) => p.category === filterCategory);
    }
    if (filterCrop && filterCategory === 'Semences') {
      list = list.filter((p) =>
        p.productName.toLowerCase().includes(filterCrop.toLowerCase())
      );
    }
    return list;
  }, [products, selectedRayon, filterCategory, filterCrop]);

  const handleAddProduct = () => {
    if (!isAuthenticated) {
      Alert.alert('Connexion requise', 'Connectez-vous pour publier un produit.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => navigation.navigate('AuthLogin') },
      ]);
      return;
    }
    if (!canSellOnMarketplace(userProfile?.role)) {
      Alert.alert(
        'Accès réservé',
        'Seuls les agriculteurs et administrateurs peuvent mettre des produits en vente.'
      );
      return;
    }
    navigation.navigate('CreateProduct');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Marché SeneGundo</Text>
            <Text style={styles.subtitle}>Tout pour réussir votre production</Text>
          </View>
          <View style={styles.headerActions}>
            {canAddProduct && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddProduct}
                activeOpacity={0.7}
                accessibilityLabel="Ajouter un produit"
              >
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 5v14M5 12h14"
                    stroke={colors.white}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => navigation.navigate('Cart')}
              activeOpacity={0.7}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0"
                  stroke={colors.text.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {totalItems > 99 ? '99+' : totalItems}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {RAYONS.map((rayon) => {
            const isActive = selectedRayon === rayon.key;
            return (
              <TouchableOpacity
                key={rayon.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setSelectedRayon(rayon.key)}
              >
                <Text style={styles.tabIcon}>{rayon.icon}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {rayon.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ProductList products={filteredProducts} rayon={selectedRayon} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitles: { flex: 1, paddingRight: spacing.sm },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  tabsContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tabsContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  tabActive: {
    backgroundColor: colors.primaryLight,
  },
  tabIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  tabLabel: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
});
