import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BuyerTabNavigator } from './BuyerTabNavigator';
import { ProductDetailScreen } from '@screens/ProductDetailScreen';
import { CartScreen } from '@screens/CartScreen';
import { CheckoutScreen } from '@screens/CheckoutScreen';
import { LoginScreen } from '@screens/LoginScreen';
import { RegisterScreen } from '@screens/RegisterScreen';
import { MarketplaceMyPurchasesScreen } from '@screens/MarketplaceMyPurchasesScreen';
import { AcademyGuideDetailScreen } from '@screens/AcademyGuideDetailScreen';
import { AcademyMyPurchasesScreen } from '@screens/AcademyMyPurchasesScreen';

export type BuyerRootStackParamList = {
  MainTabs: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  AuthLogin: undefined;
  AuthRegister: undefined;
  MarketplaceMyPurchases: undefined;
  AcademyGuideDetail: { guideId: string };
  AcademyMyPurchases: undefined;
};

export type BuyerNavigationProp = NativeStackNavigationProp<BuyerRootStackParamList>;

const Stack = createNativeStackNavigator<BuyerRootStackParamList>();

/** Navigation stack limitée à l'expérience acheteur (pas diagnostic / vente). */
export const BuyerAppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BuyerTabNavigator} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="AuthLogin" component={LoginScreen} />
      <Stack.Screen name="AuthRegister" component={RegisterScreen} />
      <Stack.Screen name="MarketplaceMyPurchases" component={MarketplaceMyPurchasesScreen} />
      <Stack.Screen name="AcademyGuideDetail" component={AcademyGuideDetailScreen} />
      <Stack.Screen name="AcademyMyPurchases" component={AcademyMyPurchasesScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
