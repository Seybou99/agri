import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@navigation/AppNavigator';
import { CartProvider } from '@contexts/CartContext';

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
      <CartProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </CartProvider>
    </SafeAreaProvider>
  );
}
