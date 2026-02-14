import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';
import {
  tabNavigatorStyles,
  tabBarColors,
  TAB_BAR_MARGIN_BOTTOM,
} from '../styles/tabNavigatorStyles';
import { colors, spacing, typography } from '@theme';
import type { AppNavigationProp } from '@navigation/AppNavigator';

/** Tailles des icônes */
const ICON_SIZE_ACTIVE = 26;
const ICON_SIZE_INACTIVE = 24;

/**
 * Active les LayoutAnimation sur Android (désactivées par défaut).
 */
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Un seul onglet de la barre : cercle actif animé ou icône seule.
 */
interface TabBarItemProps {
  route: { key: string; name: string };
  options: { tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode; tabBarAccessibilityLabel?: string };
  isFocused: boolean;
  onPress: () => void;
}

const TabBarItem: React.FC<TabBarItemProps> = ({
  route,
  options,
  isFocused,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: true,
      tension: 120,
      friction: 12,
    }).start();
  }, [isFocused, scaleAnim]);

  const color = isFocused ? tabBarColors.activeIcon : tabBarColors.inactiveIcon;
  const size = isFocused ? ICON_SIZE_ACTIVE : ICON_SIZE_INACTIVE;
  const icon = options.tabBarIcon?.({
    focused: isFocused,
    color,
    size,
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={tabNavigatorStyles.tabZone}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel ?? route.name}
    >
      {isFocused ? (
        <Animated.View
          style={[
            tabNavigatorStyles.activeCircle,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {icon}
        </Animated.View>
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
};

/**
 * Barre de navigation flottante en pilule.
 * - Fond vert foncé, forme très arrondie, marges bas / gauche / droite.
 * - Icône active : cercle vert clair, légèrement plus grande.
 * - Icônes inactives : blanc cassé, sans fond.
 * - Animation douce au changement d’onglet.
 */
export const CustomTabBar: React.FC<BottomTabBarProps> = (props) => {
  const { state, descriptors, navigation } = props;
  const insets = useSafeAreaInsets();
  const stackNav = navigation.getParent() as AppNavigationProp | undefined;

  if (!state?.routes?.length || !descriptors || !navigation) {
    return null;
  }

  const routes = state.routes;
  const bottomPadding = Math.max(TAB_BAR_MARGIN_BOTTOM, insets.bottom);

  const handleNewDiagnostic = () => {
    stackNav?.navigate('DiagnosticMap');
  };

  return (
    <View style={[tabNavigatorStyles.wrapper, { paddingBottom: bottomPadding }]}>
      {/* Bouton FAB intégré */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={handleNewDiagnostic}
        activeOpacity={0.9}
      >
        <View style={styles.fabContent}>
          <Text style={styles.fabIcon}>+</Text>
        </View>
      </TouchableOpacity>

      <View style={tabNavigatorStyles.tabBar}>
        {routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabBarItem
              key={route.key}
              route={route}
              options={options}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fabButton: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  fabContent: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    ...typography.h1,
    color: colors.white,
    fontWeight: '300',
    lineHeight: 40,
  },
});
