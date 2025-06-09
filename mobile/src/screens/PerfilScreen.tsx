// mobile/src/screens/PerfilScreen.tsx - VERSÃO COMPLETA COM TAILWIND CSS

import React, { useCallback, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Switch,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// ===== IMPORT DO COMPONENTE SAFE AREA COM TAILWIND =====
import { TabScreenWrapper } from '../components/common/SafeScreenWrapper';

/**
 * 👤 Tela Perfil - Completa com Tailwind CSS
 * 
 * ✅ Funcionalidades:
 * - Informações do usuário
 * - Configurações do app
 * - Preferências
 * - Logout seguro
 * - Modal de confirmações
 * - Switch para configurações
 */
export default function PerfilScreen() {
  const { user, logout } = useAuth();
  
  // ==============================================================================
  // 📊 ESTADOS DA TELA
  // ==============================================================================
  
  const [notificacoes, setNotificacoes] = useState(true);
  const [localizacao, setLocalizacao] = useState(true);
  const [modoEscuro, setModoEscuro] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // ==============================================================================
  // 🔧 HANDLERS DE AÇÕES
  // ==============================================================================
  
  const handleLogout = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    try {
      setShowLogoutModal(false);
      await logout();
      Alert.alert('Logout', 'Você foi desconectado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer logout. Tente novamente.');
    }
  }, [logout]);

  const handleEditarPerfil = useCallback(() => {
    Alert.alert('Editar Perfil', 'Funcionalidade será implementada em breve.');
  }, []);

  const handleAlterarSenha = useCallback(() => {
    Alert.alert('Alterar Senha', 'Funcionalidade será implementada em breve.');
  }, []);

  const handleSuporte = useCallback(() => {
    Alert.alert(
      'Suporte LogiTrack',
      'Como podemos ajudar?\n\n📞 (11) 9999-9999\n📧 suporte@logitrack.com',
      [
        { text: 'Fechar', style: 'cancel' },
        { text: 'Ligar', onPress: () => Alert.alert('Ligando...') },
      ]
    );
  }, []);

  const handleSobre = useCallback(() => {
    setShowInfoModal(true);
  }, []);

  // ==============================================================================
  // 🎯 RENDERIZAÇÃO PRINCIPAL COM TAILWIND
  // ==============================================================================

  return (
    <TabScreenWrapper withPadding className="bg-gray-50">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
      >
        
        {/* =====================================================================
             HEADER DO PERFIL
             ===================================================================== */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <View className="items-center">
            {/* Avatar Grande */}
            <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="person" size={48} color="#2563EB" />
            </View>
            
            {/* Informações do Usuário */}
            <Text className="text-2xl font-bold text-gray-800 mb-1">
              {user?.nome || 'Usuário LogiTrack'}
            </Text>
            
            <View className={`
              px-4 py-2 rounded-full mb-4
              ${user?.role === 'MOTORISTA' ? 'bg-success-100' : 'bg-primary-100'}
            `}>
              <Text className={`
                text-sm font-semibold
                ${user?.role === 'MOTORISTA' ? 'text-success-700' : 'text-primary-700'}
              `}>
                {user?.role || 'USUÁRIO'}
              </Text>
            </View>
            
            {/* Botão Editar Perfil */}
            <TouchableOpacity
              className="bg-primary-50 px-6 py-3 rounded-lg border border-primary-200"
              onPress={handleEditarPerfil}
              activeOpacity={0.7}
            >
              <Text className="text-primary-700 font-semibold">
                ✏️ Editar Perfil
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =====================================================================
             SEÇÃO CONTA
             ===================================================================== */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-lg">
          <Text className="text-lg font-bold text-gray-800 mb-4 px-2">
            👤 Conta
          </Text>
          
          {/* Alterar Senha */}
          <TouchableOpacity
            className="flex-row items-center p-3 rounded-lg bg-gray-50 mb-3"
            onPress={handleAlterarSenha}
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 bg-warning-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="key-outline" size={20} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Alterar Senha</Text>
              <Text className="text-gray-500 text-sm">Manter conta segura</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Informações Pessoais */}
          <View className="p-3 rounded-lg bg-gray-50">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="card-outline" size={20} color="#2563EB" />
              </View>
              <Text className="text-gray-800 font-medium">Informações Pessoais</Text>
            </View>
            <View className="ml-13">
              <Text className="text-gray-600 text-sm mb-1">
                Email: {user?.email || 'Não informado'}
              </Text>
              <Text className="text-gray-600 text-sm">
                ID: #{user?.id || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* =====================================================================
             SEÇÃO CONFIGURAÇÕES
             ===================================================================== */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-lg">
          <Text className="text-lg font-bold text-gray-800 mb-4 px-2">
            ⚙️ Configurações
          </Text>
          
          {/* Notificações */}
          <View className="flex-row items-center justify-between p-3 rounded-lg bg-gray-50 mb-3">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-accent-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="notifications-outline" size={20} color="#F97316" />
              </View>
              <View>
                <Text className="text-gray-800 font-medium">Notificações</Text>
                <Text className="text-gray-500 text-sm">Alertas de OTs e entregas</Text>
              </View>
            </View>
            <Switch
              value={notificacoes}
              onValueChange={setNotificacoes}
              trackColor={{ false: '#E5E7EB', true: '#DBEAFE' }}
              thumbColor={notificacoes ? '#2563EB' : '#9CA3AF'}
            />
          </View>

          {/* Localização */}
          <View className="flex-row items-center justify-between p-3 rounded-lg bg-gray-50 mb-3">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-success-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="location-outline" size={20} color="#16A34A" />
              </View>
              <View>
                <Text className="text-gray-800 font-medium">Localização</Text>
                <Text className="text-gray-500 text-sm">GPS para rastreamento</Text>
              </View>
            </View>
            <Switch
              value={localizacao}
              onValueChange={setLocalizacao}
              trackColor={{ false: '#E5E7EB', true: '#DCFCE7' }}
              thumbColor={localizacao ? '#16A34A' : '#9CA3AF'}
            />
          </View>

          {/* Modo Escuro */}
          <View className="flex-row items-center justify-between p-3 rounded-lg bg-gray-50">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
                <Ionicons name="moon-outline" size={20} color="#6B7280" />
              </View>
              <View>
                <Text className="text-gray-800 font-medium">Modo Escuro</Text>
                <Text className="text-gray-500 text-sm">Em desenvolvimento</Text>
              </View>
            </View>
            <Switch
              value={modoEscuro}
              onValueChange={setModoEscuro}
              trackColor={{ false: '#E5E7EB', true: '#F3F4F6' }}
              thumbColor={modoEscuro ? '#6B7280' : '#9CA3AF'}
              disabled={true}
            />
          </View>
        </View>

        {/* =====================================================================
             SEÇÃO SUPORTE
             ===================================================================== */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-lg">
          <Text className="text-lg font-bold text-gray-800 mb-4 px-2">
            🆘 Suporte
          </Text>
          
          {/* Falar com Suporte */}
          <TouchableOpacity
            className="flex-row items-center p-3 rounded-lg bg-gray-50 mb-3"
            onPress={handleSuporte}
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="help-circle-outline" size={20} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Falar com Suporte</Text>
              <Text className="text-gray-500 text-sm">Dúvidas e problemas técnicos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Sobre o App */}
          <TouchableOpacity
            className="flex-row items-center p-3 rounded-lg bg-gray-50"
            onPress={handleSobre}
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 bg-accent-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="information-circle-outline" size={20} color="#F97316" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Sobre o LogiTrack</Text>
              <Text className="text-gray-500 text-sm">Versão e informações</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* =====================================================================
             BOTÃO LOGOUT
             ===================================================================== */}
        <TouchableOpacity
          className="bg-danger-50 p-4 rounded-xl flex-row items-center justify-center border border-danger-200 mb-6"
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color="#DC2626" />
          <Text className="text-danger-600 font-bold text-lg ml-2">
            Sair da Conta
          </Text>
        </TouchableOpacity>

        {/* Espaçamento final */}
        <View className="h-6" />
      </ScrollView>

      {/* =====================================================================
           MODAL DE CONFIRMAÇÃO DE LOGOUT
           ===================================================================== */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-danger-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="log-out-outline" size={32} color="#DC2626" />
              </View>
              <Text className="text-xl font-bold text-gray-800 mb-2">
                Sair da Conta
              </Text>
              <Text className="text-gray-600 text-center">
                Tem certeza que deseja sair? Você precisará fazer login novamente.
              </Text>
            </View>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 p-3 rounded-lg"
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-danger-500 p-3 rounded-lg"
                onPress={confirmLogout}
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold text-center">
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =====================================================================
           MODAL SOBRE O APP
           ===================================================================== */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-xl p-6">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="car-outline" size={32} color="#2563EB" />
              </View>
              <Text className="text-2xl font-bold text-gray-800 mb-2">
                LogiTrack
              </Text>
              <Text className="text-gray-600 text-center mb-4">
                Sistema de Gestão de Ordens de Transporte
              </Text>
            </View>
            
            <View className="space-y-2 mb-6">
              <Text className="text-gray-700">
                <Text className="font-semibold">Versão:</Text> 1.0.0
              </Text>
              <Text className="text-gray-700">
                <Text className="font-semibold">Build:</Text> 2024.06.09
              </Text>
              <Text className="text-gray-700">
                <Text className="font-semibold">Desenvolvido por:</Text> LogiTrack Team
              </Text>
            </View>
            
            <TouchableOpacity
              className="bg-primary-500 p-4 rounded-lg"
              onPress={() => setShowInfoModal(false)}
              activeOpacity={0.7}
            >
              <Text className="text-white font-semibold text-center">
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TabScreenWrapper>
  );
}

// ==============================================================================
// ✅ CARACTERÍSTICAS DESTA VERSÃO COMPLETA
// ==============================================================================

/**
 * 🎯 FUNCIONALIDADES IMPLEMENTADAS:
 * 
 * ✅ PERFIL COMPLETO:
 * - Avatar e informações do usuário
 * - Edição de perfil (preparado)
 * - Alteração de senha (preparado)
 * - Informações pessoais
 * 
 * ✅ CONFIGURAÇÕES:
 * - Switch para notificações
 * - Switch para localização
 * - Modo escuro (preparado)
 * - Configurações salvas no estado
 * 
 * ✅ SUPORTE:
 * - Contato com suporte
 * - Informações do app
 * - Modal sobre o LogiTrack
 * 
 * ✅ LOGOUT SEGURO:
 * - Modal de confirmação
 * - Feedback visual
 * - Integração com AuthContext
 * 
 * ✅ TAILWIND CSS 100%:
 * - Todas as classes Tailwind
 * - Cores personalizadas LogiTrack
 * - Componentes consistentes
 * - Zero estilos inline
 * 
 * ✅ UX PREMIUM:
 * - Modais animados
 * - Switches interativos
 * - Feedback visual consistente
 * - Navegação fluida
 * 
 * 🚀 RESULTADO: Tela de perfil profissional e completa!
 */