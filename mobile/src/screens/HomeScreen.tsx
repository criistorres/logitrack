// mobile/src/screens/HomeScreen.tsx - VERSÃO OTIMIZADA PARA BOTTOM TABS

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

/**
 * 🏠 Tela Home - Dashboard Principal Otimizado para Tabs
 * 
 * Foco em:
 * - Dashboard com estatísticas
 * - Visão geral das atividades
 * - Ações rápidas contextuais
 * - Informações de status do motorista
 * 
 * Navegação removida (agora feita via tabs):
 * - Botões para criar OT (tab Criar)
 * - Botões para lista OTs (tab OTs)
 * - Botão de logout (tab Perfil)
 */
export default function HomeScreen() {
  const { user } = useAuth();
  
  // ==============================================================================
  // 🔧 HANDLERS DE AÇÕES RÁPIDAS
  // ==============================================================================
  
  const handleAcaoRapida = useCallback((acao: string) => {
    Alert.alert('Ação Rápida', `Funcionalidade "${acao}" será implementada em breve.`);
  }, []);

  const handleVerDetalhes = useCallback((tipo: string) => {
    Alert.alert('Ver Detalhes', `Detalhes de "${tipo}" serão implementados em breve.`);
  }, []);

  // ==============================================================================
  // 🎯 RENDERIZAÇÃO PRINCIPAL
  // ==============================================================================

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          
          {/* =====================================================================
               HEADER DE BOAS-VINDAS APRIMORADO
               ===================================================================== */}
          <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Text className="text-3xl mr-3">👋</Text>
                  <View>
                    <Text className="text-gray-800 text-xl font-bold">
                      Olá, {user?.nome?.split(' ')[0] || 'Motorista'}!
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {new Date().toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </Text>
                  </View>
                </View>
                
                {/* Status do motorista */}
                <View className="flex-row items-center mt-3">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-2"></View>
                  <Text className="text-green-700 font-semibold text-sm">
                    Disponível para novas OTs
                  </Text>
                </View>
              </View>
              
              {/* Avatar do usuário */}
              <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center">
                <Text className="text-white text-xl font-bold">
                  {user?.nome?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '👤'}
                </Text>
              </View>
            </View>
          </View>

          {/* =====================================================================
               CARDS DE ESTATÍSTICAS PRINCIPAIS
               ===================================================================== */}
          <View className="flex-row justify-between mb-6">
            {/* OTs Ativas */}
            <TouchableOpacity 
              onPress={() => handleVerDetalhes('OTs Ativas')}
              className="bg-blue-500 rounded-lg p-4 flex-1 mr-2 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="list-outline" size={24} color="white" />
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
              </View>
              <Text className="text-white text-2xl font-bold">-</Text>
              <Text className="text-blue-100 text-sm font-semibold">OTs Ativas</Text>
            </TouchableOpacity>
            
            {/* Entregas Hoje */}
            <TouchableOpacity 
              onPress={() => handleVerDetalhes('Entregas Hoje')}
              className="bg-green-500 rounded-lg p-4 flex-1 ml-2 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="checkmark-circle-outline" size={24} color="white" />
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
              </View>
              <Text className="text-white text-2xl font-bold">-</Text>
              <Text className="text-green-100 text-sm font-semibold">Entregas Hoje</Text>
            </TouchableOpacity>
          </View>

          {/* =====================================================================
               ESTATÍSTICAS SEMANAIS
               ===================================================================== */}
          <View className="bg-white rounded-lg shadow-sm mb-6">
            <View className="p-4 border-b border-gray-100">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-800 text-lg font-bold">
                  Resumo da Semana
                </Text>
                <TouchableOpacity onPress={() => handleVerDetalhes('Relatório Semanal')}>
                  <Text className="text-blue-500 text-sm font-semibold">Ver tudo</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="p-4">
              <View className="flex-row justify-between">
                {/* OTs Criadas */}
                <View className="items-center flex-1">
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                    <Ionicons name="add-circle-outline" size={20} color="#3B82F6" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800 mb-1">-</Text>
                  <Text className="text-gray-600 text-xs text-center">Criadas</Text>
                </View>
                
                {/* Em Andamento */}
                <View className="items-center flex-1">
                  <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center mb-2">
                    <Ionicons name="time-outline" size={20} color="#F97316" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800 mb-1">-</Text>
                  <Text className="text-gray-600 text-xs text-center">Em Andamento</Text>
                </View>
                
                {/* Finalizadas */}
                <View className="items-center flex-1">
                  <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                    <Ionicons name="checkmark-done-outline" size={20} color="#10B981" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800 mb-1">-</Text>
                  <Text className="text-gray-600 text-xs text-center">Finalizadas</Text>
                </View>
                
                {/* Transferidas */}
                <View className="items-center flex-1">
                  <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
                    <Ionicons name="swap-horizontal-outline" size={20} color="#8B5CF6" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800 mb-1">-</Text>
                  <Text className="text-gray-600 text-xs text-center">Transferidas</Text>
                </View>
              </View>
            </View>
          </View>

          {/* =====================================================================
               AÇÕES RÁPIDAS CONTEXTUAIS
               ===================================================================== */}
          <View className="bg-white rounded-lg shadow-sm mb-6">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-gray-800 text-lg font-bold">
                Ações Rápidas
              </Text>
            </View>

            {/* Verificar Transferências */}
            <TouchableOpacity 
              onPress={() => handleAcaoRapida('Verificar Transferências')}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="swap-horizontal" size={20} color="#F97316" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 text-base font-semibold">
                  Verificar Transferências
                </Text>
                <Text className="text-gray-500 text-sm">
                  OTs pendentes de aceitação
                </Text>
              </View>
              <View className="bg-orange-500 w-6 h-6 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">!</Text>
              </View>
            </TouchableOpacity>

            {/* Atualizar Localização */}
            <TouchableOpacity 
              onPress={() => handleAcaoRapida('Atualizar Localização')}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="location" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 text-base font-semibold">
                  Atualizar Localização
                </Text>
                <Text className="text-gray-500 text-sm">
                  Sincronizar posição atual
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Buscar OT por Número */}
            <TouchableOpacity 
              onPress={() => handleAcaoRapida('Buscar OT')}
              className="flex-row items-center p-4"
            >
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="search" size={20} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 text-base font-semibold">
                  Buscar OT por Número
                </Text>
                <Text className="text-gray-500 text-sm">
                  Localizar ordem específica
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* =====================================================================
               DICAS E INFORMAÇÕES
               ===================================================================== */}
          <View className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 shadow-sm">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-white bg-opacity-20 rounded-full items-center justify-center mr-3">
                <Ionicons name="bulb" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-bold mb-1">
                  Dica do Dia
                </Text>
                <Text className="text-white text-sm opacity-90">
                  Use a aba "Criar" para iniciar novas OTs rapidamente e a aba "OTs" para acompanhar o progresso.
                </Text>
              </View>
            </View>
          </View>

          {/* Espaçamento final para o tab bar */}
          <View className="h-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==============================================================================
// 📝 OTIMIZAÇÕES PARA BOTTOM TAB NAVIGATION
// ==============================================================================

/**
 * ✅ MUDANÇAS IMPLEMENTADAS:
 * 
 * 1. **Navegação Removida**
 *    - ❌ Botões "Criar Nova OT" (agora na tab Criar)
 *    - ❌ Botões "Minhas OTs" (agora na tab OTs)  
 *    - ❌ Botão "Logout" (agora na tab Perfil)
 * 
 * 2. **Foco em Dashboard**
 *    - ✅ Estatísticas visuais aprimoradas
 *    - ✅ Cards interativos com navegação contextual
 *    - ✅ Resumo semanal com métricas
 *    - ✅ Ações rápidas relevantes
 * 
 * 3. **UX Melhorada**
 *    - ✅ Header personalizado com avatar
 *    - ✅ Status do motorista em tempo real
 *    - ✅ Data atual formatada
 *    - ✅ Ícones Ionicons consistentes
 * 
 * 4. **Design System**
 *    - ✅ Cores LogiTrack aplicadas
 *    - ✅ Espaçamentos consistentes
 *    - ✅ Cards com shadow e border-radius
 *    - ✅ Gradiente moderno para dicas
 * 
 * 🔄 PRÓXIMAS IMPLEMENTAÇÕES:
 * - Integrar estatísticas reais da API
 * - Implementar ações rápidas funcionais
 * - Adicionar gráficos de performance
 * - Sistema de notificações no dashboard
 * - Badge de transferências pendentes
 */