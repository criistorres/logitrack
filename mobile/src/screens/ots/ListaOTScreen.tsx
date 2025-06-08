// mobile/src/screens/ots/ListaOTScreen.tsx - LISTA DE OTs COMPLETA

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ==============================================================================
// 🆕 IMPORTS DA API
// ==============================================================================
import { otService, OT } from '../../services';

// ==============================================================================
// 📋 TIPOS DE NAVEGAÇÃO
// ==============================================================================

type AppStackParamList = {
  Home: undefined;
  ListaOTs: undefined;
  DetalhesOT: { otId: number };
  CriarOT: undefined;
};

type ListaOTScreenNavigationProp = StackNavigationProp<AppStackParamList, 'ListaOTs'>;
type ListaOTScreenRouteProp = RouteProp<AppStackParamList, 'ListaOTs'>;

interface Props {
  navigation: ListaOTScreenNavigationProp;
  route: ListaOTScreenRouteProp;
}

// ==============================================================================
// 🎨 TIPOS E INTERFACES
// ==============================================================================

interface FiltrosOT {
  status: string;
  busca: string;
}

// ==============================================================================
// 🎯 COMPONENTE PRINCIPAL: LISTA DE OTs
// ==============================================================================

export default function ListaOTScreen({ navigation }: Props) {
  // ==============================================================================
  // 📊 ESTADOS DA TELA
  // ==============================================================================
  
  const [ots, setOts] = useState<OT[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOTs, setTotalOTs] = useState(0);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosOT>({
    status: 'TODOS',
    busca: ''
  });
  const [showFiltros, setShowFiltros] = useState(false);
  
  // ==============================================================================
  // 🎨 CONFIGURAÇÕES DE STATUS (Mapeamento Visual)
  // ==============================================================================
  
  const statusConfig = useMemo(() => ({
    'INICIADA': {
      cor: 'bg-blue-500',
      corTexto: 'text-blue-700',
      corFundo: 'bg-blue-50',
      emoji: '🆕',
      label: 'Iniciada'
    },
    'EM_CARREGAMENTO': {
      cor: 'bg-orange-500',
      corTexto: 'text-orange-700',
      corFundo: 'bg-orange-50',
      emoji: '📦',
      label: 'Em Carregamento'
    },
    'EM_TRANSITO': {
      cor: 'bg-purple-500',
      corTexto: 'text-purple-700',
      corFundo: 'bg-purple-50',
      emoji: '🚛',
      label: 'Em Trânsito'
    },
    'ENTREGUE': {
      cor: 'bg-green-500',
      corTexto: 'text-green-700',
      corFundo: 'bg-green-50',
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
      cor: 'bg-red-500',
      corTexto: 'text-red-700',
      corFundo: 'bg-red-50',
      emoji: '❌',
      label: 'Cancelada'
    }
  }), []);

  // ==============================================================================
  // 🔄 FUNÇÕES DE CARREGAMENTO DE DADOS
  // ==============================================================================
  
  const carregarOTs = useCallback(async (
    pagina: number = 1, 
    manterOTsExistentes: boolean = false,
    filtrosParam?: Partial<FiltrosOT>
  ) => {
    try {
      const filtrosFinais = filtrosParam || filtros;
      
      console.log(`📋 Carregando OTs - Página ${pagina}:`, filtrosFinais);
      
      if (pagina === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      // Preparar parâmetros para a API
      const params: any = { page: pagina };
      
      if (filtrosFinais.status && filtrosFinais.status !== 'TODOS') {
        params.status = filtrosFinais.status;
      }
      
      if (filtrosFinais.busca?.trim()) {
        params.search = filtrosFinais.busca.trim();
      }
      
      const response = await otService.listarOTs(params);
      
      if (response.success && response.data) {
        // CORREÇÃO: API retorna response.data.data.results (não response.data.results)
        const apiData = response.data.data || response.data;
        const novasOTs = apiData.results || [];
        
        console.log(`✅ ${novasOTs.length} OTs carregadas`);
        
        if (manterOTsExistentes && pagina > 1) {
          setOts(prevOTs => [...prevOTs, ...novasOTs]);
        } else {
          setOts(novasOTs);
        }
        
        setTotalOTs(apiData.count || 0);
        setHasNextPage(!!apiData.next);
        setCurrentPage(pagina);
        
      } else {
        console.log('❌ Erro ao carregar OTs:', response.message);
        Alert.alert('Erro', response.message || 'Erro ao carregar lista de OTs');
      }
      
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar OTs:', error);
      Alert.alert('Erro', 'Erro inesperado ao carregar OTs');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [filtros]);

  // ==============================================================================
  // 🔄 HANDLERS DE INTERAÇÃO
  // ==============================================================================
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    carregarOTs(1, false);
  }, [carregarOTs]);

  const carregarMaisOTs = useCallback(() => {
    if (!loadingMore && hasNextPage) {
      const proximaPagina = currentPage + 1;
      carregarOTs(proximaPagina, true);
    }
  }, [loadingMore, hasNextPage, currentPage, carregarOTs]);

  const aplicarFiltros = useCallback((novosFiltros: FiltrosOT) => {
    console.log('🔍 Aplicando filtros:', novosFiltros);
    setFiltros(novosFiltros);
    setShowFiltros(false);
    setCurrentPage(1);
    carregarOTs(1, false, novosFiltros);
  }, [carregarOTs]);

  const navegarParaDetalhes = useCallback((ot: OT) => {
    console.log('📋 Navegando para detalhes da OT:', ot.numero_ot);
    navigation.navigate('DetalhesOT', { otId: ot.id });
  }, [navigation]);

  // ==============================================================================
  // 🔧 EFEITOS (CARREGAMENTO INICIAL)
  // ==============================================================================
  
  useEffect(() => {
    carregarOTs(1, false);
  }, []);

  // ==============================================================================
  // 🎨 COMPONENTE: CARD DA OT (Otimizado)
  // ==============================================================================
  
  const renderOTCard = useCallback(({ item: ot }: { item: OT }) => {
    const config = statusConfig[ot.status as keyof typeof statusConfig];
    
    return (
      <TouchableOpacity
        onPress={() => navegarParaDetalhes(ot)}
        className="bg-white rounded-lg shadow-sm mx-4 mb-3 overflow-hidden"
        activeOpacity={0.7}
      >
        {/* Header da OT */}
        <View className="flex-row items-center justify-between p-4 pb-2">
          <View className="flex-row items-center flex-1">
            <Text className="text-2xl mr-3">{config?.emoji || '📋'}</Text>
            <View className="flex-1">
              <Text className="text-gray-800 font-bold text-lg" numberOfLines={1}>
                OT {ot.numero_ot}
              </Text>
              <Text className="text-gray-600 text-sm" numberOfLines={1}>
                {ot.cliente_nome}
              </Text>
            </View>
          </View>
          
          {/* Badge de Status */}
          <View className={`px-3 py-1 rounded-full ${config?.corFundo || 'bg-gray-50'}`}>
            <Text className={`text-xs font-semibold ${config?.corTexto || 'text-gray-700'}`}>
              {config?.label || ot.status}
            </Text>
          </View>
        </View>

        {/* Informações da Entrega */}
        <View className="px-4 pb-2">
          <View className="flex-row items-center mb-1">
            <Text className="text-gray-500 text-sm mr-2">📍</Text>
            <Text className="text-gray-700 text-sm flex-1" numberOfLines={1}>
              {ot.endereco_entrega}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-gray-500 text-sm mr-2">🏙️</Text>
            <Text className="text-gray-700 text-sm flex-1" numberOfLines={1}>
              {ot.cidade_entrega}
            </Text>
          </View>
        </View>

        {/* Footer com Data e Motorista */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50">
          <View className="flex-row items-center">
            <Text className="text-gray-500 text-xs mr-2">📅</Text>
            <Text className="text-gray-600 text-xs">
              {new Date(ot.data_criacao).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Text className="text-gray-500 text-xs mr-2">👤</Text>
            <Text className="text-gray-600 text-xs" numberOfLines={1}>
              {ot.motorista_atual?.full_name || 'Motorista'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [statusConfig, navegarParaDetalhes]);

  // ==============================================================================
  // 🎨 COMPONENTE: HEADER COM FILTROS
  // ==============================================================================
  
  const HeaderComponent = useMemo(() => (
    <View className="bg-white shadow-sm">
      {/* Título e Contador */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <View>
          <Text className="text-gray-800 text-2xl font-bold">
            Minhas OTs
          </Text>
          <Text className="text-gray-600 text-sm">
            {totalOTs > 0 ? `${totalOTs} ordem${totalOTs !== 1 ? 's' : ''} encontrada${totalOTs !== 1 ? 's' : ''}` : 'Nenhuma OT encontrada'}
          </Text>
        </View>
        
        {/* Botão de Filtros */}
        <TouchableOpacity
          onPress={() => setShowFiltros(true)}
          className="bg-blue-500 p-3 rounded-lg"
        >
          <Text className="text-white text-lg">🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros Ativos */}
      {(filtros.status !== 'TODOS' || filtros.busca.trim()) && (
        <View className="px-4 pb-4">
          <View className="flex-row flex-wrap">
            {filtros.status !== 'TODOS' && (
              <View className="bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-blue-700 text-xs font-semibold">
                  Status: {statusConfig[filtros.status as keyof typeof statusConfig]?.label || filtros.status}
                </Text>
              </View>
            )}
            {filtros.busca.trim() && (
              <View className="bg-green-100 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-green-700 text-xs font-semibold">
                  Busca: {filtros.busca}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  ), [totalOTs, filtros, statusConfig]);

  // ==============================================================================
  // 🎨 COMPONENTE: LOADING E ESTADOS VAZIOS
  // ==============================================================================
  
  const ListEmptyComponent = useMemo(() => (
    <View className="flex-1 justify-center items-center py-20">
      <Text className="text-6xl mb-4">📋</Text>
      <Text className="text-gray-800 text-xl font-bold mb-2">
        Nenhuma OT Encontrada
      </Text>
      <Text className="text-gray-600 text-center text-base px-8">
        {filtros.status !== 'TODOS' || filtros.busca.trim() 
          ? 'Tente ajustar os filtros ou criar uma nova OT'
          : 'Você ainda não possui OTs. Crie sua primeira ordem de transporte!'
        }
      </Text>
      
      <TouchableOpacity
        onPress={() => navigation.navigate('CriarOT')}
        className="bg-blue-500 px-6 py-3 rounded-lg mt-6"
      >
        <Text className="text-white font-semibold">Criar Nova OT</Text>
      </TouchableOpacity>
    </View>
  ), [filtros, navigation]);

  const ListFooterComponent = useMemo(() => {
    if (!loadingMore) return null;
    
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 text-sm mt-2">Carregando mais OTs...</Text>
      </View>
    );
  }, [loadingMore]);

  // ==============================================================================
  // 🎨 MODAL DE FILTROS
  // ==============================================================================
  
  const ModalFiltros = useMemo(() => (
    <Modal
      visible={showFiltros}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFiltros(false)}
    >
      <SafeAreaView className="flex-1 bg-white">
        <FiltrosModal
          filtrosAtuais={filtros}
          statusConfig={statusConfig}
          onAplicar={aplicarFiltros}
          onFechar={() => setShowFiltros(false)}
        />
      </SafeAreaView>
    </Modal>
  ), [showFiltros, filtros, statusConfig, aplicarFiltros]);

  // ==============================================================================
  // 🎯 RENDERIZAÇÃO PRINCIPAL
  // ==============================================================================
  
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <View className="w-20 h-20 bg-blue-500 rounded-full justify-center items-center mb-5">
            <Text className="text-white text-3xl">📋</Text>
          </View>
          <Text className="text-2xl font-bold mb-2">Carregando OTs</Text>
          <Text className="text-gray-600 mb-5">Buscando suas ordens de transporte...</Text>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={ots}
        renderItem={renderOTCard}
        keyExtractor={(item) => `ot-${item.id}`}
        ListHeaderComponent={HeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
            title="Atualizando OTs..."
          />
        }
        onEndReached={carregarMaisOTs}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 120,
          offset: 120 * index,
          index,
        })}
      />
      
      {ModalFiltros}
    </SafeAreaView>
  );
}

// ==============================================================================
// 🔍 COMPONENTE: MODAL DE FILTROS
// ==============================================================================

interface FiltrosModalProps {
  filtrosAtuais: FiltrosOT;
  statusConfig: any;
  onAplicar: (filtros: FiltrosOT) => void;
  onFechar: () => void;
}

function FiltrosModal({ filtrosAtuais, statusConfig, onAplicar, onFechar }: FiltrosModalProps) {
  const [filtrosTemp, setFiltrosTemp] = useState<FiltrosOT>(filtrosAtuais);
  
  const opcoesFiltro = useMemo(() => [
    { valor: 'TODOS', label: 'Todos os Status', emoji: '📋' },
    ...Object.entries(statusConfig).map(([valor, config]: [string, any]) => ({
      valor,
      label: config.label,
      emoji: config.emoji
    }))
  ], [statusConfig]);

  const aplicarFiltros = useCallback(() => {
    onAplicar(filtrosTemp);
  }, [filtrosTemp, onAplicar]);

  const limparFiltros = useCallback(() => {
    const filtrosLimpos = { status: 'TODOS', busca: '' };
    setFiltrosTemp(filtrosLimpos);
    onAplicar(filtrosLimpos);
  }, [onAplicar]);

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity onPress={onFechar}>
          <Text className="text-blue-500 text-lg font-semibold">Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-gray-800 text-lg font-bold">Filtros</Text>
        <TouchableOpacity onPress={limparFiltros}>
          <Text className="text-red-500 text-lg font-semibold">Limpar</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo dos Filtros */}
      <View className="flex-1 p-4">
        {/* Busca */}
        <View className="mb-6">
          <Text className="text-gray-800 text-lg font-bold mb-3">Buscar</Text>
          <TextInput
            value={filtrosTemp.busca}
            onChangeText={(text) => setFiltrosTemp(prev => ({ ...prev, busca: text }))}
            placeholder="Buscar por número OT, cliente..."
            className="bg-gray-100 p-4 rounded-lg text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Status */}
        <View className="mb-6">
          <Text className="text-gray-800 text-lg font-bold mb-3">Status</Text>
          {opcoesFiltro.map((opcao) => (
            <TouchableOpacity
              key={opcao.valor}
              onPress={() => setFiltrosTemp(prev => ({ ...prev, status: opcao.valor }))}
              className={`flex-row items-center p-4 rounded-lg mb-2 ${
                filtrosTemp.status === opcao.valor ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <Text className="text-2xl mr-3">{opcao.emoji}</Text>
              <Text className={`text-lg font-semibold flex-1 ${
                filtrosTemp.status === opcao.valor ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {opcao.label}
              </Text>
              {filtrosTemp.status === opcao.valor && (
                <Text className="text-blue-500 text-xl">✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View className="p-4 border-t border-gray-200">
        <TouchableOpacity
          onPress={aplicarFiltros}
          className="bg-blue-500 p-4 rounded-lg"
        >
          <Text className="text-white text-center text-lg font-bold">
            Aplicar Filtros
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}