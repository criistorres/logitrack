// mobile/src/components/ots/TransferenciasModal.tsx - MODAL PARA ACEITAR/RECUSAR TRANSFERÊNCIAS

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

// ==============================================================================
// 🆕 IMPORTS DA API
// ==============================================================================
import { otService, TransferenciaOT } from '../../services';

// ==============================================================================
// 📋 INTERFACES
// ==============================================================================

interface TransferenciasModalProps {
  visible: boolean;
  onClose: () => void;
  onTransferenciaProcessada?: () => void;
}

interface TransferenciaDetalhada extends TransferenciaOT {
  ot_numero: string;
  ot_cliente: string;
  ot_endereco_entrega: string;
  ot_cidade_entrega: string;
  motorista_origem_nome: string;
  data_solicitacao: string;
}

/**
 * 🔄 Modal de Transferências Pendentes
 * 
 * ✅ Funcionalidades:
 * - Lista transferências aguardando aceitação
 * - Aceitar transferências com um clique
 * - Recusar com motivo obrigatório
 * - Refresh automático
 * - Feedback visual premium
 * - Integração com backend real
 */
export default function TransferenciasModal({ 
  visible, 
  onClose, 
  onTransferenciaProcessada 
}: TransferenciasModalProps) {
  const { user } = useAuth();
  
  // ==============================================================================
  // 📊 ESTADOS
  // ==============================================================================
  
  const [transferencias, setTransferencias] = useState<TransferenciaDetalhada[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Estado para recusa
  const [showRecusaModal, setShowRecusaModal] = useState(false);
  const [transferenciaParaRecusar, setTransferenciaParaRecusar] = useState<TransferenciaDetalhada | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState('');

  // ==============================================================================
  // 🔄 CARREGAMENTO DE DADOS
  // ==============================================================================
  
  const carregarTransferenciasPendentes = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('🔄 Carregando transferências pendentes...');
      
      const response = await otService.listarTransferenciasPendentes();
      
      if (response.success && response.data) {
        const transferenciasData = response.data.data || response.data;
        // Filtrar apenas as que estão aguardando aceitação do usuário atual
        const minhasTransferencias = transferenciasData.filter(
          (t: TransferenciaDetalhada) => 
            t.status === 'AGUARDANDO_ACEITACAO' && 
            t.motorista_destino_id === user.id
        );
        
        setTransferencias(minhasTransferencias);
        console.log(`✅ ${minhasTransferencias.length} transferências pendentes encontradas`);
      } else {
        throw new Error(response.error || 'Erro ao carregar transferências');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar transferências:', error);
      Alert.alert('Erro', 'Não foi possível carregar as transferências pendentes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarTransferenciasPendentes();
  }, [carregarTransferenciasPendentes]);

  // ==============================================================================
  // 🔧 HANDLERS DE AÇÕES
  // ==============================================================================

  const handleAceitar = useCallback(async (transferencia: TransferenciaDetalhada) => {
    setActionLoading(transferencia.id);
    
    try {
      console.log(`✅ Aceitando transferência ${transferencia.id}...`);
      
      const response = await otService.aceitarTransferencia(transferencia.id);
      
      if (response.success) {
        Alert.alert(
          'Transferência Aceita!',
          `A OT #${transferencia.ot_numero} foi transferida para você com sucesso.`,
          [{ text: 'OK' }]
        );
        
        // Remover da lista local
        setTransferencias(prev => prev.filter(t => t.id !== transferencia.id));
        
        // Callback para atualizar outras telas
        onTransferenciaProcessada?.();
        
        // Se não há mais transferências, fechar modal
        if (transferencias.length <= 1) {
          onClose();
        }
      } else {
        throw new Error(response.error || 'Erro ao aceitar transferência');
      }
    } catch (error) {
      console.error('❌ Erro ao aceitar transferência:', error);
      Alert.alert('Erro', 'Não foi possível aceitar a transferência.');
    } finally {
      setActionLoading(null);
    }
  }, [transferencias.length, onTransferenciaProcessada, onClose]);

  const handleRecusar = useCallback(async () => {
    if (!transferenciaParaRecusar || !motivoRecusa.trim()) {
      Alert.alert('Atenção', 'É obrigatório informar o motivo da recusa.');
      return;
    }
    
    setActionLoading(transferenciaParaRecusar.id);
    
    try {
      console.log(`❌ Recusando transferência ${transferenciaParaRecusar.id}...`);
      
      const response = await otService.recusarTransferencia(transferenciaParaRecusar.id, {
        observacao: motivoRecusa.trim()
      });
      
      if (response.success) {
        Alert.alert(
          'Transferência Recusada',
          `A transferência da OT #${transferenciaParaRecusar.ot_numero} foi recusada.`,
          [{ text: 'OK' }]
        );
        
        // Remover da lista local
        setTransferencias(prev => prev.filter(t => t.id !== transferenciaParaRecusar.id));
        
        // Limpar modal de recusa
        setShowRecusaModal(false);
        setTransferenciaParaRecusar(null);
        setMotivoRecusa('');
        
        // Callback para atualizar outras telas
        onTransferenciaProcessada?.();
        
        // Se não há mais transferências, fechar modal
        if (transferencias.length <= 1) {
          onClose();
        }
      } else {
        throw new Error(response.error || 'Erro ao recusar transferência');
      }
    } catch (error) {
      console.error('❌ Erro ao recusar transferência:', error);
      Alert.alert('Erro', 'Não foi possível recusar a transferência.');
    } finally {
      setActionLoading(null);
    }
  }, [transferenciaParaRecusar, motivoRecusa, transferencias.length, onTransferenciaProcessada, onClose]);

  const iniciarRecusa = useCallback((transferencia: TransferenciaDetalhada) => {
    setTransferenciaParaRecusar(transferencia);
    setShowRecusaModal(true);
  }, []);

  // ==============================================================================
  // 📱 EFEITOS
  // ==============================================================================
  
  useEffect(() => {
    if (visible) {
      carregarTransferenciasPendentes();
    }
  }, [visible, carregarTransferenciasPendentes]);

  // ==============================================================================
  // 🎨 COMPONENTES DE RENDERIZAÇÃO
  // ==============================================================================

  const renderTransferenciaCard = ({ item: transferencia }: { item: TransferenciaDetalhada }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-orange-100">
      {/* Header do Card */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800 mb-1">
            OT #{transferencia.ot_numero}
          </Text>
          <Text className="text-gray-600 text-sm">
            👤 {transferencia.ot_cliente}
          </Text>
        </View>
        <View className="bg-warning-100 px-3 py-1 rounded-full">
          <Text className="text-warning-700 text-xs font-semibold">
            ⏳ Pendente
          </Text>
        </View>
      </View>

      {/* Informações da Transferência */}
      <View className="space-y-2 mb-4">
        <View className="flex-row items-center">
          <Ionicons name="person-outline" size={16} color="#6B7280" />
          <Text className="text-gray-600 text-sm ml-2">
            Solicitado por: {transferencia.motorista_origem_nome}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text className="text-gray-600 text-sm ml-2 flex-1">
            {transferencia.ot_endereco_entrega}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <Ionicons name="business-outline" size={16} color="#6B7280" />
          <Text className="text-gray-600 text-sm ml-2">
            {transferencia.ot_cidade_entrega}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text className="text-gray-600 text-sm ml-2">
            {new Date(transferencia.data_solicitacao).toLocaleString('pt-BR')}
          </Text>
        </View>
      </View>

      {/* Motivo da Transferência */}
      {transferencia.motivo && (
        <View className="bg-blue-50 p-3 rounded-lg mb-4">
          <Text className="text-blue-700 text-sm font-medium mb-1">
            💬 Motivo da Transferência
          </Text>
          <Text className="text-blue-600 text-sm">
            {transferencia.motivo}
          </Text>
        </View>
      )}

      {/* Botões de Ação */}
      <View className="flex-row space-x-3">
        <TouchableOpacity
          className="flex-1 bg-danger-50 p-3 rounded-lg border border-danger-200"
          onPress={() => iniciarRecusa(transferencia)}
          disabled={actionLoading === transferencia.id}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="close" size={16} color="#DC2626" />
            <Text className="text-danger-600 font-semibold ml-2">
              Recusar
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-success-50 p-3 rounded-lg border border-success-200"
          onPress={() => handleAceitar(transferencia)}
          disabled={actionLoading === transferencia.id}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-center">
            {actionLoading === transferencia.id ? (
              <ActivityIndicator size="small" color="#16A34A" />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color="#16A34A" />
                <Text className="text-success-600 font-semibold ml-2">
                  Aceitar
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center py-12">
      <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="swap-horizontal-outline" size={48} color="#9CA3AF" />
      </View>
      <Text className="text-xl font-bold text-gray-800 mb-2">
        Nenhuma transferência pendente
      </Text>
      <Text className="text-gray-600 text-center px-8">
        Quando outros motoristas enviarem OTs para você, elas aparecerão aqui para aceitação.
      </Text>
    </View>
  );

  // ==============================================================================
  // 🎯 RENDERIZAÇÃO PRINCIPAL
  // ==============================================================================

  return (
    <>
      {/* ===== MODAL PRINCIPAL ===== */}
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 bg-gray-50 mt-20 rounded-t-xl">
            
            {/* Header */}
            <View className="bg-white px-4 py-4 border-b border-gray-100 rounded-t-xl">
              <View className="flex-row justify-between items-center">
                <Text className="text-xl font-bold text-gray-800">
                  🔄 Transferências Pendentes
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              {transferencias.length > 0 && (
                <Text className="text-gray-600 text-sm mt-2">
                  {transferencias.length} transferência{transferencias.length > 1 ? 's' : ''} aguardando sua resposta
                </Text>
              )}
            </View>

            {/* Lista de Transferências */}
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-600 mt-2">
                  Carregando transferências...
                </Text>
              </View>
            ) : (
              <FlatList
                data={transferencias}
                renderItem={renderTransferenciaCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ 
                  padding: 16,
                  flexGrow: 1
                }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#2563EB']}
                    tintColor="#2563EB"
                  />
                }
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* ===== MODAL DE RECUSA ===== */}
      <Modal
        visible={showRecusaModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRecusaModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-danger-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="close-circle" size={32} color="#DC2626" />
              </View>
              <Text className="text-xl font-bold text-gray-800 mb-2">
                Recusar Transferência
              </Text>
              {transferenciaParaRecusar && (
                <Text className="text-gray-600 text-center">
                  OT #{transferenciaParaRecusar.ot_numero} de {transferenciaParaRecusar.motorista_origem_nome}
                </Text>
              )}
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">
                Motivo da recusa *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl p-3 text-gray-800 bg-gray-50 h-24"
                placeholder="Ex: Já estou com muitas entregas hoje, não consigo aceitar mais..."
                value={motivoRecusa}
                onChangeText={setMotivoRecusa}
                multiline
                textAlignVertical="top"
              />
              <Text className="text-gray-500 text-xs mt-1">
                O motivo será enviado para o motorista solicitante
              </Text>
            </View>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 p-3 rounded-lg"
                onPress={() => {
                  setShowRecusaModal(false);
                  setMotivoRecusa('');
                  setTransferenciaParaRecusar(null);
                }}
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-danger-500 p-3 rounded-lg"
                onPress={handleRecusar}
                disabled={!motivoRecusa.trim() || actionLoading !== null}
                activeOpacity={0.7}
              >
                {actionLoading === transferenciaParaRecusar?.id ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-semibold text-center">
                    Confirmar Recusa
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ==============================================================================
// ✅ FUNCIONALIDADES IMPLEMENTADAS
// ==============================================================================

/**
 * 🎯 FUNCIONALIDADES COMPLETAS:
 * 
 * ✅ LISTAGEM INTELIGENTE:
 * - Filtra apenas transferências para o usuário atual
 * - Status "AGUARDANDO_ACEITACAO"
 * - Informações completas da OT
 * - Dados do motorista solicitante
 * 
 * ✅ ACEITAÇÃO RÁPIDA:
 * - Um clique para aceitar
 * - Feedback visual imediato
 * - Atualização automática da lista
 * - Integração com backend
 * 
 * ✅ RECUSA COM MOTIVO:
 * - Modal dedicado para recusa
 * - Motivo obrigatório
 * - Validação de campo
 * - Envio do motivo para solicitante
 * 
 * ✅ UX PREMIUM:
 * - Cards informativos
 * - Loading states
 * - Pull-to-refresh
 * - Animações suaves
 * - Empty state elegante
 * 
 * ✅ INTEGRAÇÃO:
 * - Callback para atualizar outras telas
 * - Fechamento automático quando vazio
 * - Refresh automático
 * - Estados consistentes
 * 
 * 🚀 RESULTADO: Sistema completo de transferências
 * que permite aos motoristas gerenciar solicitações
 * de forma eficiente e profissional!
 */