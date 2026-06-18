/**
 * SettingsScreen — Paramètres de l'application SeneGundo
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { useAuth } from '@hooks/useAuth';
import { useSettings } from '@hooks/useSettings';
import { useLanguage } from '@contexts/LanguageContext';
import { LANGUAGES, type LanguageCode } from '../i18n';
import { colors, spacing, typography } from '@theme';

// ── Icônes SVG ────────────────────────────────────────────────────────────────

const IcBack = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={colors.text.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcUser = ({ c }: { c: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcLock = ({ c }: { c: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcGlobe = ({ c }: { c: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={c} strokeWidth={2} />
    <Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcCloud = ({ c }: { c: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcBell = ({ c }: { c: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcShop = ({ c }: { c: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcDownload = ({ c }: { c: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcRuler = ({ c }: { c: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21.3 8.7l-6-6a1 1 0 00-1.4 0L2.7 13.9a1 1 0 000 1.4l6 6a1 1 0 001.4 0L21.3 10a1 1 0 000-1.3zM7.5 15.5l1-1M10.5 18.5l1-1M13 16l1-1M16 13l1-1M10 10l1-1" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcTrash = ({ c }: { c: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcInfo = ({ c }: { c: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={c} strokeWidth={2} />
    <Path d="M12 16v-4M12 8h.01" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcMail = ({ c }: { c: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 6l-10 7L2 6" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcCheck = ({ c }: { c: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcChevron = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={colors.text.secondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ── Section card ──────────────────────────────────────────────────────────────

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <View style={s.section}>
    <Text style={s.sectionLabel}>{label}</Text>
    <View style={s.sectionBody}>{children}</View>
  </View>
);

// ── Toggle row ────────────────────────────────────────────────────────────────

interface ToggleRowProps {
  icon: React.ReactNode; iconBg: string; title: string;
  value: boolean; onChange: (v: boolean) => void; isLast?: boolean;
}
const ToggleRow: React.FC<ToggleRowProps> = ({ icon, iconBg, title, value, onChange, isLast }) => (
  <View style={[s.row, isLast && s.rowLast]}>
    <View style={[s.iconWrap, { backgroundColor: iconBg }]}>{icon}</View>
    <Text style={s.rowTitle}>{title}</Text>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
      thumbColor={value ? colors.primary : colors.white}
      ios_backgroundColor={colors.gray[300]}
    />
  </View>
);

// ── Press row ─────────────────────────────────────────────────────────────────

interface PressRowProps {
  icon: React.ReactNode; iconBg: string; title: string;
  subtitle?: string; onPress: () => void; danger?: boolean;
  isLast?: boolean; trailing?: React.ReactNode;
}
const PressRow: React.FC<PressRowProps> = ({ icon, iconBg, title, subtitle, onPress, danger, isLast, trailing }) => (
  <TouchableOpacity style={[s.row, isLast && s.rowLast]} onPress={onPress} activeOpacity={0.7}>
    <View style={[s.iconWrap, { backgroundColor: iconBg }]}>{icon}</View>
    <View style={s.rowContent}>
      <Text style={[s.rowTitle, danger && { color: colors.error }]}>{title}</Text>
      {subtitle ? <Text style={s.rowSub}>{subtitle}</Text> : null}
    </View>
    {trailing ?? <IcChevron />}
  </TouchableOpacity>
);

// ── Surface unit pills ────────────────────────────────────────────────────────

function UnitPicker({ current, onChange }: { current: 'ha' | 'acres'; onChange: (v: 'ha' | 'acres') => void }) {
  return (
    <View style={s.pillRow}>
      {(['ha', 'acres'] as const).map((v) => (
        <TouchableOpacity key={v} style={[s.pill, current === v && s.pillActive]} onPress={() => onChange(v)} activeOpacity={0.7}>
          <Text style={[s.pillText, current === v && s.pillTextActive]}>{v === 'ha' ? 'Hectares' : 'Acres'}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Sélecteur de langue (modal) ───────────────────────────────────────────────

interface LangPickerModalProps {
  visible: boolean;
  current: LanguageCode;
  onSelect: (lang: LanguageCode) => void;
  onClose: () => void;
}
const LangPickerModal: React.FC<LangPickerModalProps> = ({ visible, current, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={s.modalSheet}>
        <View style={s.modalHandle} />
        <Text style={s.modalTitle}>Choisir la langue</Text>
        <FlatList
          data={LANGUAGES}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => {
            const isActive = item.code === current;
            return (
              <TouchableOpacity
                style={[s.langItem, isActive && s.langItemActive]}
                onPress={() => { onSelect(item.code); onClose(); }}
                activeOpacity={0.7}
              >
                <Text style={s.langFlag}>{item.flag}</Text>
                <View style={s.langTexts}>
                  <Text style={[s.langLabel, isActive && s.langLabelActive]}>{item.label}</Text>
                  <Text style={s.langLabelFr}>{item.labelFr}</Text>
                </View>
                {isActive && <IcCheck c={colors.primary} />}
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={s.langSep} />}
        />
      </View>
    </TouchableOpacity>
  </Modal>
);

// ── Écran principal ────────────────────────────────────────────────────────────

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { userProfile } = useAuth();
  const { settings, loading, update, clearCache } = useSettings();
  const { lang, setLang, t } = useLanguage();
  const [clearingCache, setClearingCache] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLangMeta = LANGUAGES.find((l) => l.code === lang);

  const handleSelectLang = async (newLang: LanguageCode) => {
    await setLang(newLang);
    await update('lang', newLang);
  };

  const handleClearCache = () => {
    Alert.alert(
      t.settings.clearCacheConfirmTitle,
      t.settings.clearCacheConfirmMsg,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.settings.clearCache,
          style: 'destructive',
          onPress: async () => {
            setClearingCache(true);
            await clearCache();
            setClearingCache(false);
            Alert.alert(t.settings.clearCacheSuccess, t.settings.clearCacheSuccessMsg);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}><IcBack /></TouchableOpacity>
          <Text style={s.headerTitle}>{t.settings.title}</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={s.loadingWrap}><ActivityIndicator color={colors.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}><IcBack /></TouchableOpacity>
        <Text style={s.headerTitle}>{t.settings.title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        {/* ── Mon compte ── */}
        <Section label={t.settings.sectionAccount}>
          <PressRow
            icon={<IcUser c={colors.primary} />}
            iconBg={colors.primaryLight + '30'}
            title={t.settings.editProfile}
            subtitle={userProfile?.displayName ?? t.settings.editProfileSub}
            onPress={() => Alert.alert(t.settings.editProfileSoonTitle, t.settings.editProfileSoonMsg)}
          />
          <PressRow
            icon={<IcLock c="#2196F3" />}
            iconBg="#2196F320"
            title={t.settings.changePassword}
            onPress={() => Alert.alert(t.settings.changePasswordSoonTitle, t.settings.changePasswordSoonMsg)}
          />
          {/* Langue */}
          <TouchableOpacity style={[s.row, s.rowLast]} onPress={() => setLangModalVisible(true)} activeOpacity={0.7}>
            <View style={[s.iconWrap, { backgroundColor: '#9C27B020' }]}>
              <IcGlobe c="#9C27B0" />
            </View>
            <View style={s.rowContent}>
              <Text style={s.rowTitle}>{t.settings.language}</Text>
              <Text style={s.rowSub}>
                {currentLangMeta?.flag} {currentLangMeta?.label}
              </Text>
            </View>
            <IcChevron />
          </TouchableOpacity>
        </Section>

        {/* ── Notifications ── */}
        <Section label={t.settings.sectionNotifications}>
          <ToggleRow
            icon={<IcCloud c={colors.info} />}
            iconBg={colors.info + '20'}
            title={t.settings.notifWeather}
            value={settings.notifMeteo}
            onChange={(v) => update('notifMeteo', v)}
          />
          <ToggleRow
            icon={<IcBell c={colors.primary} />}
            iconBg={colors.primaryLight + '30'}
            title={t.settings.notifDiagnostic}
            value={settings.notifDiagnostic}
            onChange={(v) => update('notifDiagnostic', v)}
          />
          <ToggleRow
            icon={<IcShop c={colors.secondary} />}
            iconBg={colors.secondary + '20'}
            title={t.settings.notifMarket}
            value={settings.notifMarche}
            onChange={(v) => update('notifMarche', v)}
            isLast
          />
        </Section>

        {/* ── Application ── */}
        <Section label={t.settings.sectionApp}>
          <ToggleRow
            icon={<IcDownload c="#4CAF50" />}
            iconBg="#4CAF5020"
            title={t.settings.offlineMode}
            value={settings.modeHorsLigne}
            onChange={(v) => update('modeHorsLigne', v)}
          />
          <View style={s.row}>
            <View style={[s.iconWrap, { backgroundColor: '#FF572220' }]}>
              <IcRuler c="#FF5722" />
            </View>
            <View style={s.rowContent}>
              <Text style={s.rowTitle}>{t.settings.surfaceUnit}</Text>
              <UnitPicker
                current={settings.uniteSurface}
                onChange={(v) => update('uniteSurface', v)}
              />
            </View>
          </View>
          <PressRow
            icon={<IcTrash c={colors.error} />}
            iconBg={colors.error + '15'}
            title={t.settings.clearCache}
            subtitle={t.settings.clearCacheSub}
            onPress={handleClearCache}
            isLast
            trailing={clearingCache ? <ActivityIndicator size="small" color={colors.primary} /> : <IcChevron />}
          />
        </Section>

        {/* ── À propos ── */}
        <Section label={t.settings.sectionAbout}>
          <PressRow
            icon={<IcInfo c={colors.text.secondary} />}
            iconBg={colors.gray[200]}
            title={t.settings.appVersion}
            onPress={() => {}}
            trailing={<Text style={s.versionTag}>v1.0.0</Text>}
          />
          <PressRow
            icon={<IcMail c="#2196F3" />}
            iconBg="#2196F320"
            title={t.settings.contactSupport}
            subtitle={t.settings.contactSupportSub}
            onPress={() => Alert.alert(t.settings.contactAlertTitle, t.settings.contactAlertMsg)}
            isLast
          />
        </Section>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Modal sélecteur de langue */}
      <LangPickerModal
        visible={langModalVisible}
        current={lang}
        onSelect={handleSelectLang}
        onClose={() => setLangModalVisible(false)}
      />
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: spacing.md, paddingBottom: spacing.xl },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[200],
  },
  backBtn: { padding: spacing.xs, width: 36 },
  headerTitle: { ...typography.h4, color: colors.text.primary, flex: 1, textAlign: 'center' },

  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.text.secondary,
    letterSpacing: 0.8, textTransform: 'uppercase',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  sectionBody: { paddingHorizontal: spacing.md },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray[100],
    gap: spacing.md,
  },
  rowLast: {},
  iconWrap: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  rowContent: { flex: 1 },
  rowTitle: { ...typography.body, fontWeight: '600', color: colors.text.primary },
  rowSub: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },

  pillRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  pill: {
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs / 2,
    borderRadius: 20, borderWidth: 1,
    borderColor: colors.gray[300], backgroundColor: colors.gray[100],
  },
  pillActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  pillText: { fontSize: 12, fontWeight: '500', color: colors.text.secondary },
  pillTextActive: { color: colors.white },

  versionTag: {
    fontSize: 13, fontWeight: '600', color: colors.primary,
    backgroundColor: colors.primaryLight + '25',
    paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: 8,
  },

  // Modal langue
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: spacing.xl, maxHeight: '75%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.gray[300],
    alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h4, color: colors.text.primary,
    textAlign: 'center', marginBottom: spacing.md,
  },
  langItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  langItemActive: { backgroundColor: colors.primaryLight + '15' },
  langFlag: { fontSize: 24, marginRight: spacing.md },
  langTexts: { flex: 1 },
  langLabel: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  langLabelActive: { color: colors.primaryDark },
  langLabelFr: { fontSize: 12, color: colors.text.secondary, marginTop: 1 },
  langSep: { height: StyleSheet.hairlineWidth, backgroundColor: colors.gray[100], marginHorizontal: spacing.lg },
});
