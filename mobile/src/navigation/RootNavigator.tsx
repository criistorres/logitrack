// src/navigation/RootNavigator.tsx

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Text, View } from 'react-native';
import { LoadingSpinner } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import AuthNavigator from './AuthNavigator';

// ==============================================================================
// 🌐 NAVEGADOR PRINCIPAL CORRIGIDO
// ==============================================================================

export default function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  console.log('🗺️ RootNavigator: Estado atual', {
    isAuthenticated,
    isLoading,
    userEmail: user?.email
  });
  
  // Tela de carregamento enquanto verifica autenticação
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <NavigationContainer>
      {isAuthenticated ? (
        // Usuário autenticado - mostrar tela principal diretamente
        <HomeScreen />
      ) : (
        // Usuário não autenticado - mostrar navegador de auth
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

// ==============================================================================
// ⏳ TELA DE CARREGAMENTO
// ==============================================================================

function LoadingScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      {/* Logo */}
      <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-6">
        <Text className="text-white text-2xl font-bold">🚛</Text>
      </View>
      
      {/* Título */}
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        LogiTrack
      </Text>
      
      <Text className="text-gray-600 mb-8">
        Carregando...
      </Text>
      
      {/* Spinner */}
      <LoadingSpinner size="large" color="#3b82f6" />
      
      {/* Informações de carregamento */}
      <View className="mt-8 px-8">
        <Text className="text-gray-500 text-sm text-center">
          Verificando suas credenciais...
        </Text>
      </View>
    </View>
  );
}