import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { maybeCompleteAuthSession } from 'expo-web-browser';

maybeCompleteAuthSession();
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@navigation/AppNavigator';
import { BuyerAppNavigator } from '@client/navigation/BuyerAppNavigator';
import { isBuyerApp } from '@config/appVariant';
import { CartProvider } from '@contexts/CartContext';
import { MarketplaceProvider } from '@contexts/MarketplaceContext';
import { AcademyProvider } from '@contexts/AcademyContext';
import { AuthProvider } from '@contexts/AuthContext';
import { LanguageProvider } from '@contexts/LanguageContext';

// Ignorer les warnings non bloquants (feature flags React Native)
LogBox.ignoreLogs([
  /Could not access feature flag/,
  /disableEventLoopOnBridgeless/,
  /\[runtime not ready\]/,
  /native module method was not available/,
]);

export default function App() {
  const Navigator = isBuyerApp() ? BuyerAppNavigator : AppNavigator;

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <MarketplaceProvider>
            <AcademyProvider>
              <CartProvider>
                <Navigator />
                <StatusBar style="auto" />
              </CartProvider>
            </AcademyProvider>
          </MarketplaceProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
