// Réduire le bruit en dev : masquer l'erreur "disableEventLoopOnBridgeless" (non bloquante)
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = String(args[0] ?? '');
    if (
      msg.includes('Could not access feature flag') ||
      msg.includes('disableEventLoopOnBridgeless') ||
      msg.includes('[runtime not ready]') ||
      msg.includes('native module method was not available')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
