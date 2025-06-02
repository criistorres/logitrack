// ==============================================================================
// 🏠 HOMESCREEN LOGITRACK - VERSÃO CORRIGIDA (SEM ERROS)
// ==============================================================================

// Arquivo: mobile/src/screens/HomeScreen.tsx
// SUBSTITUA o conteúdo atual por esta versão corrigida

import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, ScreenContainer, StatusBadge } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  
  console.log('🏠 HomeScreen: Renderizando versão profissional para:', user?.email);
  
  const handleLogout = async () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair do LogiTrack? Você precisará fazer login novamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            console.log('🚪 HomeScreen: Fazendo logout...');
            await logout();
          }
        }
      ]
    );
  };
  
  const showComingSoon = (feature: string) => {
    Alert.alert(
      `${feature} em Desenvolvimento`,
      `A funcionalidade "${feature}" será implementada nas próximas versões. Mantenha o app atualizado!`,
      [{ text: 'Entendi', style: 'default' }]
    );
  };
  
  // Determinar saudação baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };
  
  // Dados mockados para demonstração
  const quickStats = {
    otsAtivas: 3,
    entregasHoje: 8,
    pendencias: 1,
    performanceScore: 94
  };
  
  return (
    <ScreenContainer safeArea={false}>
      <View className="flex-1 bg-gradient-to-br from-neutral-50 to-primary-50">
        
        {/* Custom Header */}
        <View className="bg-white shadow-sm">
          <View className="pt-12 pb-4 px-5">
            <View className="flex-row items-center justify-between">
              {/* User Info */}
              <View className="flex-1">
                <Text className="text-neutral-500 text-sm">
                  {getGreeting()} 👋
                </Text>
                <Text className="text-neutral-900 text-xl font-bold">
                  {user?.first_name || 'Motorista'}
                </Text>
                <View className="flex-row items-center mt-1">
                  <StatusBadge 
                    status={user?.is_active ? 'entregue' : 'pendente'} 
                    size="sm" 
                  />
                  <Text className="text-neutral-500 text-xs ml-2">
                    {user?.role === 'motorista' ? 'Motorista' : 
                     user?.role === 'logistica' ? 'Logística' : 'Administrador'}
                  </Text>
                </View>
              </View>
              
              {/* Profile Button */}
              <TouchableOpacity 
                onPress={() => showComingSoon('Perfil do Usuário')}
                className="w-12 h-12 bg-primary-500 rounded-full items-center justify-center shadow-lg shadow-primary-500/30"
                activeOpacity={0.8}
              >
                <Text className="text-white text-lg">👤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-5">
            
            {/* Quick Stats */}
            <View className="mb-6">
              <Text className="text-neutral-900 text-lg font-bold mb-4">
                📊 Resumo de Hoje
              </Text>
              
              <View className="flex-row gap-3 mb-3">
                <Card variant="elevated" padding="md" className="flex-1 bg-primary-500">
                  <View className="items-center">
                    <Text className="text-white text-2xl font-bold">{quickStats.otsAtivas}</Text>
                    <Text className="text-primary-100 text-xs text-center">OTs Ativas</Text>
                  </View>
                </Card>
                
                <Card variant="elevated" padding="md" className="flex-1 bg-success-500">
                  <View className="items-center">
                    <Text className="text-white text-2xl font-bold">{quickStats.entregasHoje}</Text>
                    <Text className="text-success-100 text-xs text-center">Entregas Hoje</Text>
                  </View>
                </Card>
              </View>
              
              <View className="flex-row gap-3">
                <Card variant="elevated" padding="md" className="flex-1 bg-warning-500">
                  <View className="items-center">
                    <Text className="text-white text-2xl font-bold">{quickStats.pendencias}</Text>
                    <Text className="text-warning-100 text-xs text-center">Pendências</Text>
                  </View>
                </Card>
                
                <Card variant="elevated" padding="md" className="flex-1 bg-accent-500">
                  <View className="items-center">
                    <Text className="text-white text-2xl font-bold">{quickStats.performanceScore}%</Text>
                    <Text className="text-accent-100 text-xs text-center">Performance</Text>
                  </View>
                </Card>
              </View>
            </View>
            
            {/* Quick Actions */}
            <View className="mb-6">
              <Text className="text-neutral-900 text-lg font-bold mb-4">
                ⚡ Ações Rápidas
              </Text>
              
              <Card variant="elevated" padding="none">
                <TouchableOpacity 
                  onPress={() => showComingSoon('Nova OT')}
                  className="flex-row items-center p-4 border-b border-neutral-100 active:bg-neutral-50"
                  activeOpacity={1}
                >
                  <View className="w-12 h-12 bg-primary-100 rounded-xl items-center justify-center mr-4">
                    <Text className="text-primary-500 text-xl">📦</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-900 font-semibold text-base">Nova Ordem de Transporte</Text>
                    <Text className="text-neutral-500 text-sm">Criar uma nova OT para entrega</Text>
                  </View>
                  <Text className="text-neutral-400 text-lg">›</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => showComingSoon('Minhas OTs')}
                  className="flex-row items-center p-4 border-b border-neutral-100 active:bg-neutral-50"
                  activeOpacity={1}
                >
                  <View className="w-12 h-12 bg-accent-100 rounded-xl items-center justify-center mr-4">
                    <Text className="text-accent-500 text-xl">📋</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-900 font-semibold text-base">Minhas Ordens</Text>
                    <Text className="text-neutral-500 text-sm">Ver todas as OTs sob sua responsabilidade</Text>
                  </View>
                  <View className="items-end">
                    <View className="bg-accent-500 w-6 h-6 rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-bold">{quickStats.otsAtivas}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => showComingSoon('Buscar por NF')}
                  className="flex-row items-center p-4 border-b border-neutral-100 active:bg-neutral-50"
                  activeOpacity={1}
                >
                  <View className="w-12 h-12 bg-success-100 rounded-xl items-center justify-center mr-4">
                    <Text className="text-success-500 text-xl">🔍</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-900 font-semibold text-base">Buscar por Nota Fiscal</Text>
                    <Text className="text-neutral-500 text-sm">Localizar OT através do número da NF</Text>
                  </View>
                  <Text className="text-neutral-400 text-lg">›</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => showComingSoon('Scanner QR')}
                  className="flex-row items-center p-4 active:bg-neutral-50"
                  activeOpacity={1}
                >
                  <View className="w-12 h-12 bg-warning-100 rounded-xl items-center justify-center mr-4">
                    <Text className="text-warning-500 text-xl">📱</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-900 font-semibold text-base">Scanner QR Code</Text>
                    <Text className="text-neutral-500 text-sm">Escanear código QR para acesso rápido</Text>
                  </View>
                  <Text className="text-neutral-400 text-lg">›</Text>
                </TouchableOpacity>
              </Card>
            </View>
            
            {/* Recent Activity */}
            <View className="mb-6">
              <Text className="text-neutral-900 text-lg font-bold mb-4">
                📈 Atividade Recente
              </Text>
              
              <Card variant="elevated" padding="md">
                <View className="items-center py-8">
                  <View className="w-16 h-16 bg-neutral-100 rounded-2xl items-center justify-center mb-4">
                    <Text className="text-neutral-400 text-2xl">📊</Text>
                  </View>
                  <Text className="text-neutral-900 font-semibold text-base mb-2">
                    Histórico de Atividades
                  </Text>
                  <Text className="text-neutral-500 text-sm text-center leading-5">
                    Suas atividades recentes aparecerão{'\n'}aqui quando você começar a usar o app
                  </Text>
                  <Button
                    title="Ver Todas as Atividades"
                    onPress={() => showComingSoon('Histórico de Atividades')}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  />
                </View>
              </Card>
            </View>
            
            {/* Account Section */}
            <View className="mb-6">
              <Text className="text-neutral-900 text-lg font-bold mb-4">
                ⚙️ Conta e Configurações
              </Text>
              
              <Card variant="elevated" padding="none">
                <TouchableOpacity 
                  onPress={() => showComingSoon('Editar Perfil')}
                  className="flex-row items-center p-4 border-b border-neutral-100 active:bg-neutral-50"
                  activeOpacity={1}
                >
                  <View className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center mr-4">
                    <Text className="text-neutral-500 text-xl">👤</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-900 font-semibold text-base">Editar Perfil</Text>
                    <Text className="text-neutral-500 text-sm">{user?.email}</Text>
                  </View>
                  <Text className="text-neutral-400 text-lg">›</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => showComingSoon('Configurações')}
                  className="flex-row items-center p-4 border-b border-neutral-100 active:bg-neutral-50"
                  activeOpacity={1}
                >
                  <View className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center mr-4">
                    <Text className="text-neutral-500 text-xl">⚙️</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-900 font-semibold text-base">Configurações</Text>
                    <Text className="text-neutral-500 text-sm">Preferências e notificações</Text>
                  </View>
                  <Text className="text-neutral-400 text-lg">›</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => showComingSoon('Ajuda')}
                  className="flex-row items-center p-4 border-b border-neutral-100 active:bg-neutral-50"
                  activeOpacity={1}
                >
                  <View className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center mr-4">
                    <Text className="text-neutral-500 text-xl">❓</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-900 font-semibold text-base">Ajuda e Suporte</Text>
                    <Text className="text-neutral-500 text-sm">Central de ajuda e contato</Text>
                  </View>
                  <Text className="text-neutral-400 text-lg">›</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleLogout}
                  className="flex-row items-center p-4 active:bg-danger-50"
                  activeOpacity={1}
                >
                  <View className="w-12 h-12 bg-danger-100 rounded-xl items-center justify-center mr-4">
                    <Text className="text-danger-500 text-xl">🚪</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-danger-600 font-semibold text-base">Sair da Conta</Text>
                    <Text className="text-danger-400 text-sm">Desconectar do LogiTrack</Text>
                  </View>
                  <Text className="text-danger-400 text-lg">›</Text>
                </TouchableOpacity>
              </Card>
            </View>
            
            {/* App Info */}
            <Card variant="filled" padding="md" className="mb-8">
              <View className="items-center">
                <View className="w-12 h-12 bg-primary-500 rounded-2xl items-center justify-center mb-3">
                  <Text className="text-white text-xl">🚛</Text>
                </View>
                <Text className="text-neutral-900 font-bold text-lg mb-1">LogiTrack</Text>
                <Text className="text-neutral-600 text-sm text-center mb-3">
                  Sistema de Gerenciamento de Transporte
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-neutral-500 text-xs">Versão 1.0.0</Text>
                  <View className="w-1 h-1 bg-neutral-400 rounded-full mx-2" />
                  <Text className="text-neutral-500 text-xs">Feito com ❤️ para logística</Text>
                </View>
              </View>
            </Card>
            
            {/* Debug Info */}
            {__DEV__ && (
              <Card variant="outlined" padding="md" className="border-warning-200 bg-warning-50">
                <View className="flex-row items-start">
                  <Text className="text-warning-600 mr-3 text-lg">🔧</Text>
                  <View className="flex-1">
                    <Text className="text-warning-700 font-semibold text-sm mb-1">
                      Modo Desenvolvimento Ativo
                    </Text>
                    <Text className="text-warning-600 text-xs leading-4">
                      • Design profissional implementado{'\n'}
                      • Paleta de cores LogiTrack aplicada{'\n'}
                      • Componentes Tailwind CSS otimizados{'\n'}
                      • Navegação e autenticação funcionais
                    </Text>
                  </View>
                </View>
              </Card>
            )}
            
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}