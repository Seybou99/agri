/**
 * ProfileScreen - Écran de profil utilisateur
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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { useAuth } from '@hooks/useAuth';
import { useCart } from '@contexts/CartContext';
import { useAcademy } from '@contexts/AcademyContext';
import { useMarketplace } from '@contexts/MarketplaceContext';
import { canSellOnMarketplace } from '@constants/marketplaceRoles';
import { USER_ROLE_LABELS } from '@constants/userRoles';
import { colors, spacing, typography } from '@theme';
import { Button } from '@components/common';
import { useLanguage } from '@contexts/LanguageContext';

// ── Icônes SVG inline ─────────────────────────────────────────────────────────

const ChevronRight = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={colors.text.secondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconReport = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconCart = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconPurchase = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="21" r="1" stroke={color} strokeWidth={2} />
    <Circle cx="20" cy="21" r="1" stroke={color} strokeWidth={2} />
    <Path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconSales = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="1" y="3" width="15" height="13" rx="1" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 8h4l3 3v5h-7V8zM1 16l4-4 4 4 4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconAcademy = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconSettings = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconLogout = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ── MenuItem ─────────────────────────────────────────────────────────────────

interface MenuItemProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  badge?: number;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, iconBg, title, subtitle, onPress, badge, danger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIconWrap, { backgroundColor: iconBg }]}>
      {icon}
    </View>
    <View style={styles.menuContent}>
      <Text style={[styles.menuTitle, danger && { color: colors.error }]}>{title}</Text>
      {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
    </View>
    {badge != null && badge > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
      </View>
    )}
    <ChevronRight />
  </TouchableOpacity>
);

// ── SectionCard ───────────────────────────────────────────────────────────────

interface SectionCardProps {
  label: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ label, children }) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionLabel}>{label}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

// ── Main screen ───────────────────────────────────────────────────────────────

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { userProfile, signOut, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { myPurchases: academyPurchases, mySales: academySales } = useAcademy();
  const { myPurchases: marketPurchases, mySales: marketSales } = useMarketplace();
  const isSeller = canSellOnMarketplace(userProfile?.role);
  const { t } = useLanguage();

  const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;

  const handleSignOut = () => {
    Alert.alert(
      t.profile.signOutConfirmTitle,
      t.profile.signOutConfirmMsg,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.profile.signOut,
          style: 'destructive',
          onPress: async () => {
            try { await signOut(); } catch (e) { console.error(e); }
          },
        },
      ]
    );
  };

  // ── Non authentifié ────────────────────────────────────────────────────────

  if (!isAuthenticated || !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.simpleHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backButton}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M12 19l-7-7 7-7" stroke={colors.text.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.profile.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyAvatarWrap}>
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
              <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={colors.primaryLight} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              <Circle cx="12" cy="7" r="4" stroke={colors.primaryLight} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={styles.emptyTitle}>{t.profile.notConnected}</Text>
          <Text style={styles.emptyText}>{t.profile.notConnectedMsg}</Text>
          <View style={styles.emptyActions}>
            <Button title={t.profile.signIn} onPress={() => navigation.navigate('AuthLogin')} variant="primary" fullWidth />
            <Button title={t.profile.createAccount} onPress={() => navigation.navigate('AuthRegister')} variant="outline" fullWidth />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const initials = userProfile.displayName
    ? userProfile.displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  // ── Authentifié ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Hero header ── */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.heroBack}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path d="M19 12H5M12 19l-7-7 7-7" stroke={colors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.heroHeaderTitle}>{t.profile.title}</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            {userProfile.avatarUrl ? (
              <Image source={{ uri: userProfile.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </View>

          <Text style={styles.heroName}>{userProfile.displayName || 'Utilisateur'}</Text>

          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>
              {USER_ROLE_LABELS[userProfile.role] ?? userProfile.role}
            </Text>
          </View>

          {(userProfile.email || userProfile.phoneNumber) && (
            <Text style={styles.heroContact}>
              {userProfile.phoneNumber || userProfile.email}
            </Text>
          )}
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{marketPurchases.length + academyPurchases.length}</Text>
            <Text style={styles.statLabel}>{t.profile.statPurchases}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{isSeller ? marketSales.length + academySales.length : 0}</Text>
            <Text style={styles.statLabel}>{t.profile.statSales}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalItems}</Text>
            <Text style={styles.statLabel}>{t.profile.statCart}</Text>
          </View>
        </View>

        {/* ── Section Agricole ── */}
        <SectionCard label={t.profile.sectionAgricultural}>
          <MenuItem
            icon={<IconReport color={colors.primary} />}
            iconBg={colors.primaryLight + '30'}
            title={t.profile.myReports}
            subtitle={t.profile.myReportsSubtitle}
            onPress={() => navigation.navigate('ParcelHistory')}
          />
        </SectionCard>

        {/* ── Section Marché ── */}
        <SectionCard label={t.profile.sectionMarket}>
          <MenuItem
            icon={<IconCart color={colors.secondary} />}
            iconBg={colors.secondary + '20'}
            title={t.profile.myCart}
            subtitle={totalItems > 0 ? plural(totalItems, t.profile.articles) : t.profile.cartEmpty}
            onPress={() => navigation.navigate('Cart')}
            badge={totalItems}
          />
          <MenuItem
            icon={<IconPurchase color="#2196F3" />}
            iconBg="#2196F320"
            title={t.profile.myPurchases}
            subtitle={marketPurchases.length > 0 ? plural(marketPurchases.length, t.profile.orders) : t.profile.ordersHistory}
            onPress={() => navigation.navigate('MarketplaceMyPurchases')}
          />
          {isSeller && (
            <MenuItem
              icon={<IconSales color="#FF5722" />}
              iconBg="#FF572220"
              title={t.profile.mySales}
              subtitle={marketSales.length > 0 ? plural(marketSales.length, t.profile.soldItems) : t.profile.salesHistory}
              onPress={() => navigation.navigate('MarketplaceMySales')}
            />
          )}
        </SectionCard>

        {/* ── Section Académie ── */}
        <SectionCard label={t.profile.sectionAcademy}>
          <MenuItem
            icon={<IconAcademy color="#9C27B0" />}
            iconBg="#9C27B020"
            title={t.profile.myGuidesBought}
            subtitle={academyPurchases.length > 0 ? plural(academyPurchases.length, t.profile.guides) : t.profile.guidesBought}
            onPress={() => navigation.navigate('AcademyMyPurchases')}
          />
          {isSeller && (
            <MenuItem
              icon={<IconSales color="#4CAF50" />}
              iconBg="#4CAF5020"
              title={t.profile.myGuidesSold}
              subtitle={academySales.length > 0 ? plural(academySales.length, t.profile.soldItems) : t.profile.guidesPublished}
              onPress={() => navigation.navigate('AcademyMySales')}
            />
          )}
        </SectionCard>

        {/* ── Section Compte ── */}
        <SectionCard label={t.profile.sectionAccount}>
          <MenuItem
            icon={<IconSettings color={colors.text.secondary} />}
            iconBg={colors.gray[200]}
            title={t.profile.settings}
            subtitle={t.profile.settingsSubtitle}
            onPress={() => navigation.navigate('Settings')}
          />
          <MenuItem
            icon={<IconLogout color={colors.error} />}
            iconBg={colors.error + '15'}
            title={t.profile.signOut}
            onPress={handleSignOut}
            danger
          />
        </SectionCard>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: spacing.lg },

  // Simple header (non-auth)
  simpleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[200],
  },
  backButton: { padding: spacing.xs, marginRight: spacing.sm },
  headerTitle: { ...typography.h4, color: colors.text.primary, flex: 1 },

  // Hero
  hero: {
    backgroundColor: colors.primaryDark,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  heroBack: { padding: spacing.xs, width: 36 },
  heroHeaderTitle: {
    ...typography.h4,
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  avatarWrap: {
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: colors.white },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    borderWidth: 3,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { fontSize: 34, fontWeight: '700', color: colors.primaryDark },
  heroName: { ...typography.h3, color: colors.white, marginBottom: spacing.xs },
  rolePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs / 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: spacing.xs,
  },
  rolePillText: { fontSize: 12, fontWeight: '600', color: colors.white },
  heroContact: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: spacing.xs },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: -spacing.lg,
    borderRadius: 16,
    paddingVertical: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.primaryDark, marginBottom: 2 },
  statLabel: { fontSize: 11, color: colors.text.secondary, fontWeight: '500' },
  statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.gray[200], alignSelf: 'stretch', marginVertical: spacing.xs },

  // Section card
  sectionCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionBody: { paddingHorizontal: spacing.md },

  // Menu item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray[100],
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuContent: { flex: 1, marginRight: spacing.sm },
  menuTitle: { ...typography.body, fontWeight: '600', color: colors.text.primary, marginBottom: 2 },
  menuSubtitle: { fontSize: 12, color: colors.text.secondary },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: spacing.sm,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.white },

  // Empty state
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyAvatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.sm },
  emptyText: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 22 },
  emptyActions: { width: '100%', gap: spacing.sm },
});
