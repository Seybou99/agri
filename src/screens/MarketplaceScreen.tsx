/**
 * MarketplaceScreen - Marché SeneGundo
 * 
 * Trois rayons distincts :
 * 1. Intrants & Équipements (B2B)
 * 2. Produits de la Ferme (B2C)
 * 3. Élevage (Investissement)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { MarketplaceProduct, MarketplaceRayon } from '@models/Product';
import { colors, spacing, typography } from '@theme';
import { ProductList } from '../components/marketplace/ProductList';
import type { TabParamList } from '@navigation/TabNavigator';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { useCart } from '@contexts/CartContext';

const RAYONS: { key: MarketplaceRayon; label: string; icon: string }[] = [
  { key: 'INTRANTS_EQUIPEMENTS', label: 'Intrants & Équipements', icon: '🌱' },
  { key: 'PRODUITS_FERME', label: 'Produits Frais', icon: '🥬' },
  { key: 'ELEVAGE', label: 'Bétail & Élevage', icon: '🐄' },
];

// Données mock pour le développement
const MOCK_PRODUCTS: MarketplaceProduct[] = [
  // Rayon Intrants
  {
    id: '1',
    farmerId: 'farmer1',
    productName: 'Semences de tomate certifiées',
    rayon: 'INTRANTS_EQUIPEMENTS',
    category: 'Semences',
    description: 'Semences de tomate certifiées, variété résistante aux maladies',
    price: 5000,
    unit: 'sachet',
    stockQuantity: 50,
    location: {
      geopoint: { latitude: 12.65, longitude: -7.99 },
      name: 'Bamako',
    },
    images: [],
    deliveryOptions: ['click_and_collect', 'delivery'],
    isCertified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    farmerId: 'farmer2',
    productName: 'Kit irrigation goutte-à-goutte',
    rayon: 'INTRANTS_EQUIPEMENTS',
    category: 'Irrigation',
    description: 'Kit complet pour irrigation goutte-à-goutte, 100m de tuyau',
    price: 25000,
    unit: 'kit',
    stockQuantity: 20,
    location: {
      geopoint: { latitude: 12.65, longitude: -7.99 },
      name: 'Bamako',
    },
    images: [],
    deliveryOptions: ['click_and_collect'],
    isCertified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Rayon Produits Frais
  {
    id: '3',
    farmerId: 'farmer3',
    productName: 'Tomates fraîches',
    rayon: 'PRODUITS_FERME',
    category: 'Légumes',
    description: 'Tomates fraîches récoltées ce matin, certifiées SeneGundo',
    price: 1500,
    unit: 'kg',
    stockQuantity: 100,
    location: {
      geopoint: { latitude: 12.65, longitude: -7.99 },
      name: 'Bamako',
    },
    images: [],
    deliveryOptions: ['click_and_collect', 'delivery'],
    isCertified: true,
    diagnosticId: 'diag_123',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    farmerId: 'farmer4',
    productName: 'Riz local',
    rayon: 'PRODUITS_FERME',
    category: 'Céréales',
    description: 'Riz local de qualité supérieure, sac de 50kg',
    price: 15000,
    unit: 'sac',
    stockQuantity: 30,
    location: {
      geopoint: { latitude: 12.65, longitude: -7.99 },
      name: 'Bamako',
    },
    images: [],
    deliveryOptions: ['click_and_collect'],
    isCertified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Rayon Élevage
  {
    id: '5',
    farmerId: 'farmer5',
    productName: 'Bœuf d\'embouche',
    rayon: 'ELEVAGE',
    category: 'Bovins',
    description: 'Bœuf d\'embouche avec suivi vétérinaire inclus',
    price: 250000,
    unit: 'tête',
    stockQuantity: 5,
    location: {
      geopoint: { latitude: 12.65, longitude: -7.99 },
      name: 'Bamako',
    },
    images: [],
    deliveryOptions: ['pickup'],
    isCertified: false,
    livestockPack: {
      includes: ['Achat', 'Suivi vétérinaire', 'Assurance'],
      veterinaryFollowUp: true,
      insurance: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

type MarketplaceRouteProp = RouteProp<TabParamList, 'Marketplace'>;

export const MarketplaceScreen: React.FC = () => {
  const route = useRoute<MarketplaceRouteProp>();
  const navigation = useNavigation<AppNavigationProp>();
  const { totalItems } = useCart();
  const filterCategory = route.params?.filterCategory;
  const filterCrop = route.params?.filterCrop;

  // Si un filtre est passé, sélectionner automatiquement le rayon Intrants
  const [selectedRayon, setSelectedRayon] = useState<MarketplaceRayon>(
    filterCategory === 'Semences' ? 'INTRANTS_EQUIPEMENTS' : 'INTRANTS_EQUIPEMENTS'
  );

  useEffect(() => {
    if (filterCategory === 'Semences') {
      setSelectedRayon('INTRANTS_EQUIPEMENTS');
    }
  }, [filterCategory]);

  let filteredProducts = MOCK_PRODUCTS.filter((p) => p.rayon === selectedRayon);

  // Appliquer le filtre de catégorie si présent
  if (filterCategory) {
    filteredProducts = filteredProducts.filter((p) => p.category === filterCategory);
  }

  // Appliquer le filtre de culture si présent (pour les semences)
  if (filterCrop && filterCategory === 'Semences') {
    // Filtrer les produits dont le nom contient la culture
    filteredProducts = filteredProducts.filter((p) =>
      p.productName.toLowerCase().includes(filterCrop.toLowerCase())
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Marché SeneGundo</Text>
            <Text style={styles.subtitle}>Tout pour réussir votre production</Text>
          </View>
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
                <Text style={styles.cartBadgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Onglets des rayons */}
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

      {/* Liste des produits du rayon sélectionné */}
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
  title: {
    ...typography.h2,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  cartButton: {
    position: 'relative',
    padding: spacing.sm,
    marginTop: spacing.xs,
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
