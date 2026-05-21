/**
 * ProfileScreen - Écran de profil utilisateur
 * Affiche les informations de l'utilisateur, ses diagnostics, commandes, etc.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { useAuth } from '@hooks/useAuth';
import { useCart } from '@contexts/CartContext';
import { useAcademy } from '@contexts/AcademyContext';
import { useMarketplace } from '@contexts/MarketplaceContext';
import { canSellOnMarketplace } from '@constants/marketplaceRoles';
import { USER_ROLE_LABELS } from '@constants/userRoles';
import { colors, spacing, typography } from '@theme';
import { Button } from '@components/common';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { userProfile, signOut, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { myPurchases: academyPurchases, mySales: academySales } = useAcademy();
  const {
    myPurchases: marketPurchases,
    mySales: marketSales,
  } = useMarketplace();
  const isSeller = canSellOnMarketplace(userProfile?.role);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation sera gérée automatiquement par le système d'auth
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (!isAuthenticated || !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
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
          <Text style={styles.headerTitle}>Profil</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👤</Text>
          <Text style={styles.emptyTitle}>Non connecté</Text>
          <Text style={styles.emptyText}>
            Connectez-vous pour accéder à votre profil et gérer vos diagnostics
          </Text>
          <View style={styles.emptyActions}>
            <Button
              title="Se connecter"
              onPress={() => navigation.navigate('AuthLogin')}
              variant="primary"
              fullWidth
            />
            <Button
              title="Créer un compte"
              onPress={() => navigation.navigate('AuthRegister')}
              variant="outline"
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Mon profil</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => {}}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 15a3 3 0 100-6 3 3 0 000 6z"
              stroke={colors.text.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
              stroke={colors.text.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section Profil */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userProfile.avatarUrl ? (
              <Image source={{ uri: userProfile.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userProfile.displayName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{userProfile.displayName || 'Utilisateur'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {USER_ROLE_LABELS[userProfile.role] ?? userProfile.role}
            </Text>
          </View>
          {userProfile.email && (
            <Text style={styles.userEmail}>{userProfile.email}</Text>
          )}
          {userProfile.phoneNumber && (
            <Text style={styles.userPhone}>{userProfile.phoneNumber}</Text>
          )}
        </View>

        {/* Section Statistiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes statistiques</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Diagnostics</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{marketPurchases.length}</Text>
              <Text style={styles.statLabel}>Achats Marché</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{isSeller ? marketSales.length : 0}</Text>
              <Text style={styles.statLabel}>Ventes Marché</Text>
            </View>
          </View>
        </View>

        {/* Section Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>🛍️</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Mon panier</Text>
              <Text style={styles.menuSubtitle}>
                {totalItems > 0
                  ? `${totalItems} article${totalItems > 1 ? 's' : ''}`
                  : 'Voir vos produits sélectionnés'}
              </Text>
            </View>
            {totalItems > 0 && (
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>
                  {totalItems > 99 ? '99+' : totalItems}
                </Text>
              </View>
            )}
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 18l6-6-6-6"
                stroke={colors.text.secondary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MarketplaceMyPurchases')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>🛒</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Mes achats Marché</Text>
              <Text style={styles.menuSubtitle}>
                {marketPurchases.length > 0
                  ? `${marketPurchases.length} commande${marketPurchases.length > 1 ? 's' : ''}`
                  : 'Historique des commandes'}
              </Text>
            </View>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 18l6-6-6-6"
                stroke={colors.text.secondary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          {isSeller && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('MarketplaceMySales')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>📦</Text>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Mes ventes Marché</Text>
                <Text style={styles.menuSubtitle}>
                  {marketSales.length > 0
                    ? `${marketSales.length} vente${marketSales.length > 1 ? 's' : ''}`
                    : 'Produits vendus sur le marché'}
                </Text>
              </View>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 18l6-6-6-6"
                  stroke={colors.text.secondary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📋</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Mes diagnostics</Text>
              <Text style={styles.menuSubtitle}>Voir tous mes rapports</Text>
            </View>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 18l6-6-6-6"
                stroke={colors.text.secondary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AcademyMyPurchases')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>📚</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Mes achats Académie</Text>
              <Text style={styles.menuSubtitle}>
                {academyPurchases.length > 0
                  ? `${academyPurchases.length} guide${academyPurchases.length > 1 ? 's' : ''}`
                  : 'Guides et manuels achetés'}
              </Text>
            </View>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 18l6-6-6-6"
                stroke={colors.text.secondary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          {isSeller && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('AcademyMySales')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>💰</Text>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Mes ventes Académie</Text>
                <Text style={styles.menuSubtitle}>
                  {academySales.length > 0
                    ? `${academySales.length} vente${academySales.length > 1 ? 's' : ''}`
                    : 'Guides vendus sur l’Académie'}
                </Text>
              </View>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 18l6-6-6-6"
                  stroke={colors.text.secondary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Paramètres</Text>
              <Text style={styles.menuSubtitle}>Préférences et notifications</Text>
            </View>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 18l6-6-6-6"
                stroke={colors.text.secondary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <View style={styles.section}>
          <Button
            title="Se déconnecter"
            onPress={handleSignOut}
            variant="secondary"
            fullWidth
          />
        </View>
      </ScrollView>
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
  settingsButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  emptyActions: {
    marginTop: spacing.md,
    width: '100%',
    gap: spacing.sm,
  },
  roleBadge: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryLight + '50',
    borderRadius: 20,
  },
  roleBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h1,
    color: colors.primaryDark,
  },
  userName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  userPhone: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  section: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  menuSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  menuBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: spacing.sm,
  },
  menuBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
});
