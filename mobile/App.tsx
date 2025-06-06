// mobile/App.tsx - VERSÃO CORRIGIDA SEM ERROS

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './global.css';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import { ForgotPasswordScreen, LoginScreen, RegisterScreen } from './src/screens/auth';
import { CriarOTScreen } from './src/screens/ots';

// ==============================================================================
// 📋 TIPOS DE NAVEGAÇÃO
// ==============================================================================

type AppStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  CriarOT: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

// ==============================================================================
// 🗺️ NAVIGATOR - ESTRUTURA LIMPA
// ==============================================================================

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  console.log('🗺️ AppContent:', { isAuthenticated, isLoading, userEmail: user?.email });
  
  // Loading screen
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <View className="w-20 h-20 bg-blue-500 rounded-full justify-center items-center mb-5">
          <Text className="text-white text-3xl">🚛</Text>
        </View>
        <Text className="text-2xl font-bold mb-2">LogiTrack</Text>
        <Text className="text-gray-600 mb-5">Carregando...</Text>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CriarOT" component={CriarOTScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// ==============================================================================
// 🚀 APP PRINCIPAL
// ==============================================================================

export default function App() {
  console.log('🚀 App: Inicializando LogiTrack...');
  
  return (
    <GestureHandlerRootView className="flex-1">
      <NavigationContainer>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}