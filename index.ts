// Masquer en dev l'avertissement RN "disableEventLoopOnBridgeless" (souvent non bloquant, décalage runtime)
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const originalError = console.error;
  const isBridgelessNoise = (args: unknown[]) => {
    const text = args.map((a) => (a instanceof Error ? a.message : String(a ?? ''))).join(' ');
    return (
      text.includes('disableEventLoopOnBridgeless') ||
      text.includes('Could not access feature flag') ||
      text.includes('[runtime not ready]') ||
      text.includes('native module method was not available')
    );
  };
  console.error = (...args: unknown[]) => {
    if (isBridgelessNoise(args)) return;
    originalError.apply(console, args);
  };
}

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
