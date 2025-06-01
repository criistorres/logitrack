// src/screens/LoginScreen.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';

// Tipagem da navegação
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

/**
 * Tela de Login - Exemplo básico
 * Posteriormente será implementada com formulário real
 */
export default function LoginScreen({ navigation }: Props) {
  const handleLogin = () => {
    // Por enquanto, apenas navega para Home
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-500">
      <StatusBar style="light" />
      
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo */}
        <View className="mb-8">
          <Text className="text-white text-4xl font-bold">LogiTrack</Text>
          <Text className="text-blue-200 text-center mt-2">
            Sistema de Gerenciamento de Transporte
          </Text>
        </View>
        
        {/* Card de Login */}
        <View className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
          <Text className="text-gray-800 text-xl font-bold mb-4 text-center">
            Bem-vindo!
          </Text>
          
          <Text className="text-gray-600 text-sm text-center mb-6">
            Esta é uma tela de exemplo. O formulário de login será implementado na próxima etapa.
          </Text>
          
          {/* Botão de Login */}
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-blue-500 py-3 rounded-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-bold text-lg">
              Entrar
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <Text className="text-blue-200 text-sm mt-8">
          Versão 1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
}