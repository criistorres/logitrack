// mobile/src/components/ui/LoadingScreen.tsx

import React from 'react';
import { Text, View } from 'react-native';
import { LoadingSpinner } from './Input';

// ==============================================================================
// ⏳ COMPONENTE DE TELA DE CARREGAMENTO
// ==============================================================================

/**
 * Tela de carregamento mostrada durante verificação de autenticação
 * 
 * 🎯 USO:
 * - Verificação inicial de tokens
 * - Carregamento de dados do usuário
 * - Transições entre estados de auth
 */
export function LoadingScreen() {
  console.log('⏳ LoadingScreen: Renderizando tela de carregamento');
  
  return (
    <View className="flex-1 bg-white items-center justify-center">
      {/* Logo */}
      <View className="w-24 h-24 bg-blue-500 rounded-full items-center justify-center mb-8">
        <Text className="text-white text-3xl font-bold">🚛</Text>
      </View>
      
      {/* Título */}
      <Text className="text-3xl font-bold text-gray-900 mb-2">
        LogiTrack
      </Text>
      
      <Text className="text-gray-600 mb-2">
        Sistema de Gerenciamento de Transporte
      </Text>
      
      <Text className="text-gray-500 text-sm mb-8">
        Carregando...
      </Text>
      
      {/* Spinner */}
      <LoadingSpinner size="large" color="#3b82f6" />
      
      {/* Informações de carregamento */}
      <View className="mt-8 px-8">
        <Text className="text-gray-500 text-sm text-center">
          Verificando suas credenciais...
        </Text>
        <Text className="text-gray-400 text-xs text-center mt-2">
          Isso pode levar alguns segundos
        </Text>
      </View>
      
      {/* Debug info apenas em desenvolvimento */}
      {__DEV__ && (
        <View className="mt-6 px-6">
          <Text className="text-gray-400 text-xs text-center">
            🛠️ Debug: Verificando estado de autenticação
          </Text>
        </View>
      )}
    </View>
  );
}