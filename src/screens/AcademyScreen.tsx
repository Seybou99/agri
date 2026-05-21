import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { GuideList } from '@components/academy/GuideList';
import { useAcademy } from '@contexts/AcademyContext';
import { useAuth } from '@hooks/useAuth';
import { canSellOnMarketplace } from '@constants/marketplaceRoles';
import {
  ACADEMY_DOMAINS,
  ACADEMY_DOMAIN_LABELS,
} from '@constants/academy';
import type { AcademyDomain } from '@models/AcademyGuide';
import { colors, spacing, typography } from '@theme';

export const AcademyScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { guides } = useAcademy();
  const { userProfile, isAuthenticated } = useAuth();
  const [selectedDomain, setSelectedDomain] = useState<AcademyDomain | 'all'>('all');

  const canPublish =
    isAuthenticated && canSellOnMarketplace(userProfile?.role);

  const filteredGuides = useMemo(() => {
    if (selectedDomain === 'all') return guides;
    return guides.filter((g) => g.domain === selectedDomain);
  }, [guides, selectedDomain]);

  const handleAdd = () => {
    if (!isAuthenticated) {
      Alert.alert('Connexion requise', 'Connectez-vous pour publier un guide.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => navigation.navigate('AuthLogin') },
      ]);
      return;
    }
    navigation.navigate('CreateAcademyGuide');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Académie SeneGundo</Text>
          <Text style={styles.subtitle}>
            Guides, manuels et ressources pour l’agriculture
          </Text>
        </View>
        {canPublish && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdd}
            accessibilityLabel="Publier un guide"
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
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.chip, selectedDomain === 'all' && styles.chipActive]}
            onPress={() => setSelectedDomain('all')}
          >
            <Text
              style={[styles.chipText, selectedDomain === 'all' && styles.chipTextActive]}
            >
              Tous
            </Text>
          </TouchableOpacity>
          {ACADEMY_DOMAINS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.chip, selectedDomain === d && styles.chipActive]}
              onPress={() => setSelectedDomain(d)}
            >
              <Text
                style={[styles.chipText, selectedDomain === d && styles.chipTextActive]}
              >
                {ACADEMY_DOMAIN_LABELS[d]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <GuideList guides={filteredGuides} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitles: { flex: 1, paddingRight: spacing.sm },
  title: { ...typography.h2, color: colors.primaryDark, marginBottom: spacing.xs },
  subtitle: { ...typography.bodySmall, color: colors.text.secondary },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  filters: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingVertical: spacing.sm,
  },
  chip: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  chipActive: { backgroundColor: colors.primaryLight },
  chipText: { fontSize: typography.caption.fontSize, color: colors.text.primary },
  chipTextActive: { color: colors.primaryDark, fontWeight: '700' },
});
