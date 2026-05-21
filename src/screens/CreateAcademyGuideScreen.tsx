import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { AuthTextField } from '@components/auth/AuthTextField';
import { OptionChips } from '@components/marketplace/OptionChips';
import { Button } from '@components/common';
import { useAuth } from '@hooks/useAuth';
import { useAcademy } from '@contexts/AcademyContext';
import { canSellOnMarketplace } from '@constants/marketplaceRoles';
import {
  ACADEMY_DOMAINS,
  ACADEMY_DOMAIN_LABELS,
  ACADEMY_FILE_TYPE_LABELS,
} from '@constants/academy';
import { pickAcademyDocument, type PickedDocument } from '@utils/documentBase64';
import type { AcademyDomain } from '@models/AcademyGuide';
import { colors, spacing, typography } from '@theme';

export const CreateAcademyGuideScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { user, userProfile, isAuthenticated } = useAuth();
  const { publishGuide } = useAcademy();

  const [domain, setDomain] = useState<AcademyDomain>('techniques_agricoles');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');
  const [document, setDocument] = useState<PickedDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !canSellOnMarketplace(userProfile?.role)) {
      navigation.goBack();
    }
  }, [isAuthenticated, userProfile?.role, navigation]);

  const handlePickFile = async () => {
    setPicking(true);
    try {
      const doc = await pickAcademyDocument();
      setDocument(doc);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur';
      if (msg !== 'Sélection annulée.') Alert.alert('Fichier', msg);
    } finally {
      setPicking(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !userProfile) return;
    if (!title.trim()) {
      Alert.alert('Formulaire', 'Indiquez un titre.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Formulaire', 'Ajoutez une description.');
      return;
    }
    if (!document) {
      Alert.alert('Formulaire', 'Ajoutez un fichier (PDF, Word, Excel…).');
      return;
    }
    const priceNum = isFree ? 0 : Number(price.replace(/\s/g, ''));
    if (!isFree && (!Number.isFinite(priceNum) || priceNum <= 0)) {
      Alert.alert('Formulaire', 'Indiquez un prix valide en FCFA.');
      return;
    }

    setLoading(true);
    try {
      await publishGuide({
        sellerId: user.uid,
        sellerDisplayName: userProfile.displayName || 'Auteur',
        title,
        description,
        domain,
        fileType: document.fileType,
        fileName: document.fileName,
        mimeType: document.mimeType,
        fileBase64: document.fileBase64,
        isFree,
        price: priceNum,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      Alert.alert('Guide publié', 'Votre ressource est disponible dans l’Académie.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(
        'Publication',
        e instanceof Error ? e.message : 'Impossible de publier.'
      );
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Publier un guide</Text>
        <View style={styles.spacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.hint}>
            Fichiers PDF, Word, Excel, PowerPoint (max ~700 Ko, stockés en base64 sans Firebase
            Storage).
          </Text>

          <TouchableOpacity
            style={styles.fileBox}
            onPress={handlePickFile}
            disabled={picking}
          >
            <Text style={styles.fileIcon}>📎</Text>
            <Text style={styles.fileLabel}>
              {document
                ? `${document.fileName} (${ACADEMY_FILE_TYPE_LABELS[document.fileType]})`
                : picking
                  ? 'Chargement…'
                  : 'Choisir un fichier'}
            </Text>
          </TouchableOpacity>

          <OptionChips
            label="Domaine *"
            options={ACADEMY_DOMAINS}
            value={domain}
            onChange={setDomain}
            getLabel={(d) => ACADEMY_DOMAIN_LABELS[d]}
          />

          <AuthTextField
            label="Titre *"
            value={title}
            onChangeText={setTitle}
            placeholder="Ex. Guide irrigation goutte-à-goutte"
          />
          <AuthTextField
            label="Description *"
            value={description}
            onChangeText={setDescription}
            placeholder="Contenu, public cible, prérequis…"
            multiline
            style={styles.area}
          />
          <AuthTextField
            label="Mots-clés (optionnel)"
            value={tags}
            onChangeText={setTags}
            placeholder="riz, semis, Mali"
          />

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>Guide gratuit</Text>
              <Text style={styles.switchHint}>
                {isFree
                  ? 'Téléchargement libre pour tous'
                  : 'Les acheteurs paient pour accéder au fichier'}
              </Text>
            </View>
            <Switch
              value={isFree}
              onValueChange={setIsFree}
              trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
              thumbColor={isFree ? colors.primaryDark : colors.gray[100]}
            />
          </View>

          {!isFree && (
            <AuthTextField
              label="Prix (FCFA) *"
              value={price}
              onChangeText={setPrice}
              placeholder="5000"
              keyboardType="numeric"
            />
          )}

          <Button title="Publier le guide" onPress={handleSubmit} loading={loading} fullWidth />
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
  back: { padding: spacing.xs, marginRight: spacing.sm },
  headerTitle: { ...typography.h4, flex: 1, color: colors.text.primary },
  spacer: { width: 40 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  fileBox: {
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
  },
  fileIcon: { fontSize: 36, marginBottom: spacing.sm },
  fileLabel: { ...typography.body, color: colors.text.primary, textAlign: 'center' },
  area: { minHeight: 100, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  switchText: { flex: 1, marginRight: spacing.md },
  switchLabel: { fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  switchHint: { ...typography.caption, color: colors.text.secondary },
});
