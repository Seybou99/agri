import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { MarketplaceRayon } from '@models/Product';
import { BuyerHomeScreen } from '@client/screens/BuyerHomeScreen';
import { BuyerOrdersScreen } from '@client/screens/BuyerOrdersScreen';
import { MarketplaceScreen } from '@screens/MarketplaceScreen';
import { ProfileScreen } from '@screens/ProfileScreen';
import { useClientTheme } from '@client/theme/useClientTheme';

export type BuyerTabParamList = {
  BuyerHome: undefined;
  Explorer: { initialRayon?: MarketplaceRayon } | undefined;
  Orders: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BuyerTabParamList>();

import { getBuyerTabBarTotalHeight } from '@client/constants/layout';

export const BuyerTabNavigator: React.FC = () => {
  const t = useClientTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);
  const tabBarHeight = getBuyerTabBarTotalHeight(bottomInset);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.tabActive,
        tabBarInactiveTintColor: t.tabInactive,
        tabBarStyle: {
          backgroundColor: t.tabBar,
          borderTopColor: t.border,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: bottomInset,
          height: tabBarHeight,
          minHeight: tabBarHeight,
        },
        tabBarItemStyle: {
          paddingBottom: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="BuyerHome"
        component={BuyerHomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Explorer"
        component={MarketplaceScreen}
        options={{
          tabBarLabel: 'Explorer',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={BuyerOrdersScreen}
        options={{
          tabBarLabel: 'Commandes',
          tabBarIcon: ({ color, size }) => <Ionicons name="bag-handle-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Compte',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
