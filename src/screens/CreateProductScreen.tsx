import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { AuthTextField } from '@components/auth/AuthTextField';
import { OptionChips, MultiOptionChips } from '@components/marketplace/OptionChips';
import { Button } from '@components/common';
import { useAuth } from '@hooks/useAuth';
import { useMarketplace } from '@contexts/MarketplaceContext';
import { canSellOnMarketplace } from '@constants/marketplaceRoles';
import {
  CATEGORIES_BY_RAYON,
  MARKETPLACE_UNITS,
  DELIVERY_OPTION_LABELS,
} from '@constants/productCategories';
import { pickProductImageAsDataUri } from '@utils/imageBase64';
import type { MarketplaceRayon, ProductCategory, DeliveryOption } from '@models/Product';
import { colors, spacing, typography } from '@theme';

const RAYON_OPTIONS: { key: MarketplaceRayon; label: string }[] = [
  { key: 'INTRANTS_EQUIPEMENTS', label: 'Intrants' },
  { key: 'PRODUITS_FERME', label: 'Produits frais' },
  { key: 'ELEVAGE', label: 'Élevage' },
];

const DELIVERY_OPTIONS: DeliveryOption[] = [
  'click_and_collect',
  'delivery',
  'pickup',
];

export const CreateProductScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { user, userProfile, isAuthenticated } = useAuth();
  const { publishProduct } = useMarketplace();

  const [rayon, setRayon] = useState<MarketplaceRayon>('PRODUITS_FERME');
  const [category, setCategory] = useState<ProductCategory>('Légumes');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState<string>('kg');
  const [stockQuantity, setStockQuantity] = useState('');
  const [locationName, setLocationName] = useState('Bamako');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([
    'click_and_collect',
  ]);
  const [loading, setLoading] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);

  const categories = useMemo(() => CATEGORIES_BY_RAYON[rayon], [rayon]);

  useEffect(() => {
    if (!categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [rayon, categories, category]);

  useEffect(() => {
    if (!isAuthenticated || !canSellOnMarketplace(userProfile?.role)) {
      navigation.goBack();
    }
  }, [isAuthenticated, userProfile?.role, navigation]);

  const toggleDelivery = (opt: DeliveryOption) => {
    setDeliveryOptions((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  const handlePickImage = async () => {
    setPickingImage(true);
    try {
      const uri = await pickProductImageAsDataUri();
      setImageUri(uri);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur photo';
      if (msg !== 'Sélection annulée.') {
        Alert.alert('Photo', msg);
      }
    } finally {
      setPickingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !userProfile) {
      Alert.alert('Connexion requise', 'Connectez-vous pour publier un produit.');
      return;
    }
    if (!productName.trim()) {
      Alert.alert('Formulaire', 'Indiquez le nom du produit.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Formulaire', 'Ajoutez une description.');
      return;
    }
    const priceNum = Number(price.replace(/\s/g, ''));
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      Alert.alert('Formulaire', 'Indiquez un prix valide en FCFA.');
      return;
    }
    const stockNum = parseInt(stockQuantity.replace(/\s/g, ''), 10);
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      Alert.alert('Formulaire', 'Indiquez une quantité en stock.');
      return;
    }
    if (!imageUri) {
      Alert.alert('Formulaire', 'Ajoutez une photo du produit.');
      return;
    }
    if (deliveryOptions.length === 0) {
      Alert.alert('Formulaire', 'Choisissez au moins une option de livraison.');
      return;
    }

    setLoading(true);
    try {
      await publishProduct({
        farmerId: user.uid,
        farmerDisplayName: userProfile.displayName || 'Vendeur',
        productName,
        rayon,
        category,
        description,
        price: priceNum,
        unit,
        stockQuantity: stockNum,
        locationName,
        imageBase64: imageUri,
        deliveryOptions,
        isCertified: false,
      });
      Alert.alert('Produit publié', 'Votre annonce est visible sur le marché.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(
        'Publication',
        e instanceof Error ? e.message : 'Impossible de publier le produit.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
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
        <Text style={styles.headerTitle}>Nouveau produit</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.hint}>
            La photo est enregistrée en base64 (sans Firebase Storage). Choisissez une image
            légère pour un chargement rapide.
          </Text>

          <TouchableOpacity
            style={styles.photoBox}
            onPress={handlePickImage}
            disabled={pickingImage}
            activeOpacity={0.8}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={styles.photoLabel}>
                  {pickingImage ? 'Traitement…' : 'Ajouter une photo'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <OptionChips
            label="Rayon"
            options={RAYON_OPTIONS.map((r) => r.key)}
            value={rayon}
            onChange={setRayon}
            getLabel={(k) => RAYON_OPTIONS.find((r) => r.key === k)?.label ?? k}
          />

          <OptionChips
            label="Catégorie *"
            options={categories}
            value={category}
            onChange={setCategory}
          />

          <AuthTextField
            label="Nom du produit *"
            value={productName}
            onChangeText={setProductName}
            placeholder="Ex. Tomates bio"
          />
          <AuthTextField
            label="Description *"
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez votre produit…"
            multiline
            style={styles.textArea}
          />
          <AuthTextField
            label="Prix (FCFA) *"
            value={price}
            onChangeText={setPrice}
            placeholder="1500"
            keyboardType="numeric"
          />

          <OptionChips
            label="Unité"
            options={MARKETPLACE_UNITS as unknown as readonly string[]}
            value={unit}
            onChange={setUnit}
          />

          <AuthTextField
            label="Stock disponible *"
            value={stockQuantity}
            onChangeText={setStockQuantity}
            placeholder="10"
            keyboardType="number-pad"
          />
          <AuthTextField
            label="Lieu / ville"
            value={locationName}
            onChangeText={setLocationName}
            placeholder="Bamako"
          />

          <MultiOptionChips
            label="Options de livraison *"
            options={DELIVERY_OPTIONS}
            values={deliveryOptions}
            onToggle={toggleDelivery}
            getLabel={(k) => DELIVERY_OPTION_LABELS[k]}
          />

          <Button
            title="Mettre en vente"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backBtn: { padding: spacing.xs, marginRight: spacing.sm },
  headerTitle: { ...typography.h4, color: colors.text.primary, flex: 1 },
  headerSpacer: { width: 40 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  photoBox: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: colors.gray[100],
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIcon: { fontSize: 40, marginBottom: spacing.sm },
  photoLabel: { ...typography.body, color: colors.text.secondary },
  textArea: { minHeight: 88, textAlignVertical: 'top' },
});
