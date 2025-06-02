// App.tsx - VERSÃO ULTRA SIMPLIFICADA QUE FUNCIONA

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './global.css';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import { ForgotPasswordScreen, LoginScreen, RegisterScreen } from './src/screens/auth';

// ==============================================================================
// 📋 TIPOS UNIFICADOS
// ==============================================================================

type AppStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

// ==============================================================================
// 🗺️ NAVIGATOR ÚNICO E SIMPLES
// ==============================================================================

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  console.log('🗺️ AppContent:', { isAuthenticated, isLoading, userEmail: user?.email });
  
  // Loading screen
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'white' 
      }}>
        <View style={{ 
          width: 80, 
          height: 80, 
          backgroundColor: '#3b82f6', 
          borderRadius: 40, 
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: 20
        }}>
          <Text style={{ color: 'white', fontSize: 30 }}>🚛</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>LogiTrack</Text>
        <Text style={{ color: '#666', marginBottom: 20 }}>Carregando...</Text>
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
        // Usuário autenticado - apenas Home por enquanto
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        // Usuário não autenticado - telas de auth
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
// 🚀 APP PRINCIPAL - ESTRUTURA MÍNIMA
// ==============================================================================

export default function App() {
  console.log('🚀 App: Inicializando versão ultra simplificada...');
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}