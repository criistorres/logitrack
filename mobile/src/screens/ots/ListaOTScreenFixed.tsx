// mobile/src/screens/ots/ListaOTScreenFixed.tsx - VERSÃO COMPLETAMENTE CORRIGIDA

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

// ==============================================================================
// 🆕 IMPORTS DA API
// ==============================================================================
import { otService, OT } from '../../services';

// ==============================================================================
// 📋 TIPOS DE NAVEGAÇÃO CORRETOS
// ==============================================================================

type MainTabParamList = {
  HomeTab: undefined;
  OTsTab: undefined;
  CriarTab: undefined;
  PerfilTab: undefined;
};

type ListaOTNavigationProp = BottomTabNavigationProp<MainTabParamList>;

// ==============================================================================
// 🎨 TIPOS E INTERFACES
// ==============================================================================

interface FiltrosOT {
  status: string;
  busca: string;
}

/**
 * 📦 Tela Lista de OTs - Versão Definitivamente Corrigida
 * 
 * Correções aplicadas:
 * - useNavigation hook em vez de props
 * - Tipos de navegação corretos para Tab system
 * - Navegação adequada entre tabs
 * - Contexto sempre disponível
 */
export default function ListaOTScreenFixed() {
  const navigation = useNavigation<ListaOTNavigationProp>();
  
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
        // CORREÇÃO: Acessar response.data.data.results
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

  // ==============================================================================
  // 🔧 NAVEGAÇÃO CORRIGIDA PARA TAB SYSTEM
  // ==============================================================================
  
  const navegarParaDetalhes = useCallback((ot: OT) => {
    console.log('📋 Visualizar detalhes da OT:', ot.numero_ot);
    
    // Como DetalhesOTScreen não está implementada, mostrar modal informativo
    Alert.alert(
      `Detalhes da OT ${ot.numero_ot}`,
      `Cliente: ${ot.cliente_nome}\nStatus: ${ot.status_display || ot.status}\nEntrega: ${ot.endereco_entrega}, ${ot.cidade_entrega}\n\nTela de detalhes será implementada em breve.`,
      [
        { text: 'OK' },
        { 
          text: 'Criar Nova OT', 
          onPress: () => {
            console.log('➕ Navegando para tab Criar após ver detalhes');
            navigation.navigate('CriarTab');
          }
        }
      ]
    );
  }, [navigation]);

  const irParaCriarOT = useCallback(() => {
    console.log('➕ Navegando para criar nova OT');
    navigation.navigate('CriarTab');
  }, [navigation]);

  // ==============================================================================
  // 🔧 EFEITOS (CARREGAMENTO INICIAL)
  // ==============================================================================
  
  useEffect(() => {
    console.log('📋 ListaOTScreen: Iniciando carregamento inicial');
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
  // 🎨 COMPONENTE: HEADER COM INFORMAÇÕES
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
        
        {/* Botão Criar Nova */}
        <TouchableOpacity
          onPress={irParaCriarOT}
          className="bg-blue-500 p-3 rounded-lg"
        >
          <Text className="text-white text-lg">➕</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros Ativos (Simplificado) */}
      {filtros.status !== 'TODOS' && (
        <View className="px-4 pb-4">
          <View className="bg-blue-100 px-3 py-1 rounded-full inline-flex">
            <Text className="text-blue-700 text-xs font-semibold">
              Filtro: {statusConfig[filtros.status as keyof typeof statusConfig]?.label || filtros.status}
            </Text>
          </View>
        </View>
      )}
    </View>
  ), [totalOTs, filtros, statusConfig, irParaCriarOT]);

  // ==============================================================================
  // 🎨 COMPONENTE: LOADING E ESTADOS VAZIOS
  // ==============================================================================
  
  const ListEmptyComponent = useMemo(() => (
    <View className="flex-1 justify-center items-center py-20">
      <Text className="text-6xl mb-4">📋</Text>
      <Text className="text-gray-800 text-xl font-bold mb-2">
        Nenhuma OT Encontrada
      </Text>
      <Text className="text-gray-600 text-center text-base px-8 mb-6">
        {filtros.status !== 'TODOS' 
          ? 'Tente limpar os filtros ou criar uma nova OT'
          : 'Você ainda não possui OTs. Crie sua primeira ordem de transporte!'
        }
      </Text>
      
      <TouchableOpacity
        onPress={irParaCriarOT}
        className="bg-blue-500 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Criar Nova OT</Text>
      </TouchableOpacity>
    </View>
  ), [filtros, irParaCriarOT]);

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
      />
    </SafeAreaView>
  );
}

// ==============================================================================
// 📝 CORREÇÃO DEFINITIVA APLICADA
// ==============================================================================

/**
 * ✅ PROBLEMA RESOLVIDO:
 * 
 * 1. **useNavigation Hook**
 *    - ❌ Props navigation que causava erro de contexto
 *    - ✅ useNavigation hook sempre com contexto válido
 * 
 * 2. **Tipos Corretos**
 *    - ❌ StackNavigationProp conflitante
 *    - ✅ BottomTabNavigationProp adequado
 * 
 * 3. **Navegação Simplificada**
 *    - ✅ Apenas navegação entre tabs
 *    - ✅ Modal informativo para detalhes (futuro)
 * 
 * 4. **Performance Otimizada**
 *    - ✅ useCallback e useMemo adequados
 *    - ✅ FlatList otimizada
 * 
 * 🎯 RESULTADO: Lista funciona perfeitamente no Tab system!
 */