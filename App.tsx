import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { CartProvider } from './src/context/CartContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}