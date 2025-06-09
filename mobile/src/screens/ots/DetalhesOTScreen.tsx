// mobile/src/screens/ots/DetalhesOTScreen.tsx - TELA DE DETALHES DA OT

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// ==============================================================================
// 🆕 IMPORTS DA API
// ==============================================================================
import { otService, OT } from '../../services';

// ===== IMPORT DO COMPONENTE SAFE AREA COM TAILWIND =====
import { TabScreenWrapper } from '../../components/common/SafeScreenWrapper';

// ==============================================================================
// 📋 TIPOS DE NAVEGAÇÃO
// ==============================================================================

type OTsStackParamList = {
  ListaOTs: undefined;
  DetalhesOT: { otId: number };
  AtualizarStatus: { ot: OT };
};

type DetalhesOTRouteProp = RouteProp<OTsStackParamList, 'DetalhesOT'>;
type DetalhesOTNavigationProp = StackNavigationProp<OTsStackParamList, 'DetalhesOT'>;

/**
 * 📋 Tela Detalhes da OT - Visualização Completa
 * 
 * ✅ Funcionalidades:
 * - Carregamento de detalhes via API
 * - Visualização completa dos dados
 * - Status badge visual
 * - Botões de ação (sem implementação ainda)
 * - Pull-to-refresh
 * - Loading states
 * - Tratamento de erros
 */
export default function DetalhesOTScreen() {
  const route = useRoute<DetalhesOTRouteProp>();
  const navigation = useNavigation<DetalhesOTNavigationProp>();
  const { otId } = route.params;
  
  // ==============================================================================
  // 📊 ESTADOS DA TELA
  // ==============================================================================
  
  const [ot, setOt] = useState<OT | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==============================================================================
  // 🎨 CONFIGURAÇÕES DE STATUS
  // ==============================================================================
  
  const getStatusConfig = (status: string) => {
    const configs = {
      'CRIADA': {
        cor: 'bg-primary-500',
        corTexto: 'text-primary-700',
        corFundo: 'bg-primary-50',
        emoji: '🆕',
        label: 'Iniciada'
      },
      'INICIADA': {
        cor: 'bg-primary-500',
        corTexto: 'text-primary-700',
        corFundo: 'bg-primary-50',
        emoji: '🆕',
        label: 'Iniciada'
      },
      'EM_CARREGAMENTO': {
        cor: 'bg-warning-500',
        corTexto: 'text-warning-700',
        corFundo: 'bg-warning-50',
        emoji: '📦',
        label: 'Em Carregamento'
      },
      'EM_TRANSITO': {
        cor: 'bg-accent-500',
        corTexto: 'text-accent-700',
        corFundo: 'bg-accent-50',
        emoji: '🚛',
        label: 'Em Trânsito'
      },
      'ENTREGUE': {
        cor: 'bg-success-500',
        corTexto: 'text-success-700',
        corFundo: 'bg-success-50',
        emoji: '✅',
        label: 'Entregue'
      },
      'ENTREGUE_PARCIAL': {
        cor: 'bg-yellow-500',
        corTexto: 'text-yellow-700',
        corFundo: 'bg-yellow-50',
        emoji: '⚠️',
        label: 'Entregue Parcial'
      },
      'CANCELADA': {
        cor: 'bg-danger-500',
        corTexto: 'text-danger-700',
        corFundo: 'bg-danger-50',
        emoji: '❌',
        label: 'Cancelada'
      }
    };

    return configs[status] || {
      cor: 'bg-gray-500',
      corTexto: 'text-gray-700',
      corFundo: 'bg-gray-50',
      emoji: '❓',
      label: status
    };
  };

  // ==============================================================================
  // 🔄 FUNÇÕES DE CARREGAMENTO
  // ==============================================================================
  
  const carregarDetalhes = useCallback(async () => {
    try {
      console.log(`📋 Carregando detalhes da OT ${otId}...`);
      setError(null);
      
      const response = await otService.obterDetalhesOT(otId);
      
      if (response.success && response.data?.data) {
        setOt(response.data.data);
        console.log('✅ Detalhes carregados:', response.data.data.numero_ot);
      } else {
        throw new Error(response.message || 'Erro ao carregar detalhes');
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao carregar detalhes:', error);
      setError('Erro ao carregar detalhes da OT');
      Alert.alert(
        'Erro',
        'Não foi possível carregar os detalhes da OT. Verifique sua conexão.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [otId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarDetalhes();
  }, [carregarDetalhes]);

  // ==============================================================================
  // 🔧 HANDLERS DE BOTÕES (SEM IMPLEMENTAÇÃO)
  // ==============================================================================
  
  const handleAtualizarStatus = useCallback(() => {
    if (!ot) return;
    navigation.navigate('AtualizarStatus', { ot });
  }, [ot, navigation]);

  const handleTransferir = useCallback(() => {
    Alert.alert('Transferir OT', 'Funcionalidade será implementada em breve.');
  }, []);

  const handleFinalizar = useCallback(() => {
    Alert.alert('Finalizar OT', 'Funcionalidade será implementada em breve.');
  }, []);

  const handleAdicionarArquivo = useCallback(() => {
    Alert.alert('Adicionar Arquivo', 'Funcionalidade será implementada em breve.');
  }, []);

  // ==============================================================================
  // 📱 EFEITOS
  // ==============================================================================
  
  useEffect(() => {
    carregarDetalhes();
  }, [carregarDetalhes]);

  // ==============================================================================
  // 🎨 COMPONENTES DE RENDERIZAÇÃO
  // ==============================================================================

  const renderStatusBadge = () => {
    if (!ot) return null;
    
    const config = getStatusConfig(ot.status);
    
    return (
      <View className={`px-4 py-2 rounded-full flex-row items-center ${config.corFundo} border border-gray-200`}>
        <Text className="text-lg mr-2">{config.emoji}</Text>
        <Text className={`text-sm font-bold ${config.corTexto}`}>
          {config.label}
        </Text>
      </View>
    );
  };

  const renderInfoCard = (title: string, children: React.ReactNode) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-800 mb-3">
        {title}
      </Text>
      {children}
    </View>
  );

  const renderInfoRow = (label: string, value: string | null | undefined, icon?: string) => (
    <View className="flex-row items-start py-2">
      {icon && (
        <Text className="text-base mr-2">{icon}</Text>
      )}
      <View className="flex-1">
        <Text className="text-gray-600 text-sm font-medium">{label}</Text>
        <Text className="text-gray-800 text-base mt-1">
          {value || 'Não informado'}
        </Text>
      </View>
    </View>
  );

  const renderBotoesAcao = () => {
    if (!ot) return null;

    return (
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
        <Text className="text-lg font-bold text-gray-800 mb-4">
          ⚡ Ações Disponíveis
        </Text>
        
        <View className="space-y-3">
          {/* Atualizar Status */}
          {!ot.esta_finalizada && (
            <TouchableOpacity
              className="bg-primary-50 p-3 rounded-lg flex-row items-center border border-primary-200"
              onPress={handleAtualizarStatus}
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-primary-500 rounded-full items-center justify-center mr-3">
                <Ionicons name="refresh" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-primary-700 font-semibold">Atualizar Status</Text>
                <Text className="text-primary-600 text-sm">Mudar status da OT</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#2563EB" />
            </TouchableOpacity>
          )}

          {/* Transferir */}
          {ot.pode_ser_transferida && (
            <TouchableOpacity
              className="bg-accent-50 p-3 rounded-lg flex-row items-center border border-accent-200"
              onPress={handleTransferir}
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-accent-500 rounded-full items-center justify-center mr-3">
                <Ionicons name="swap-horizontal" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-accent-700 font-semibold">Transferir OT</Text>
                <Text className="text-accent-600 text-sm">Transferir para outro motorista</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#F97316" />
            </TouchableOpacity>
          )}

          {/* Finalizar */}
          {ot.pode_ser_finalizada && (
            <TouchableOpacity
              className="bg-success-50 p-3 rounded-lg flex-row items-center border border-success-200"
              onPress={handleFinalizar}
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-success-500 rounded-full items-center justify-center mr-3">
                <Ionicons name="checkmark-circle" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-success-700 font-semibold">Finalizar OT</Text>
                <Text className="text-success-600 text-sm">Marcar como entregue</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#16A34A" />
            </TouchableOpacity>
          )}

          {/* Adicionar Arquivo */}
          <TouchableOpacity
            className="bg-gray-50 p-3 rounded-lg flex-row items-center border border-gray-200"
            onPress={handleAdicionarArquivo}
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 bg-gray-500 rounded-full items-center justify-center mr-3">
              <Ionicons name="camera" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-700 font-semibold">Adicionar Arquivo</Text>
              <Text className="text-gray-600 text-sm">Foto ou documento</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ==============================================================================
  // 🎯 RENDERIZAÇÃO PRINCIPAL
  // ==============================================================================

  if (loading) {
    return (
      <TabScreenWrapper className="bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-100">
          <View className="flex-row items-center pt-8">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#2563EB" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">
              Detalhes da OT
            </Text>
          </View>
        </View>

        {/* Loading */}
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-600 mt-4">Carregando detalhes...</Text>
        </View>
      </TabScreenWrapper>
    );
  }

  if (error || !ot) {
    return (
      <TabScreenWrapper className="bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-100">
          <View className="flex-row items-center pt-8">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#2563EB" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">
              Detalhes da OT
            </Text>
          </View>
        </View>

        {/* Error */}
        <View className="flex-1 justify-center items-center p-8">
          <View className="w-20 h-20 bg-danger-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="alert-circle" size={40} color="#DC2626" />
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
            Erro ao Carregar
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            {error || 'Não foi possível carregar os detalhes da OT.'}
          </Text>
          <TouchableOpacity
            className="bg-primary-500 px-6 py-3 rounded-lg"
            onPress={carregarDetalhes}
            activeOpacity={0.7}
          >
            <Text className="text-white font-semibold">Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </TabScreenWrapper>
    );
  }

  return (
    <TabScreenWrapper className="bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between pt-8">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#2563EB" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-800">
                OT #{ot.numero_ot}
              </Text>
              <Text className="text-gray-600 text-sm">
                {ot.cliente_nome}
              </Text>
            </View>
          </View>
          {renderStatusBadge()}
        </View>
      </View>

      {/* Conteúdo */}
      <ScrollView 
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        
        {/* Informações Principais */}
        {renderInfoCard('📋 Informações Gerais', (
          <View>
            {renderInfoRow('Número da OT', ot.numero_ot, '🔢')}
            {renderInfoRow('Cliente', ot.cliente_nome, '👤')}
            {renderInfoRow('Status', getStatusConfig(ot.status).label, '📊')}
            {renderInfoRow('Data de Criação', new Date(ot.data_criacao).toLocaleString('pt-BR'), '📅')}
            {ot.data_finalizacao && renderInfoRow('Data de Finalização', new Date(ot.data_finalizacao).toLocaleString('pt-BR'), '✅')}
          </View>
        ))}

        {/* Endereços */}
        {renderInfoCard('📍 Endereços', (
          <View>
            {renderInfoRow('Origem', ot.endereco_origem, '🏭')}
            {renderInfoRow('Destino', ot.endereco_entrega, '🎯')}
            {renderInfoRow('Cidade de Entrega', ot.cidade_entrega, '🏙️')}
            {ot.endereco_entrega_real && renderInfoRow('Endereço Real de Entrega', ot.endereco_entrega_real, '📍')}
          </View>
        ))}

        {/* Motoristas */}
        {renderInfoCard('👥 Motoristas', (
          <View>
            {renderInfoRow('Motorista Criador', ot.motorista_criador.full_name, '👨‍💼')}
            {renderInfoRow('Motorista Atual', ot.motorista_atual.full_name, '👨‍🚚')}
          </View>
        ))}

        {/* Observações */}
        {(ot.observacoes || ot.observacoes_entrega) && renderInfoCard('📝 Observações', (
          <View>
            {ot.observacoes && renderInfoRow('Observações Iniciais', ot.observacoes, '📝')}
            {ot.observacoes_entrega && renderInfoRow('Observações de Entrega', ot.observacoes_entrega, '📋')}
          </View>
        ))}

        {/* Arquivos */}
        {renderInfoCard('📁 Documentos', (
          <View>
            {renderInfoRow('Total de Arquivos', ot.arquivos_count.toString(), '📄')}
            {renderInfoRow('Tem Canhoto', ot.tem_canhoto ? 'Sim' : 'Não', '📑')}
            {renderInfoRow('Tem Foto de Entrega', ot.tem_foto_entrega ? 'Sim' : 'Não', '📸')}
          </View>
        ))}

        {/* Permissões */}
        {renderInfoCard('🔒 Permissões', (
          <View>
            {renderInfoRow('Pode ser Editada', ot.pode_ser_editada ? 'Sim' : 'Não', '✏️')}
            {renderInfoRow('Pode ser Finalizada', ot.pode_ser_finalizada ? 'Sim' : 'Não', '✅')}
            {renderInfoRow('Pode ser Transferida', ot.pode_ser_transferida ? 'Sim' : 'Não', '🔄')}
            {renderInfoRow('Está Finalizada', ot.esta_finalizada ? 'Sim' : 'Não', '🏁')}
          </View>
        ))}

        {/* Botões de Ação */}
        {renderBotoesAcao()}

        {/* Espaçamento final */}
        <View className="h-6" />
      </ScrollView>
    </TabScreenWrapper>
  );
}

// ==============================================================================
// ✅ CARACTERÍSTICAS DESTA VERSÃO
// ==============================================================================

/**
 * 🎯 FUNCIONALIDADES IMPLEMENTADAS:
 * 
 * ✅ CARREGAMENTO DE DADOS:
 * - API real via otService.obterDetalhesOT()
 * - Loading states elegantes
 * - Tratamento de erros completo
 * - Pull-to-refresh funcionando
 * 
 * ✅ VISUALIZAÇÃO COMPLETA:
 * - Todas as informações da OT organizadas
 * - Status badge colorido e visual
 * - Cards organizados por categoria
 * - Layout responsivo e limpo
 * 
 * ✅ NAVEGAÇÃO:
 * - Header com botão voltar
 * - Integração com stack navigation
 * - Safe area garantida
 * 
 * ✅ BOTÕES DE AÇÃO PREPARADOS:
 * - Atualizar Status (placeholder)
 * - Transferir OT (placeholder)
 * - Finalizar OT (placeholder)
 * - Adicionar Arquivo (placeholder)
 * - Condicionais baseadas nas permissões da OT
 * 
 * ✅ UX PREMIUM:
 * - Tailwind CSS 100%
 * - Cores LogiTrack consistentes
 * - Feedback visual em todos os estados
 * - Empty states e error states
 * 
 * 🚀 RESULTADO: Tela funcional e profissional para evoluir!
 */