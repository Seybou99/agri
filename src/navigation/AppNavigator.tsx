import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { FieldReportScreen } from '@screens/FieldReportScreen';
import { DiagnosticMapScreen } from '@screens/DiagnosticMapScreen';
import { DiagnosticConfigScreen } from '@screens/DiagnosticConfigScreen';

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
};

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
      </Stack.Navigator>
    </NavigationContainer>
  );
};
