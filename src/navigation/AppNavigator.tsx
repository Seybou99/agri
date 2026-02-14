import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { FieldReportScreen } from '@screens/FieldReportScreen';
import { DiagnosticMapScreen } from '@screens/DiagnosticMapScreen';
import { DiagnosticConfigScreen } from '@screens/DiagnosticConfigScreen';
import { ProductDetailScreen } from '@screens/ProductDetailScreen';
import { CartScreen } from '@screens/CartScreen';
import { CheckoutScreen } from '@screens/CheckoutScreen';
import { ProfileScreen } from '@screens/ProfileScreen';
import { WeatherHomeScreen } from '../screens/WeatherHomeScreen';
import { Next7DaysScreen } from '../screens/Next7DaysScreen';
import { ForecastScreen } from '../screens/ForecastScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  DiagnosticMap: undefined;
  DiagnosticConfig: { lat: number; lng: number; locationName?: string };
  FieldReport: {
    parcelId?: string;
    crop?: string;
    crops?: string[];
    surface?: number;
    lat?: number;
    lng?: number;
    locationName?: string;
  };
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  Profile: undefined;
  WeatherHome: { lat?: number; lng?: number; locationName?: string };
  Next7Days: { lat?: number; lng?: number; locationName?: string };
  Forecast: { lat?: number; lng?: number; locationName?: string };
};

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="DiagnosticMap" component={DiagnosticMapScreen} />
        <Stack.Screen name="DiagnosticConfig" component={DiagnosticConfigScreen} />
        <Stack.Screen name="FieldReport" component={FieldReportScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="WeatherHome" component={WeatherHomeScreen} />
        <Stack.Screen name="Next7Days" component={Next7DaysScreen} />
        <Stack.Screen name="Forecast" component={ForecastScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
