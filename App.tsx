import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@navigation/AppNavigator';

// Ignorer l'avertissement du feature flag bridgeless (non bloquant)
LogBox.ignoreLogs([
  'Could not access feature flag',
  'disableEventLoopOnBridgeless',
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
