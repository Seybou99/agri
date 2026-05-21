import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { Button } from '@components/common';
import { useAcademy, resolveAcademyGuide } from '@contexts/AcademyContext';
import { useAuth } from '@hooks/useAuth';
import {
  ACADEMY_DOMAIN_LABELS,
  ACADEMY_FILE_TYPE_LABELS,
  ACADEMY_FILE_TYPE_ICONS,
} from '@constants/academy';
import { openAcademyDocument } from '@utils/documentBase64';
import type { AcademyGuide } from '@models/AcademyGuide';
import { colors, spacing, typography } from '@theme';

type Route = RouteProp<{ AcademyGuideDetail: { guideId: string } }, 'AcademyGuideDetail'>;

export const AcademyGuideDetailScreen: React.FC = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<AppNavigationProp>();
  const { guideId } = route.params;
  const { getGuideById, canAccessGuide, purchaseGuide, loadGuideContent } = useAcademy();
  const { isAuthenticated } = useAuth();

  const [guide, setGuide] = useState<AcademyGuide | undefined>(getGuideById(guideId));
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let g = getGuideById(guideId);
      if (!g) {
        g = (await resolveAcademyGuide(guideId)) ?? undefined;
      }
      if (!cancelled && g) {
        setGuide(g);
        const access = await canAccessGuide(g.id, g.isFree);
        if (!cancelled) {
          setHasAccess(access);
          setChecking(false);
        }
      } else if (!cancelled) {
        setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [guideId, getGuideById, canAccessGuide]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);

  const handlePurchase = async () => {
    if (!guide) return;
    if (!isAuthenticated) {
      Alert.alert('Connexion requise', 'Connectez-vous pour acheter ce guide.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => navigation.navigate('AuthLogin') },
      ]);
      return;
    }
    Alert.alert(
      'Confirmer l’achat',
      `Acheter « ${guide.title} » pour ${formatPrice(guide.price)} ?\n(Paiement simulé — Mobile Money à intégrer)`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setPurchasing(true);
            try {
              await purchaseGuide(guide);
              setHasAccess(true);
              Alert.alert(
                'Achat confirmé',
                'Vous pouvez ouvrir le guide ci-dessous ou depuis votre profil.'
              );
            } catch (e) {
              Alert.alert('Achat', e instanceof Error ? e.message : 'Erreur');
            } finally {
              setPurchasing(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenFile = async () => {
    if (!guide) return;
    setLoadingFile(true);
    try {
      const content = await loadGuideContent(guide.id);
      if (!content?.fileBase64) {
        throw new Error('Fichier introuvable.');
      }
      await openAcademyDocument(content.fileBase64, content.fileName);
    } catch (e) {
      Alert.alert('Ouverture', e instanceof Error ? e.message : 'Impossible d’ouvrir le fichier.');
    } finally {
      setLoadingFile(false);
    }
  };

  if (!guide && !checking) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Guide introuvable</Text>
        <Button title="Retour" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  if (!guide) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke={colors.text.primary}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Détail du guide
        </Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.typeBox}>
          <Text style={styles.typeIcon}>{ACADEMY_FILE_TYPE_ICONS[guide.fileType]}</Text>
          <Text style={styles.typeLabel}>
            {ACADEMY_FILE_TYPE_LABELS[guide.fileType]} · {guide.fileName}
          </Text>
        </View>

        <Text style={styles.title}>{guide.title}</Text>
        <Text style={styles.domain}>{ACADEMY_DOMAIN_LABELS[guide.domain]}</Text>

        {guide.isFree ? (
          <Text style={styles.priceFree}>Gratuit</Text>
        ) : (
          <Text style={styles.price}>{formatPrice(guide.price)}</Text>
        )}

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.body}>{guide.description}</Text>

        <Text style={styles.sectionTitle}>Auteur</Text>
        <Text style={styles.body}>{guide.sellerDisplayName}</Text>

        {guide.tags.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Mots-clés</Text>
            <Text style={styles.body}>{guide.tags.join(' · ')}</Text>
          </>
        )}

        <View style={styles.actions}>
          {checking ? (
            <ActivityIndicator color={colors.primary} />
          ) : hasAccess ? (
            <Button
              title={loadingFile ? 'Ouverture…' : 'Ouvrir / télécharger le fichier'}
              onPress={handleOpenFile}
              loading={loadingFile}
              fullWidth
            />
          ) : guide.isFree ? null : (
            <Button
              title={`Acheter · ${formatPrice(guide.price)}`}
              onPress={handlePurchase}
              loading={purchasing}
              fullWidth
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  back: { padding: spacing.xs, marginRight: spacing.sm },
  headerTitle: { ...typography.h4, flex: 1 },
  spacer: { width: 40 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  typeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight + '50',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  typeIcon: { fontSize: 32, marginRight: spacing.md },
  typeLabel: { ...typography.bodySmall, flex: 1, color: colors.text.primary },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.xs },
  domain: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    fontSize: typography.caption.fontSize,
  },
  price: { ...typography.h3, color: colors.primaryDark, marginBottom: spacing.lg },
  priceFree: {
    ...typography.h3,
    color: colors.success,
    marginBottom: spacing.lg,
    fontWeight: '700',
  },
  sectionTitle: { ...typography.h4, marginTop: spacing.md, marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.text.secondary, lineHeight: 22 },
  actions: { marginTop: spacing.xl },
  error: { ...typography.body, textAlign: 'center', margin: spacing.xl },
});
