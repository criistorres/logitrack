// mobile/src/screens/ots/AtualizarStatusScreen.tsx - FLUXO GUIADO DE STATUS

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

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
  FinalizarOT: { ot: OT };
};

type AtualizarStatusRouteProp = RouteProp<OTsStackParamList, 'AtualizarStatus'>;
type AtualizarStatusNavigationProp = StackNavigationProp<OTsStackParamList, 'AtualizarStatus'>;

/**
 * 🔄 Tela Atualizar Status - Fluxo Guiado Intuitivo
 * 
 * ✅ Funcionalidades:
 * - Perguntas contextuais baseadas no status atual
 * - Validação de transições possíveis
 * - Captura de localização quando relevante
 * - Observações opcionais
 * - Confirmação antes de enviar
 * - Feedback visual claro
 */
export default function AtualizarStatusScreen() {
  const route = useRoute<AtualizarStatusRouteProp>();
  const navigation = useNavigation<AtualizarStatusNavigationProp>();
  const { ot } = route.params;
  
  // ==============================================================================
  // 📊 ESTADOS DA TELA
  // ==============================================================================
  
  const [etapaAtual, setEtapaAtual] = useState(1); // 1: Pergunta, 2: Observação, 3: Confirmação
  const [novoStatus, setNovoStatus] = useState<string>('');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [capturandoLocalizacao, setCapturandoLocalizacao] = useState(false);
  const [localizacao, setLocalizacao] = useState<{latitude: number, longitude: number} | null>(null);

  // ==============================================================================
  // 🎯 CONFIGURAÇÕES DE STATUS E PERGUNTAS HUMANIZADAS
  // ==============================================================================
  
  const getStatusConfig = () => {
    const configs = {
      'INICIADA': {
        proximoStatus: 'EM_CARREGAMENTO',
        pergunta: '🚛 Chegou no local de coleta? Vão começar a carregar?',
        descricao: 'Confirme se você chegou no local e o carregamento vai começar',
        emoji: '📦',
        cor: 'bg-warning-500',
        corFundo: 'bg-warning-50',
        corTexto: 'text-warning-700',
        precisaLocalizacao: true,
        mensagemSucesso: 'Perfeito! Agora sua OT está "em carregamento".',
        sugestaoObservacao: 'Ex: Cheguei no CD, equipe vai começar a carregar...',
        statusHumanizado: 'Em carregamento'
      },
      'EM_CARREGAMENTO': {
        proximoStatus: 'EM_TRANSITO',
        pergunta: '🚚 Terminaram de carregar? Já pode sair para a entrega?',
        descricao: 'Confirme se toda a carga foi colocada no veículo e você pode partir',
        emoji: '🛣️',
        cor: 'bg-accent-500',
        corFundo: 'bg-accent-50',
        corTexto: 'text-accent-700',
        precisaLocalizacao: true,
        mensagemSucesso: 'Ótimo! Agora sua OT está "em trânsito". Boa viagem!',
        sugestaoObservacao: 'Ex: Carregamento finalizado, saindo para entrega...',
        statusHumanizado: 'Em trânsito'
      },
      'EM_TRANSITO': {
        proximoStatus: 'PROCESSO_FINALIZACAO',
        pergunta: '✅ Chegou no cliente? Conseguiu fazer a entrega?',
        descricao: 'Confirme se chegou no destino e a entrega foi realizada',
        emoji: '🎯',
        cor: 'bg-success-500',
        corFundo: 'bg-success-50',
        corTexto: 'text-success-700',
        precisaLocalizacao: false, // Localização será capturada na finalização
        mensagemSucesso: 'Agora vamos finalizar a entrega com os documentos!',
        sugestaoObservacao: '',
        statusHumanizado: 'Entregue',
        navegarPara: 'FinalizarOT' // Navegar para tela especial
      }
    };

    return configs[ot.status] || null;
  };

  const podeAtualizar = () => {
    return ot.status === 'INICIADA' || ot.status === 'EM_CARREGAMENTO' || ot.status === 'EM_TRANSITO';
  };

  // ==============================================================================
  // 🌍 CAPTURA DE LOCALIZAÇÃO
  // ==============================================================================
  
  const capturarLocalizacao = useCallback(async () => {
    setCapturandoLocalizacao(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão Necessária', 'Precisamos da localização para registrar onde a ação foi realizada.');
        setCapturandoLocalizacao(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        // timeout: 10000,
      });

      setLocalizacao({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter a localização. Continuando sem GPS.');
    } finally {
      setCapturandoLocalizacao(false);
    }
  }, []);

  // ==============================================================================
  // 🔄 ATUALIZAÇÃO DE STATUS
  // ==============================================================================
  
  const confirmarAtualizacao = useCallback(async () => {
    const config = getStatusConfig();
    if (!config) return;

    setLoading(true);
    
    try {
      const dadosAtualizacao = {
        status: config.proximoStatus as any,
        observacao: observacao.trim(),
        ...(localizacao && {
          latitude: localizacao.latitude,
          longitude: localizacao.longitude
        })
      };

      const response = await otService.atualizarStatus(ot.id, dadosAtualizacao);
      
      if (response.success) {
        Alert.alert(
          'Status Atualizado!',
          config.mensagemSucesso,
          [
            {
              text: 'OK',
              onPress: () => {
                // Voltar para detalhes e recarregar
                navigation.navigate('DetalhesOT', { otId: ot.id });
              }
            }
          ]
        );
      } else {
        throw new Error(response.message || 'Erro ao atualizar status');
      }
      
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert(
        'Erro ao Atualizar',
        'Não foi possível atualizar o status. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }, [ot.id, observacao, localizacao, navigation]);

  // ==============================================================================
  // 🔧 HANDLERS DE NAVEGAÇÃO
  // ==============================================================================
  
  const proximaEtapa = useCallback(() => {
    const config = getStatusConfig();
    if (!config) return;

    if (etapaAtual === 1) {
      // Caso especial: EM_TRANSITO vai para finalização
      if (config.navegarPara === 'FinalizarOT') {
        navigation.navigate('FinalizarOT', { ot });
        return;
      }
      
      // Capturar localização se necessário
      if (config.precisaLocalizacao) {
        capturarLocalizacao();
      }
      setNovoStatus(config.proximoStatus);
      setEtapaAtual(2);
    } else if (etapaAtual === 2) {
      setEtapaAtual(3);
    }
  }, [etapaAtual, capturarLocalizacao, navigation, ot]);

  const etapaAnterior = useCallback(() => {
    if (etapaAtual > 1) {
      setEtapaAtual(prev => prev - 1);
    }
  }, [etapaAtual]);

  const cancelarAtualizacao = useCallback(() => {
    Alert.alert(
      'Cancelar Atualização',
      'Tem certeza que deseja cancelar a atualização de status?',
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  }, [navigation]);

  // ==============================================================================
  // 🎨 COMPONENTES DE RENDERIZAÇÃO
  // ==============================================================================

  const renderIndicadorProgresso = () => (
    <View className="flex-row justify-center items-center py-4 bg-white border-b border-gray-100">
      {[1, 2, 3].map((step) => (
        <View key={step} className="flex-row items-center">
          <View className={`
            w-10 h-10 rounded-full items-center justify-center
            ${step <= etapaAtual ? 'bg-primary-500' : 'bg-gray-200'}
          `}>
            <Text className={`
              text-sm font-bold
              ${step <= etapaAtual ? 'text-white' : 'text-gray-500'}
            `}>
              {step}
            </Text>
          </View>
          {step < 3 && (
            <View className={`
              w-12 h-1 mx-2
              ${step < etapaAtual ? 'bg-primary-500' : 'bg-gray-200'}
            `} />
          )}
        </View>
      ))}
    </View>
  );

  // ==============================================================================
  // 📝 ETAPA 1: PERGUNTA CONTEXTUAL
  // ==============================================================================
  
  const renderEtapa1Pergunta = () => {
    const config = getStatusConfig();
    if (!config) return null;

    return (
      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-xl p-6 shadow-lg">
          <View className="items-center mb-6">
            <View className={`w-24 h-24 ${config.corFundo} rounded-full items-center justify-center mb-4 border-4 border-white shadow-lg`}>
              <Text className="text-4xl">{config.emoji}</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Atualizar Status
            </Text>
            <Text className="text-gray-600 text-center mb-4">
              OT #{ot.numero_ot}
            </Text>
          </View>

          {/* Pergunta Principal */}
          <View className={`${config.corFundo} p-4 rounded-xl border border-gray-200 mb-6`}>
            <Text className={`text-xl font-bold ${config.corTexto} text-center mb-2`}>
              {config.pergunta}
            </Text>
            <Text className="text-gray-600 text-center">
              {config.descricao}
            </Text>
          </View>

          {/* Status Atual → Próximo */}
          <View className="bg-gray-50 p-4 rounded-xl mb-6">
            <Text className="text-gray-600 text-sm font-medium mb-2 text-center">
              Mudança de Status
            </Text>
            <View className="flex-row items-center justify-center">
              <View className="bg-gray-200 px-3 py-2 rounded-lg">
                <Text className="text-gray-700 font-semibold">{ot.status}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#6B7280" className="mx-4" />
              <View className={`${config.cor} px-3 py-2 rounded-lg`}>
                <Text className="text-white font-semibold">{config.proximoStatus}</Text>
              </View>
            </View>
          </View>

          {/* Botões */}
          <View className="space-y-3">
            <TouchableOpacity
              className={`${config.cor} p-4 rounded-xl flex-row items-center justify-center`}
              onPress={proximaEtapa}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text className="text-white font-semibold text-lg ml-2">
                Sim, Confirmar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-100 p-4 rounded-xl flex-row items-center justify-center"
              onPress={cancelarAtualizacao}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
              <Text className="text-gray-600 font-semibold ml-2">
                Não, Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  // ==============================================================================
  // 📝 ETAPA 2: OBSERVAÇÕES
  // ==============================================================================
  
  const renderEtapa2Observacao = () => {
    const config = getStatusConfig();
    if (!config) return null;

    return (
      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-xl p-6 shadow-lg">
          <View className="items-center mb-6">
            <View className={`w-20 h-20 ${config.corFundo} rounded-full items-center justify-center mb-4`}>
              <Ionicons name="document-text" size={32} color={config.cor.replace('bg-', '#')} />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Adicionar Observações
            </Text>
            <Text className="text-gray-600 text-center">
              Descreva detalhes sobre esta atualização (opcional)
            </Text>
          </View>

          {/* Status da Localização */}
          {config.precisaLocalizacao && (
            <View className="bg-gray-50 p-4 rounded-xl mb-4">
              <View className="flex-row items-center">
                <Ionicons 
                  name={localizacao ? "location" : capturandoLocalizacao ? "time" : "location-outline"} 
                  size={20} 
                  color={localizacao ? "#16A34A" : capturandoLocalizacao ? "#F59E0B" : "#6B7280"} 
                />
                <Text className="text-gray-700 font-medium ml-2">
                  {capturandoLocalizacao ? 
                    'Capturando localização...' :
                    localizacao ? 
                      'Localização capturada ✓' : 
                      'Localização será capturada'
                  }
                </Text>
              </View>
            </View>
          )}

          {/* Campo de Observação */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">
              Observações (Opcional)
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-gray-800 bg-gray-50 h-32"
              placeholder={config.sugestaoObservacao}
              value={observacao}
              onChangeText={setObservacao}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Botões */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 bg-gray-100 p-4 rounded-xl flex-row items-center justify-center"
              onPress={etapaAnterior}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#6B7280" />
              <Text className="text-gray-600 font-semibold ml-2">
                Voltar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-primary-500 p-4 rounded-xl flex-row items-center justify-center"
              onPress={proximaEtapa}
              activeOpacity={0.7}
            >
              <Text className="text-white font-semibold mr-2">
                Continuar
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  // ==============================================================================
  // ✅ ETAPA 3: CONFIRMAÇÃO
  // ==============================================================================
  
  const renderEtapa3Confirmacao = () => {
    const config = getStatusConfig();
    if (!config) return null;

    return (
      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-xl p-6 shadow-lg">
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-success-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={40} color="#16A34A" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Confirmar Atualização
            </Text>
            <Text className="text-gray-600 text-center">
              Revise as informações antes de confirmar
            </Text>
          </View>

          {/* Resumo da Atualização */}
          <View className="space-y-4 mb-6">
            <View className="bg-gray-50 p-4 rounded-xl">
              <Text className="text-gray-600 text-sm font-medium mb-1">🔢 OT</Text>
              <Text className="text-gray-800 font-semibold">#{ot.numero_ot}</Text>
            </View>

            <View className="bg-gray-50 p-4 rounded-xl">
              <Text className="text-gray-600 text-sm font-medium mb-1">🔄 Mudança de Status</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-700">{ot.status}</Text>
                <Ionicons name="arrow-forward" size={16} color="#6B7280" className="mx-2" />
                <Text className={`font-semibold ${config.corTexto}`}>{config.proximoStatus}</Text>
              </View>
            </View>

            {observacao && (
              <View className="bg-gray-50 p-4 rounded-xl">
                <Text className="text-gray-600 text-sm font-medium mb-1">📝 Observações</Text>
                <Text className="text-gray-800">{observacao}</Text>
              </View>
            )}

            {localizacao && (
              <View className="bg-gray-50 p-4 rounded-xl">
                <Text className="text-gray-600 text-sm font-medium mb-1">📍 Localização</Text>
                <Text className="text-gray-800">
                  {localizacao.latitude.toFixed(6)}, {localizacao.longitude.toFixed(6)}
                </Text>
              </View>
            )}
          </View>

          {/* Botões */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 bg-gray-100 p-4 rounded-xl flex-row items-center justify-center"
              onPress={etapaAnterior}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#6B7280" />
              <Text className="text-gray-600 font-semibold ml-2">
                Voltar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`
                flex-1 p-4 rounded-xl flex-row items-center justify-center
                ${loading ? 'bg-gray-300' : 'bg-success-500'}
              `}
              onPress={confirmarAtualizacao}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="#9CA3AF" />
                  <Text className="text-gray-500 font-semibold ml-2">
                    Atualizando...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Confirmar
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  // ==============================================================================
  // 🎯 RENDERIZAÇÃO PRINCIPAL
  // ==============================================================================

  if (!podeAtualizar()) {
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
              Atualizar Status
            </Text>
          </View>
        </View>

        {/* Não pode atualizar */}
        <View className="flex-1 justify-center items-center p-8">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="lock-closed" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
            Status Não Pode Ser Alterado
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Esta OT está em um status final ou não permite alterações no momento.
          </Text>
          <TouchableOpacity
            className="bg-primary-500 px-6 py-3 rounded-lg"
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text className="text-white font-semibold">Voltar</Text>
          </TouchableOpacity>
        </View>
      </TabScreenWrapper>
    );
  }

  const renderEtapaAtual = () => {
    switch (etapaAtual) {
      case 1: return renderEtapa1Pergunta();
      case 2: return renderEtapa2Observacao();
      case 3: return renderEtapa3Confirmacao();
      default: return renderEtapa1Pergunta();
    }
  };

  return (
    <TabScreenWrapper className="bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm">
        <View className="flex-row items-center justify-between px-4 py-4 pt-12">
          <TouchableOpacity 
            onPress={cancelarAtualizacao}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="close" size={20} color="#2563EB" />
              <Text className="text-primary-500 font-semibold ml-1">Cancelar</Text>
            </View>
          </TouchableOpacity>
          <Text className="text-gray-800 text-lg font-bold">Atualizar Status</Text>
          <View className="w-20" />
        </View>
        
        {renderIndicadorProgresso()}
      </View>

      {/* Conteúdo da etapa atual */}
      {renderEtapaAtual()}
    </TabScreenWrapper>
  );
}

// ==============================================================================
// ✅ CARACTERÍSTICAS DESTA VERSÃO
// ==============================================================================

/**
 * 🎯 FUNCIONALIDADES IMPLEMENTADAS:
 * 
 * ✅ FLUXO GUIADO EM 3 ETAPAS:
 * 1. Pergunta contextual clara
 * 2. Observações opcionais
 * 3. Confirmação com resumo
 * 
 * ✅ PERGUNTAS CONTEXTUAIS:
 * - INICIADA: "A carga já está sendo carregada?"
 * - EM_CARREGAMENTO: "Carregamento finalizado? Pronto para partir?"
 * - EM_TRANSITO: "Chegou no destino? Entrega realizada?"
 * 
 * ✅ RECURSOS AVANÇADOS:
 * - Captura de localização automática
 * - Validação de transições permitidas
 * - Progress indicator visual
 * - Estados de loading
 * - Integração com API real
 * 
 * ✅ UX INTUITIVA:
 * - Linguagem simples para motoristas
 * - Visual claro com cores e emojis
 * - Confirmações antes de ações
 * - Feedback de sucesso/erro
 * 
 * 🚀 RESULTADO: Sistema guiado que elimina confusão!
 */