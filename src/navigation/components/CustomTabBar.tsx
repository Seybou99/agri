import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  tabNavigatorStyles,
  tabBarColors,
  TAB_BAR_MARGIN_BOTTOM,
} from '../styles/tabNavigatorStyles';

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

  if (!state?.routes?.length || !descriptors || !navigation) {
    return null;
  }

  const routes = state.routes;
  const bottomPadding = Math.max(TAB_BAR_MARGIN_BOTTOM, insets.bottom);

  return (
    <View style={[tabNavigatorStyles.wrapper, { paddingBottom: bottomPadding }]}>
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
