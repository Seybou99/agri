// Navigation par onglets pour SeneGundo
// Le code structurel est séparé des styles
import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomTabBar } from './components/CustomTabBar';
import {
  HomeIcon,
  DiagnosticIcon,
  MarketplaceIcon,
  AcademyIcon,
} from './components/TabIcons';
import { useCart } from '@contexts/CartContext';

// Écrans
import { HomeScreen } from '@screens/HomeScreen';
import { PlaceholderScreen } from '@screens/PlaceholderScreen';
import { DiagnosticMapScreen } from '@screens/DiagnosticMapScreen';
import { MarketplaceScreen } from '@screens/MarketplaceScreen';

export type TabParamList = {
  Home: undefined;
  Diagnostic: undefined;
  Marketplace: { filterCategory?: string; filterCrop?: string } | undefined;
  Academy: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Placeholders pour les onglets à venir
const AcademyPlaceholder = () => <PlaceholderScreen name="Académie" />;

// Composant pour l'icône Marketplace avec badge
const MarketplaceIconWithBadge: React.FC<{ color: string; size: number }> = ({ color, size }) => {
  const { totalItems } = useCart();
  return (
    <View style={{ position: 'relative' }}>
      <MarketplaceIcon color={color} size={size} />
      {totalItems > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: '#FF4444',
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 11,
              fontWeight: '700',
            }}
          >
            {totalItems > 99 ? '99+' : totalItems}
          </Text>
        </View>
      )}
    </View>
  );
};

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
        component={MarketplaceScreen}
        options={{
          tabBarLabel: 'Marché',
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => (
            <MarketplaceIconWithBadge color={color} size={size} />
          ),
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
