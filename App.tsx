import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { maybeCompleteAuthSession } from 'expo-web-browser';

maybeCompleteAuthSession();
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@navigation/AppNavigator';
import { CartProvider } from '@contexts/CartContext';
import { MarketplaceProvider } from '@contexts/MarketplaceContext';
import { AcademyProvider } from '@contexts/AcademyContext';
import { AuthProvider } from '@contexts/AuthContext';

// Ignorer les warnings non bloquants (feature flags React Native)
LogBox.ignoreLogs([
  /Could not access feature flag/,
  /disableEventLoopOnBridgeless/,
  /\[runtime not ready\]/,
  /native module method was not available/,
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MarketplaceProvider>
          <AcademyProvider>
            <CartProvider>
              <AppNavigator />
              <StatusBar style="auto" />
            </CartProvider>
          </AcademyProvider>
        </MarketplaceProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
