/**
 * ProductList - Liste des produits par rayon
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MarketplaceProduct, MarketplaceRayon } from '@models/Product';
import { colors, spacing, typography } from '@theme';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  products: MarketplaceProduct[];
  rayon: MarketplaceRayon;
}

export const ProductList: React.FC<ProductListProps> = ({ products, rayon }) => {
  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyText}>Aucun produit disponible dans ce rayon</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ProductCard product={item} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
