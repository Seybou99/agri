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
import { WeatherHomeScreen } from '@screens/WeatherHomeScreen';
import { Next7DaysScreen } from '../screens/Next7DaysScreen';
import { ForecastScreen } from '@screens/ForecastScreen';
import { LoginScreen } from '@screens/LoginScreen';
import { RegisterScreen } from '@screens/RegisterScreen';
import { CreateProductScreen } from '@screens/CreateProductScreen';
import { CreateAcademyGuideScreen } from '@screens/CreateAcademyGuideScreen';
import { AcademyGuideDetailScreen } from '@screens/AcademyGuideDetailScreen';
import { AcademyMyPurchasesScreen } from '@screens/AcademyMyPurchasesScreen';
import { AcademyMySalesScreen } from '@screens/AcademyMySalesScreen';
import { MarketplaceMyPurchasesScreen } from '@screens/MarketplaceMyPurchasesScreen';
import { MarketplaceMySalesScreen } from '@screens/MarketplaceMySalesScreen';
import { PlantDiseaseScreen } from '@screens/PlantDiseaseScreen';

/** Params pour navigation imbriquée vers un onglet (ex. Marketplace avec filtre). */
export type MainTabsParams =
  | undefined
  | { screen: 'Marketplace'; params?: { filterCategory?: string; filterCrop?: string } }
  | { screen: 'Home' }
  | { screen: 'Diagnostic' }
  | { screen: 'Academy' };

export type RootStackParamList = {
  MainTabs: MainTabsParams;
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
  AuthLogin: undefined;
  AuthRegister: undefined;
  CreateProduct: undefined;
  CreateAcademyGuide: undefined;
  AcademyGuideDetail: { guideId: string };
  AcademyMyPurchases: undefined;
  AcademyMySales: undefined;
  MarketplaceMyPurchases: undefined;
  MarketplaceMySales: undefined;
  PlantDisease: undefined;
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
        <Stack.Screen name="AuthLogin" component={LoginScreen} />
        <Stack.Screen name="AuthRegister" component={RegisterScreen} />
        <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
        <Stack.Screen name="CreateAcademyGuide" component={CreateAcademyGuideScreen} />
        <Stack.Screen name="AcademyGuideDetail" component={AcademyGuideDetailScreen} />
        <Stack.Screen name="AcademyMyPurchases" component={AcademyMyPurchasesScreen} />
        <Stack.Screen name="AcademyMySales" component={AcademyMySalesScreen} />
        <Stack.Screen name="MarketplaceMyPurchases" component={MarketplaceMyPurchasesScreen} />
        <Stack.Screen name="MarketplaceMySales" component={MarketplaceMySalesScreen} />
        <Stack.Screen name="PlantDisease" component={PlantDiseaseScreen} />
        <Stack.Screen name="WeatherHome" component={WeatherHomeScreen} />
        <Stack.Screen name="Next7Days" component={Next7DaysScreen} />
        <Stack.Screen name="Forecast" component={ForecastScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
