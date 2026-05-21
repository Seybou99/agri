/**
 * ProductDetailScreen - Détail d'un produit
 * Affiche toutes les informations, badge "Certifié SeneGundo", pack élevage si applicable
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import Svg, { Path } from 'react-native-svg';
import { DELIVERY_OPTION_LABELS } from '@constants/productCategories';
import type { DeliveryOption } from '@models/Product';
import { colors, spacing, typography } from '@theme';
import { Button } from '@components/common';
import { useCart } from '@contexts/CartContext';
import { useMarketplace } from '@contexts/MarketplaceContext';
import { triggerHaptic } from '@utils/haptics';

type ProductDetailRouteProp = RouteProp<{ ProductDetail: { productId: string } }, 'ProductDetail'>;

export const ProductDetailScreen: React.FC = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<AppNavigationProp>();
  const { productId } = route.params;
  const { addToCart } = useCart();
  const { getProductById } = useMarketplace();

  const product = getProductById(productId);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Produit non trouvé</Text>
          <Button title="Retour" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke={colors.text.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail du produit</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image */}
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
              <Text style={styles.certifiedText}>✓ Certifié par SeneGundo</Text>
            </View>
          )}
        </View>

        {/* Contenu */}
        <View style={styles.content}>
          <Text style={styles.productName}>{product.productName}</Text>
          <Text style={styles.category}>{product.category}</Text>

          {/* Prix */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            <Text style={styles.unit}>/{product.unit}</Text>
          </View>

          {/* Stock */}
          <View style={styles.stockContainer}>
            <Text
              style={[
                styles.stock,
                product.stockQuantity > 0 ? styles.stockAvailable : styles.stockOut,
              ]}
            >
              {product.stockQuantity > 0
                ? `${product.stockQuantity} disponibles`
                : 'Rupture de stock'}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Pack Élevage */}
          {product.livestockPack && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pack inclus</Text>
              <View style={styles.packContainer}>
                {product.livestockPack.includes.map((item, index) => (
                  <View key={index} style={styles.packItem}>
                    <Text style={styles.packIcon}>✓</Text>
                    <Text style={styles.packText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Localisation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localisation</Text>
            <Text style={styles.location}>📍 {product.location.name}</Text>
            {product.location.address && (
              <Text style={styles.address}>{product.location.address}</Text>
            )}
          </View>

          {/* Options de livraison */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Options de livraison</Text>
            {product.deliveryOptions.map((option, index) => (
              <Text key={index} style={styles.deliveryOption}>
                • {DELIVERY_OPTION_LABELS[option as DeliveryOption] ?? option}
              </Text>
            ))}
          </View>

          {/* Certifié SeneGundo - Détails */}
          {product.isCertified && product.diagnosticId && (
            <View style={styles.certifiedSection}>
              <Text style={styles.certifiedSectionTitle}>✓ Certifié par SeneGundo</Text>
              <Text style={styles.certifiedSectionText}>
                Ce produit provient d'un terrain certifié par notre diagnostic. La qualité et la
                traçabilité sont garanties.
              </Text>
              <TouchableOpacity
                style={styles.viewDiagnosticButton}
                onPress={() => {
                  // Naviguer vers le diagnostic associé
                  navigation.navigate('FieldReport', { parcelId: product.diagnosticId });
                }}
              >
                <Text style={styles.viewDiagnosticText}>Voir le diagnostic</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bouton d'action fixe */}
      <View style={styles.footer}>
        <Button
          title={product.stockQuantity > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
          onPress={() => {
            if (product.stockQuantity > 0) {
              triggerHaptic();
              addToCart(product, 1);
              // Afficher une confirmation
              Alert.alert('Produit ajouté', 'Le produit a été ajouté à votre panier', [
                { text: 'Continuer', style: 'cancel' },
                {
                  text: 'Voir le panier',
                  onPress: () => navigation.navigate('Cart'),
                },
              ]);
            }
          }}
          disabled={product.stockQuantity === 0}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text.primary,
    flex: 1,
  },
  headerSpacer: {
    width: 40, // Équilibre avec le bouton retour
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
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
    fontSize: 64,
  },
  certifiedBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  certifiedText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
  },
  productName: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.bodySmall,
    color: colors.primary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  price: {
    ...typography.h1,
    color: colors.primaryDark,
  },
  unit: {
    ...typography.body,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  stockContainer: {
    marginBottom: spacing.lg,
  },
  stock: {
    ...typography.body,
    fontWeight: '600',
  },
  stockAvailable: {
    color: colors.success,
  },
  stockOut: {
    color: colors.error,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  packContainer: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
  },
  packItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  packIcon: {
    ...typography.body,
    color: colors.success,
    marginRight: spacing.sm,
    fontWeight: 'bold',
  },
  packText: {
    ...typography.body,
    color: colors.text.primary,
  },
  location: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  address: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  deliveryOption: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  certifiedSection: {
    backgroundColor: colors.primaryLight + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  certifiedSectionTitle: {
    ...typography.h4,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  certifiedSectionText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  viewDiagnosticButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  viewDiagnosticText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.h3,
    color: colors.error,
    marginBottom: spacing.lg,
  },
});
