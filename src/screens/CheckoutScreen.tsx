/**
 * CheckoutScreen - Processus de commande et paiement
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { useCart } from '@contexts/CartContext';
import { useMarketplace } from '@contexts/MarketplaceContext';
import { useAuth } from '@hooks/useAuth';
import { colors, spacing, typography } from '@theme';
import { Button } from '@components/common';

type PaymentMethod = 'mobile_money' | 'bank_transfer' | 'cash_on_delivery';

export const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { items, totalAmount, clearCart } = useCart();
  const { placeOrder } = useMarketplace();
  const { isAuthenticated } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('mobile_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      Alert.alert('Connexion requise', 'Connectez-vous pour valider votre commande.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => navigation.navigate('AuthLogin') },
      ]);
      return;
    }
    if (items.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des produits avant de commander.');
      return;
    }
    if (selectedPayment === 'mobile_money' && !phoneNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
      return;
    }
    if (!deliveryAddress.trim()) {
      Alert.alert('Erreur', 'Indiquez une adresse de livraison.');
      return;
    }

    setIsProcessing(true);
    try {
      await placeOrder({
        items,
        totalAmount,
        paymentMethod: selectedPayment,
        deliveryAddress: deliveryAddress.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
      });
      Alert.alert(
        'Commande confirmée',
        'Votre commande a été enregistrée. Retrouvez-la dans Profil → Mes achats Marché.',
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              navigation.navigate('MainTabs', { screen: 'Home' });
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert(
        'Commande',
        e instanceof Error ? e.message : 'Impossible d’enregistrer la commande.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
        <Text style={styles.headerTitle}>Commande</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Récapitulatif des articles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articles ({items.length})</Text>
          {items.map((item) => (
            <View key={item.product.id} style={styles.orderItem}>
              <Text style={styles.orderItemName}>{item.product.productName}</Text>
              <Text style={styles.orderItemQuantity}>
                {item.quantity} × {formatPrice(item.product.price)}
              </Text>
            </View>
          ))}
        </View>

        {/* Adresse de livraison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          <TextInput
            style={styles.input}
            placeholder="Adresse complète"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Méthode de paiement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Méthode de paiement</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === 'mobile_money' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPayment('mobile_money')}
          >
            <View style={styles.paymentOptionContent}>
              <Text style={styles.paymentOptionIcon}>📱</Text>
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionTitle}>Mobile Money</Text>
                <Text style={styles.paymentOptionSubtitle}>Orange Money, Moov Money</Text>
              </View>
            </View>
            {selectedPayment === 'mobile_money' && (
              <View style={styles.radioSelected} />
            )}
          </TouchableOpacity>

          {selectedPayment === 'mobile_money' && (
            <TextInput
              style={styles.input}
              placeholder="Numéro de téléphone (ex: +223 70 12 34 56)"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          )}

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === 'bank_transfer' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPayment('bank_transfer')}
          >
            <View style={styles.paymentOptionContent}>
              <Text style={styles.paymentOptionIcon}>🏦</Text>
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionTitle}>Paiement par carte </Text>
                <Text style={styles.paymentOptionSubtitle}>Banque de l'Habitat, UBA ...</Text>
              </View>
            </View>
            {selectedPayment === 'bank_transfer' && <View style={styles.radioSelected} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === 'cash_on_delivery' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPayment('cash_on_delivery')}
          >
            <View style={styles.paymentOptionContent}>
              <Text style={styles.paymentOptionIcon}>💵</Text>
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionTitle}>Paiement à la livraison</Text>
                <Text style={styles.paymentOptionSubtitle}>Espèces uniquement</Text>
              </View>
            </View>
            {selectedPayment === 'cash_on_delivery' && <View style={styles.radioSelected} />}
          </TouchableOpacity>
        </View>

        {/* Récapitulatif total */}
        <View style={styles.section}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total</Text>
            <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Livraison</Text>
            <Text style={styles.totalValue}>Gratuite</Text>
          </View>
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text style={styles.totalLabelFinal}>Total</Text>
            <Text style={styles.totalValueFinal}>{formatPrice(totalAmount)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer avec bouton de commande */}
      <View style={styles.footer}>
        <Button
          title={isProcessing ? 'Traitement...' : 'Confirmer la commande'}
          onPress={handlePlaceOrder}
          variant="primary"
          fullWidth
          disabled={isProcessing}
          loading={isProcessing}
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
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[200],
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  orderItemName: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  orderItemQuantity: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.white,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.gray[200],
    marginBottom: spacing.sm,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentOptionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  paymentOptionText: {
    flex: 1,
  },
  paymentOptionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  paymentOptionSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.white,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  totalRowFinal: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  totalLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  totalValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  totalLabelFinal: {
    ...typography.h4,
    color: colors.text.primary,
  },
  totalValueFinal: {
    ...typography.h3,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
});
