// mobile/src/screens/PerfilScreen.tsx - TELA DE PERFIL SIMPLES

import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

/**
 * 👤 Tela de Perfil - Versão Simples para Tab Navigation
 * 
 * Funcionalidades:
 * - Exibir dados do usuário logado
 * - Logout seguro
 * - Informações do app
 */
export default function PerfilScreen() {
  const { user, logout } = useAuth();

  // ==============================================================================
  // 🔧 HANDLERS DE AÇÕES
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
              console.log('👤 Fazendo logout do usuário...');
              await logout();
            } catch (error) {
              console.error('❌ Erro no logout:', error);
              Alert.alert('Erro', 'Erro ao fazer logout. Tente novamente.');
            }
          },
        },
      ],
    );
  }, [logout]);

  const handleSobre = useCallback(() => {
    Alert.alert(
      'Sobre o LogiTrack',
      'LogiTrack v1.0.0\n\nSistema de gestão de transporte e logística.\n\nDesenvolvido com ❤️ para facilitar o trabalho dos motoristas.'
    );
  }, []);

  // ==============================================================================
  // 🎯 RENDERIZAÇÃO PRINCIPAL
  // ==============================================================================

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        
        {/* =====================================================================
             HEADER DE PERFIL
             ===================================================================== */}
        <View className="bg-white">
          <View className="items-center py-8 px-4">
            {/* Avatar do usuário */}
            <View className="w-24 h-24 bg-blue-500 rounded-full items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">
                {user?.nome?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '👤'}
              </Text>
            </View>
            
            {/* Informações do usuário */}
            <Text className="text-gray-800 text-xl font-bold mb-1">
              {user?.nome || 'Usuário LogiTrack'}
            </Text>
            <Text className="text-gray-600 text-base mb-2">
              {user?.email}
            </Text>
            
            {/* Badge de role */}
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-700 text-sm font-semibold capitalize">
                {user?.role === 'motorista' ? '🚛 Motorista' : 
                 user?.role === 'logistica' ? '📋 Logística' : 
                 user?.role === 'admin' ? '⚙️ Administrador' : 'Usuário'}
              </Text>
            </View>
          </View>
        </View>

        <View className="p-4">
          
          {/* =====================================================================
               SEÇÃO DE ESTATÍSTICAS RÁPIDAS
               ===================================================================== */}
          <View className="bg-white rounded-lg shadow-sm mb-4">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-gray-800 text-lg font-bold">
                Minhas Estatísticas
              </Text>
            </View>

            <View className="p-4">
              <View className="flex-row justify-between">
                {/* OTs Criadas */}
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-blue-500 mb-1">-</Text>
                  <Text className="text-gray-600 text-sm text-center">OTs Criadas</Text>
                </View>
                
                {/* OTs Finalizadas */}
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-green-500 mb-1">-</Text>
                  <Text className="text-gray-600 text-sm text-center">Finalizadas</Text>
                </View>
                
                {/* Este Mês */}
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-purple-500 mb-1">-</Text>
                  <Text className="text-gray-600 text-sm text-center">Este Mês</Text>
                </View>
              </View>
            </View>
          </View>

          {/* =====================================================================
               SEÇÃO DE INFORMAÇÕES
               ===================================================================== */}
          <View className="bg-white rounded-lg shadow-sm mb-4">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-gray-800 text-lg font-bold">
                Informações
              </Text>
            </View>

            {/* Sobre o App */}
            <TouchableOpacity 
              onPress={handleSobre}
              className="flex-row items-center p-4"
            >
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Text className="text-purple-600 text-lg">ℹ️</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 text-base font-semibold">
                  Sobre o LogiTrack
                </Text>
                <Text className="text-gray-500 text-sm">
                  Versão, informações e suporte
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">→</Text>
            </TouchableOpacity>
          </View>

          {/* =====================================================================
               BOTÃO DE LOGOUT
               ===================================================================== */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 rounded-lg p-4 items-center shadow-sm"
          >
            <Text className="text-white text-base font-semibold">
              Sair do Aplicativo
            </Text>
          </TouchableOpacity>

          {/* Espaçamento final para o tab bar */}
          <View className="h-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==============================================================================
// 📝 TELA SIMPLES MAS FUNCIONAL
// ==============================================================================

/**
 * ✅ FUNCIONALIDADES IMPLEMENTADAS:
 * 
 * 1. **Header de Perfil**
 *    - Avatar gerado com inicial do nome
 *    - Nome e email do usuário
 *    - Badge de role
 * 
 * 2. **Estatísticas**
 *    - Placeholder para futuras métricas
 *    - Layout responsivo
 * 
 * 3. **Informações**
 *    - Sobre o app
 *    - Preparado para mais opções
 * 
 * 4. **Logout Seguro**
 *    - Confirmação antes de sair
 *    - Integração com AuthContext
 * 
 * 🔄 FUTURAS IMPLEMENTAÇÕES:
 * - Edição de perfil
 * - Configurações detalhadas
 * - Estatísticas reais
 * - Upload de foto
 */