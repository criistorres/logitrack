// mobile/src/screens/HomeScreen.tsx - VERSÃO COM TAILWIND

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';

// ==============================================================================
// 📋 TIPOS DE NAVEGAÇÃO
// ==============================================================================

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  CriarOT: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

/**
 * Tela Home - Dashboard principal
 * Mostra informações básicas e navegação
 */
export default function HomeScreen({ navigation }: Props) {
  const handleLogout = () => {
    navigation.navigate('Login');
  };

  const handleCriarOT = () => {
    navigation.navigate('CriarOT');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Header de Boas-vindas */}
          <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
            <Text className="text-gray-800 text-xl font-bold">
              Olá, Motorista! 🚛
            </Text>
            <Text className="text-gray-600 text-base mt-1">
              Bem-vindo ao LogiTrack
            </Text>
          </View>

          {/* Card Ações Principais */}
          <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
            <Text className="text-gray-800 text-lg font-bold mb-4">
              Ações Principais
            </Text>

            {/* Botão Criar Nova OT - DESTAQUE */}
            <TouchableOpacity
              onPress={handleCriarOT}
              className="bg-blue-500 rounded-lg p-4 flex-row items-center justify-center mb-3"
            >
              <Text className="text-2xl mr-2">📋</Text>
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">
                  Criar Nova OT
                </Text>
                <Text className="text-blue-100 text-sm">
                  Iniciar uma nova ordem de transporte
                </Text>
              </View>
              <Text className="text-white text-lg">→</Text>
            </TouchableOpacity>

            {/* Outros botões (placeholder) */}
            <TouchableOpacity className="bg-gray-100 rounded-lg p-4 flex-row items-center justify-center mb-3">
              <Text className="text-2xl mr-2">📦</Text>
              <View className="flex-1">
                <Text className="text-gray-600 text-base font-semibold">
                  Minhas OTs
                </Text>
                <Text className="text-gray-500 text-sm">
                  Ver ordens em andamento
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">→</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-100 rounded-lg p-4 flex-row items-center justify-center">
              <Text className="text-2xl mr-2">🔄</Text>
              <View className="flex-1">
                <Text className="text-gray-600 text-base font-semibold">
                  Transferências
                </Text>
                <Text className="text-gray-500 text-sm">
                  Gerenciar transferências de OT
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">→</Text>
            </TouchableOpacity>
          </View>

          {/* Card de Status */}
          <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
            <Text className="text-gray-800 text-lg font-bold mb-3">
              Status Atual
            </Text>
            <Text className="text-gray-600 text-base">
              🟢 Online e pronto para trabalhar
            </Text>
          </View>

          {/* Botão de Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 rounded-lg p-4 items-center mt-5"
          >
            <Text className="text-white text-base font-semibold">
              Sair do App
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}