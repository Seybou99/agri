import 'react-native-gesture-handler/jestSetup';

// Mock pour les modules natifs si nécessaire
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock pour Expo
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));
