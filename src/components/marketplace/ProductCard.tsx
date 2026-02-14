/**
 * ProductCard - Carte produit pour la marketplace
 * Affiche le badge "Certifié par SeneGundo" si isCertified = true
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MarketplaceProduct } from '@models/Product';
import { colors, spacing, typography } from '@theme';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '@navigation/AppNavigator';

interface ProductCardProps {
  product: MarketplaceProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigation = useNavigation<AppNavigationProp>();

  const handlePress = () => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      {/* Image placeholder */}
      <View style={styles.imageContainer}>
        {product.images.length > 0 ? (
          <Image source={{ uri: product.images[0] }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📷</Text>
          </View>
        )}
        {product.isCertified && (
          <View style={styles.certifiedBadge}>
            <Text style={styles.certifiedText}>✓ Certifié SeneGundo</Text>
          </View>
        )}
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.productName}
        </Text>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>

        {/* Pack Élevage */}
        {product.livestockPack && (
          <View style={styles.packContainer}>
            <Text style={styles.packTitle}>Pack inclus :</Text>
            {product.livestockPack.includes.map((item, index) => (
              <Text key={index} style={styles.packItem}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        {/* Prix et stock */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            <Text style={styles.unit}>/{product.unit}</Text>
          </View>
          <Text
            style={[
              styles.stock,
              product.stockQuantity > 0 ? styles.stockAvailable : styles.stockOut,
            ]}
          >
            {product.stockQuantity > 0 ? `${product.stockQuantity} disponibles` : 'Rupture'}
          </Text>
        </View>

        {/* Localisation */}
        <Text style={styles.location}>📍 {product.location.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: colors.gray[100],
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[200],
  },
  imagePlaceholderText: {
    fontSize: 48,
  },
  certifiedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  certifiedText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
  },
  productName: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  description: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  packContainer: {
    backgroundColor: colors.gray[50],
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  packTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  packItem: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.h3,
    color: colors.primaryDark,
  },
  unit: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  stock: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  location: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  stockAvailable: {
    color: colors.success,
  },
  stockOut: {
    color: colors.error,
  },
});
