// Navigation par onglets pour SeneGundo
// Le code structurel est séparé des styles
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomTabBar } from './components/CustomTabBar';
import {
  HomeIcon,
  DiagnosticIcon,
  MarketplaceIcon,
  AcademyIcon,
} from './components/TabIcons';

// Écrans
import { HomeScreen } from '@screens/HomeScreen';
import { PlaceholderScreen } from '@screens/PlaceholderScreen';
import { DiagnosticMapScreen } from '@screens/DiagnosticMapScreen';

export type TabParamList = {
  Home: undefined;
  Diagnostic: undefined;
  Marketplace: undefined;
  Academy: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Placeholders pour les onglets à venir
const MarketplacePlaceholder = () => <PlaceholderScreen name="Marketplace" />;
const AcademyPlaceholder = () => <PlaceholderScreen name="Académie" />;

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
          tabBarAccessibilityLabel: 'Accueil',
        }}
      />
      <Tab.Screen
        name="Diagnostic"
        component={DiagnosticMapScreen}
        options={{
          tabBarLabel: 'Diagnostic',
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => <DiagnosticIcon color={color} size={size} />,
          tabBarAccessibilityLabel: 'Diagnostic',
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplacePlaceholder}
        options={{
          tabBarLabel: 'Marché',
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => <MarketplaceIcon color={color} size={size} />,
          tabBarAccessibilityLabel: 'Marketplace',
        }}
      />
      <Tab.Screen
        name="Academy"
        component={AcademyPlaceholder}
        options={{
          tabBarLabel: 'Académie',
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => <AcademyIcon color={color} size={size} />,
          tabBarAccessibilityLabel: 'Académie',
        }}
      />
    </Tab.Navigator>
  );
};
