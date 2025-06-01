// src/screens/HomeScreen.tsx

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';

// Tipagem da navegação
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
    // Voltar para login
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Header de Boas-vindas */}
          <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
            <Text className="text-gray-800 text-xl font-bold">
              Olá, Motorista!
            </Text>
            <Text className="text-gray-600 text-sm mt-1">
              Bem-vindo ao LogiTrack
            </Text>
          </View>
          
          {/* Cards de Status */}
          <View className="flex-row justify-between mb-4">
            <View className="bg-blue-500 rounded-lg p-4 flex-1 mr-2">
              <Text className="text-white text-2xl font-bold">0</Text>
              <Text className="text-blue-100 text-sm">OTs Ativas</Text>
            </View>
            
            <View className="bg-green-500 rounded-lg p-4 flex-1 ml-2">
              <Text className="text-white text-2xl font-bold">0</Text>
              <Text className="text-green-100 text-sm">Entregas Hoje</Text>
            </View>
          </View>
          
          {/* Menu de Opções */}
          <View className="bg-white rounded-lg shadow-sm">
            <TouchableOpacity className="p-4 border-b border-gray-200">
              <Text className="text-gray-800 font-semibold">📦 Nova OT</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="p-4 border-b border-gray-200">
              <Text className="text-gray-800 font-semibold">📋 Minhas OTs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="p-4 border-b border-gray-200">
              <Text className="text-gray-800 font-semibold">🔍 Buscar por NF</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="p-4">
              <Text className="text-gray-800 font-semibold">👤 Meu Perfil</Text>
            </TouchableOpacity>
          </View>
          
          {/* Botão de Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 rounded-lg p-4 mt-6"
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-bold">
              Sair do App
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}