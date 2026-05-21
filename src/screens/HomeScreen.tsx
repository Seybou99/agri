/**
 * HomeScreen — Accueil SeneGundo
 * Dernier rapport · Météo · Accès rapide · À la une
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, typography } from '@theme';
import type { RootStackParamList } from '@navigation/AppNavigator';
import { useAuth } from '@hooks/useAuth';
import { useLastReport } from '@hooks/useLastReport';
import { triggerHaptic } from '@utils/haptics';
import { LastReportCard, HomeWeatherPreview, ServiceGrid, FeaturedSlider } from '@components/home';
import { TAB_BAR_HEIGHT, TAB_BAR_MARGIN_BOTTOM } from '@navigation/styles/tabNavigatorStyles';

export const HomeScreen: React.FC = () => {
  const tabNav = useNavigation();
  const stackNav = tabNav.getParent() as NativeStackNavigationProp<RootStackParamList> | undefined;
  const { userProfile } = useAuth();
  const { report, loading: reportLoading } = useLastReport();
  const insets = useSafeAreaInsets();

  const TAB_BAR_TOTAL_HEIGHT = TAB_BAR_HEIGHT + TAB_BAR_MARGIN_BOTTOM + 30;
  const bottomPadding = Math.max(TAB_BAR_TOTAL_HEIGHT, insets.bottom + TAB_BAR_TOTAL_HEIGHT);

  const handleNewDiagnostic = () => {
    triggerHaptic();
    stackNav?.navigate('DiagnosticMap');
  };

  const handleWeatherPress = (location: { lat: number; lng: number; name: string }) => {
    stackNav?.navigate('WeatherHome', {
      lat: location.lat,
      lng: location.lng,
      locationName: location.name,
    });
  };

  const handleOpenLastReport = () => {
    if (!report) {
      handleNewDiagnostic();
      return;
    }
    triggerHaptic();
    stackNav?.navigate('FieldReport', {
      parcelId: report.parcelId,
      crops: report.crops,
      surface: report.surfaceHa,
      lat: report.lat,
      lng: report.lng,
      locationName: report.locationName,
    });
  };

  const displayName = userProfile?.displayName?.split(' ')[0] || 'Agriculteur';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <View style={styles.topHeaderContent}>
          <Text style={styles.title}>SeneGundo</Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => stackNav?.navigate('Profile')}
            activeOpacity={0.7}
          >
            {userProfile ? (
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {userProfile.displayName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            ) : (
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M16 7a4 4 0 11-8 0 4 4 0 018 0z"
                  stroke={colors.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.greeting}>Bonjour, {displayName}</Text>
        <Text style={styles.heroQuestion}>Que souhaitez-vous faire ?</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <LastReportCard
          report={report}
          loading={reportLoading}
          onPress={handleOpenLastReport}
          onNewDiagnostic={handleNewDiagnostic}
        />

        <HomeWeatherPreview onPress={handleWeatherPress} />

        <ServiceGrid />

        <View style={styles.section}>
          <FeaturedSlider />
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
  topHeader: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[200],
  },
  topHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
    letterSpacing: -0.5,
  },
  profileButton: {
    padding: spacing.xs,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h4,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  greeting: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  heroQuestion: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 28,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
});
