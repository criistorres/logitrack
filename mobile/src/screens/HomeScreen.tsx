// mobile/src/screens/HomeScreen.tsx - VERSÃO ATUALIZADA COM LISTA DE OTs

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

// ==============================================================================
// 📋 TIPOS DE NAVEGAÇÃO ATUALIZADOS
// ==============================================================================

type AppStackParamList = {
  Home: undefined;
  Login: undefined;
  CriarOT: undefined;
  ListaOTs: undefined;
  DetalhesOT: { otId: number };
};

type HomeScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

/**
 * 🏠 Tela Home - Dashboard Principal do LogiTrack
 * 
 * Funcionalidades:
 * - Dashboard com informações do motorista
 * - Navegação para funcionalidades principais
 * - Acesso rápido às OTs
 * - Logout seguro
 */
export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  
  // ==============================================================================
  // 🔧 HANDLERS DE NAVEGAÇÃO
  // ==============================================================================
  
  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair do aplicativo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.navigate('Login');
            } catch (error) {
              console.error('❌ Erro no logout:', error);
              Alert.alert('Erro', 'Erro ao fazer logout. Tente novamente.');
            }
          },
        },
      ],
    );
  }, [logout, navigation]);

  const handleCriarOT = useCallback(() => {
    console.log('📋 Navegando para Criar OT');
    navigation.navigate('CriarOT');
  }, [navigation]);

  const handleListaOTs = useCallback(() => {
    console.log('📋 Navegando para Lista de OTs');
    navigation.navigate('ListaOTs');
  }, [navigation]);

  // ==============================================================================
  // 🎯 RENDERIZAÇÃO PRINCIPAL
  // ==============================================================================

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          
          {/* =====================================================================
               HEADER DE BOAS-VINDAS
               ===================================================================== */}
          <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">🚛</Text>
              <View className="flex-1">
                <Text className="text-gray-800 text-xl font-bold">
                  Olá, {user?.nome || 'Motorista'}!
                </Text>
                <Text className="text-gray-600 text-base mt-1">
                  Bem-vindo ao LogiTrack
                </Text>
              </View>
            </View>
            
            {/* Status do Usuário */}
            <View className="mt-4 pt-4 border-t border-gray-100">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Text className="text-green-500 text-lg mr-2">●</Text>
                  <Text className="text-gray-700 font-semibold">Online</Text>
                </View>
                <Text className="text-gray-500 text-sm">
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>

          {/* =====================================================================
               CARDS DE ESTATÍSTICAS RÁPIDAS (Placeholder)
               ===================================================================== */}
          <View className="flex-row justify-between mb-6">
            <View className="bg-blue-500 rounded-lg p-4 flex-1 mr-2">
              <Text className="text-white text-2xl font-bold">-</Text>
              <Text className="text-blue-100 text-sm">OTs Ativas</Text>
            </View>
            
            <View className="bg-green-500 rounded-lg p-4 flex-1 ml-2">
              <Text className="text-white text-2xl font-bold">-</Text>
              <Text className="text-green-100 text-sm">Entregas Hoje</Text>
            </View>
          </View>

          {/* =====================================================================
               AÇÕES PRINCIPAIS
               ===================================================================== */}
          <View className="bg-white rounded-lg shadow-sm mb-4">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-gray-800 text-lg font-bold">
                Ações Principais
              </Text>
            </View>

            {/* Criar Nova OT - DESTAQUE */}
            <TouchableOpacity
              onPress={handleCriarOT}
              className="bg-blue-500 mx-4 mt-4 rounded-lg p-4 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Text className="text-2xl mr-3">📋</Text>
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

            {/* Minhas OTs - NOVO */}
            <TouchableOpacity
              onPress={handleListaOTs}
              className="p-4 mx-4 mt-3 bg-purple-50 border border-purple-200 rounded-lg flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Text className="text-2xl mr-3">📦</Text>
              <View className="flex-1">
                <Text className="text-purple-700 text-base font-semibold">
                  Minhas OTs
                </Text>
                <Text className="text-purple-600 text-sm">
                  Ver e gerenciar ordens em andamento
                </Text>
              </View>
              <Text className="text-purple-600 text-lg">→</Text>
            </TouchableOpacity>

            {/* Espaçamento interno */}
            <View className="h-4" />
          </View>

          {/* =====================================================================
               MENU SECUNDÁRIO
               ===================================================================== */}
          <View className="bg-white rounded-lg shadow-sm mb-4">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-gray-800 text-lg font-bold">
                Outras Opções
              </Text>
            </View>

            {/* Transferências (Placeholder) */}
            <TouchableOpacity 
              className="p-4 border-b border-gray-100 flex-row items-center"
              onPress={() => Alert.alert('Em Breve', 'Funcionalidade em desenvolvimento')}
            >
              <Text className="text-2xl mr-3">🔄</Text>
              <View className="flex-1">
                <Text className="text-gray-700 text-base font-semibold">
                  Transferências
                </Text>
                <Text className="text-gray-500 text-sm">
                  Gerenciar transferências de OT
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">→</Text>
            </TouchableOpacity>

            {/* Relatórios (Placeholder) */}
            <TouchableOpacity 
              className="p-4 border-b border-gray-100 flex-row items-center"
              onPress={() => Alert.alert('Em Breve', 'Funcionalidade em desenvolvimento')}
            >
              <Text className="text-2xl mr-3">📊</Text>
              <View className="flex-1">
                <Text className="text-gray-700 text-base font-semibold">
                  Relatórios
                </Text>
                <Text className="text-gray-500 text-sm">
                  Visualizar estatísticas e histórico
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">→</Text>
            </TouchableOpacity>

            {/* Perfil (Placeholder) */}
            <TouchableOpacity 
              className="p-4 flex-row items-center"
              onPress={() => Alert.alert('Em Breve', 'Funcionalidade em desenvolvimento')}
            >
              <Text className="text-2xl mr-3">👤</Text>
              <View className="flex-1">
                <Text className="text-gray-700 text-base font-semibold">
                  Meu Perfil
                </Text>
                <Text className="text-gray-500 text-sm">
                  Configurações e dados pessoais
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">→</Text>
            </TouchableOpacity>
          </View>

          {/* =====================================================================
               STATUS E INFORMAÇÕES
               ===================================================================== */}
          <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-800 text-lg font-bold">
                Status Atual
              </Text>
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-700 text-xs font-semibold">
                  DISPONÍVEL
                </Text>
              </View>
            </View>
            
            <Text className="text-gray-600 text-base">
              🟢 Pronto para receber novas OTs
            </Text>
          </View>

          {/* =====================================================================
               BOTÃO DE LOGOUT
               ===================================================================== */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 rounded-lg p-4 items-center mt-4"
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-semibold">
              Sair do App
            </Text>
          </TouchableOpacity>

          {/* Espaçamento final */}
          <View className="h-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==============================================================================
// 📝 MELHORIAS IMPLEMENTADAS
// ==============================================================================

/**
 * ✅ FUNCIONALIDADES ADICIONADAS:
 * 
 * 1. **Navegação para Lista de OTs**
 *    - Botão destacado "Minhas OTs" 
 *    - Design diferenciado com cor roxa
 *    - Navegação direta para ListaOTScreen
 * 
 * 2. **Interface Melhorada**
 *    - Header personalizado com nome do usuário
 *    - Status online/offline
 *    - Cards de estatísticas (placeholder)
 *    - Menu organizado por prioridade
 * 
 * 3. **UX Aprimorada**
 *    - Confirmação de logout
 *    - Feedback visual nos botões
 *    - Mensagens de "Em Breve" para funcionalidades futuras
 *    - Layout responsivo e organizado
 * 
 * 4. **Estrutura Preparada**
 *    - Handlers organizados e otimizados
 *    - Navegação tipada corretamente
 *    - Pronto para integração com estatísticas reais
 */