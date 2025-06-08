// mobile/src/screens/ots/CriarOTScreen.tsx - VERSÃO CORRIGIDA

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Location from 'expo-location';

// ==============================================================================
// 🆕 IMPORTS DA API
// ==============================================================================
import { otService, CriarOTRequest } from '../../services';

// ==============================================================================
// 📋 TIPOS DE NAVEGAÇÃO
// ==============================================================================

type AppStackParamList = {
  Home: undefined;
  CriarOT: undefined;
  ListaOTs: undefined;
};

type CriarOTScreenNavigationProp = StackNavigationProp<AppStackParamList, 'CriarOT'>;
type CriarOTScreenRouteProp = RouteProp<AppStackParamList, 'CriarOT'>;

interface Props {
  navigation: CriarOTScreenNavigationProp;
  route: CriarOTScreenRouteProp;
}

// ==============================================================================
// 🎯 COMPONENTE PRINCIPAL: TELA CRIAR OT
// ==============================================================================

export default function CriarOTScreen({ navigation }: Props) {
  // ==============================================================================
  // 📊 ESTADOS DO FLUXO
  // ==============================================================================
  
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [dadosOT, setDadosOT] = useState({
    latitude: null as number | null,
    longitude: null as number | null,
    endereco_origem: '',
    cliente_nome: '',
    endereco_entrega: '',
    cidade_entrega: '',
    observacoes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [localizacaoCarregando, setLocalizacaoCarregando] = useState(false);
  const [erroLocalizacao, setErroLocalizacao] = useState<string | null>(null);

  // ==============================================================================
  // 🌍 GEOLOCALIZAÇÃO REAL
  // ==============================================================================
  
  const obterLocalizacao = useCallback(async () => {
    setLocalizacaoCarregando(true);
    setErroLocalizacao(null);
    
    try {
      console.log('📍 Solicitando permissão de localização...');
      
      // Solicitar permissão
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErroLocalizacao('Permissão de localização negada');
        Alert.alert(
          'Permissão Necessária',
          'Para criar uma OT, precisamos acessar sua localização atual. Por favor, permita o acesso nas configurações.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      console.log('✅ Permissão concedida, obtendo localização...');
      
      // Obter localização atual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 1,
      });
      
      console.log('📍 Localização obtida:', location.coords);
      
      // Tentar obter endereço
      try {
        const endereco = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (endereco.length > 0) {
          const enderecoPrincipal = endereco[0];
          const enderecoFormatado = [
            enderecoPrincipal.street,
            enderecoPrincipal.streetNumber,
            enderecoPrincipal.district,
            enderecoPrincipal.city,
            enderecoPrincipal.region
          ].filter(Boolean).join(', ');
          
          console.log('🏠 Endereço formatado:', enderecoFormatado);
          
          setDadosOT(prev => ({
            ...prev,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            endereco_origem: enderecoFormatado || 'Localização capturada via GPS'
          }));
        } else {
          // Sem endereço, usar apenas coordenadas
          setDadosOT(prev => ({
            ...prev,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            endereco_origem: `GPS: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`
          }));
        }
      } catch (geocodeError) {
        console.log('⚠️ Erro no geocoding, usando apenas coordenadas:', geocodeError);
        setDadosOT(prev => ({
          ...prev,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          endereco_origem: `GPS: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`
        }));
      }
      
    } catch (error) {
      console.error('❌ Erro ao obter localização:', error);
      setErroLocalizacao('Erro ao obter localização');
      Alert.alert(
        'Erro de GPS',
        'Não foi possível obter sua localização. Verifique se o GPS está ativado e tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLocalizacaoCarregando(false);
    }
  }, []);

  // ==============================================================================
  // 🔄 NAVEGAÇÃO ENTRE ETAPAS
  // ==============================================================================
  
  const proximaEtapa = useCallback(() => {
    if (etapaAtual < 5) {
      setEtapaAtual(prev => prev + 1);
    }
  }, [etapaAtual]);

  const etapaAnterior = useCallback(() => {
    if (etapaAtual > 1) {
      setEtapaAtual(prev => prev - 1);
    }
  }, [etapaAtual]);

  const voltarParaHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  // ==============================================================================
  // 🚀 CRIAÇÃO DA OT (Integração Real com API)
  // ==============================================================================
  
  const criarOT = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      console.log('🚚 Iniciando criação de OT com API real...');
      
      // Preparar dados para envio
      const dadosParaEnvio: CriarOTRequest = {
        cliente_nome: dadosOT.cliente_nome,
        endereco_entrega: dadosOT.endereco_entrega,
        cidade_entrega: dadosOT.cidade_entrega,
        observacoes: dadosOT.observacoes,
        latitude_origem: dadosOT.latitude || undefined,
        longitude_origem: dadosOT.longitude || undefined,
        endereco_origem: dadosOT.endereco_origem || undefined,
      };
      
      console.log('📋 Dados enviados para API:', dadosParaEnvio);
      
      // Chamar API para criar OT
      const response = await otService.criarOT(dadosParaEnvio);
      
      if (response.success && response.data) {
        // CORREÇÃO: Acessar response.data.data em vez de response.data
        const otCriada = response.data.data;
        
        console.log('✅ OT criada com sucesso:', otCriada?.numero_ot);
        
        Alert.alert(
          'OT Criada com Sucesso! 🎉',
          `Número da OT: ${otCriada?.numero_ot}\nStatus: ${otCriada?.status}\n\nAgora você pode iniciar o carregamento.`,
          [
            { 
              text: 'Ver Minhas OTs', 
              onPress: () => {
                console.log('📋 Navegando para Lista de OTs após criação');
                navigation.navigate('ListaOTs');
              }
            },
            { 
              text: 'Voltar ao Dashboard', 
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
        
      } else {
        console.log('❌ Erro na resposta da API:', response);
        
        // Tratar erros específicos
        let mensagemErro = response.message || 'Erro desconhecido ao criar OT';
        
        if (response.errors) {
          const erros = Object.values(response.errors).flat();
          if (erros.length > 0) {
            mensagemErro += `\n\nDetalhes: ${erros.join(', ')}`;
          }
        }
        
        Alert.alert('Erro ao Criar OT', mensagemErro);
      }
      
    } catch (error: any) {
      console.error('❌ Erro inesperado ao criar OT:', error);
      
      Alert.alert(
        'Erro Inesperado',
        'Falha inesperada ao criar a OT. Verifique sua conexão e tente novamente.',
        [{ text: 'OK' }]
      );
      
    } finally {
      setLoading(false);
    }
  }, [dadosOT, navigation]);

  // ==============================================================================
  // 🔧 FUNÇÕES DE ATUALIZAÇÃO DE CAMPOS (otimizadas)
  // ==============================================================================
  
  const updateClienteNome = useCallback((text: string) => {
    setDadosOT(prev => ({ ...prev, cliente_nome: text }));
  }, []);

  const updateEnderecoEntrega = useCallback((text: string) => {
    setDadosOT(prev => ({ ...prev, endereco_entrega: text }));
  }, []);

  const updateCidadeEntrega = useCallback((text: string) => {
    setDadosOT(prev => ({ ...prev, cidade_entrega: text }));
  }, []);

  const updateObservacoes = useCallback((text: string) => {
    setDadosOT(prev => ({ ...prev, observacoes: text }));
  }, []);

  // ==============================================================================
  // 📐 COMPONENTE: INDICADOR DE PROGRESSO
  // ==============================================================================
  
  const renderIndicadorProgresso = () => (
    <View className="flex-row items-center justify-center mb-6 px-4">
      {[1, 2, 3, 4, 5].map((numero) => (
        <React.Fragment key={numero}>
          <View 
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              numero <= etapaAtual ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <Text className={`font-bold text-sm ${
              numero <= etapaAtual ? 'text-white' : 'text-gray-600'
            }`}>
              {numero}
            </Text>
          </View>
          {numero < 5 && (
            <View 
              className={`flex-1 h-0.5 mx-2 ${
                numero < etapaAtual ? 'bg-blue-500' : 'bg-gray-300'
              }`} 
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  // ==============================================================================
  // 🌍 ETAPA 1: LOCALIZAÇÃO GPS
  // ==============================================================================
  
  const renderEtapa1Localizacao = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 p-6">
          <View className="items-center mb-8">
            <Text className="text-6xl mb-4">📍</Text>
            <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
              Localização de Origem
            </Text>
            <Text className="text-gray-600 text-center text-base">
              Onde você está agora? Esta será a origem da coleta.
            </Text>
          </View>

          {/* Campo de endereço manual */}
          <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <Text className="text-gray-800 font-semibold text-base mb-3">
              Endereço de Origem
            </Text>
            <TextInput
              value={dadosOT.endereco_origem}
              onChangeText={(text) => setDadosOT(prev => ({ ...prev, endereco_origem: text }))}
              placeholder="Digite o endereço ou use o GPS..."
              className="bg-gray-100 p-4 rounded-lg text-gray-800 text-base"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Informações de GPS */}
          {dadosOT.latitude && dadosOT.longitude && (
            <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <View className="flex-row items-center mb-2">
                <Text className="text-green-700 text-lg mr-2">✅</Text>
                <Text className="text-green-700 font-semibold text-base">
                  Localização GPS Capturada
                </Text>
              </View>
              <Text className="text-green-600 text-sm">
                Lat: {dadosOT.latitude.toFixed(6)}
              </Text>
              <Text className="text-green-600 text-sm">
                Lng: {dadosOT.longitude.toFixed(6)}
              </Text>
            </View>
          )}

          {/* Erro de localização */}
          {erroLocalizacao && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <View className="flex-row items-center mb-2">
                <Text className="text-red-700 text-lg mr-2">❌</Text>
                <Text className="text-red-700 font-semibold text-base">
                  Erro de Localização
                </Text>
              </View>
              <Text className="text-red-600 text-sm">
                {erroLocalizacao}
              </Text>
            </View>
          )}

          {/* Spacer */}
          <View className="flex-1" />

          {/* Botões de ação */}
          <View className="space-y-3">
            {!dadosOT.latitude || !dadosOT.longitude ? (
              <TouchableOpacity 
                onPress={obterLocalizacao}
                disabled={localizacaoCarregando}
                className="bg-blue-500 p-4 rounded-lg flex-row items-center justify-center"
              >
                {localizacaoCarregando && (
                  <ActivityIndicator color="white" className="mr-2" />
                )}
                <Text className="text-white font-semibold text-lg">
                  {localizacaoCarregando ? 'Capturando GPS...' : '📍 Capturar Localização'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="space-y-3">
                <TouchableOpacity 
                  onPress={proximaEtapa}
                  className="bg-blue-500 p-4 rounded-lg flex-row items-center justify-center"
                >
                  <Text className="text-white font-semibold text-lg mr-2">
                    Confirmar e Continuar
                  </Text>
                  <Text className="text-white text-lg">→</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={obterLocalizacao}
                  className="bg-gray-200 p-4 rounded-lg flex-row items-center justify-center"
                >
                  <Text className="text-gray-700 font-semibold">Capturar Novamente</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ==============================================================================
  // 👤 ETAPA 2: INFORMAÇÕES DO CLIENTE
  // ==============================================================================
  
  const renderEtapa2Cliente = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 p-6">
          <View className="items-center mb-8">
            <Text className="text-6xl mb-4">👤</Text>
            <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
              Informações do Cliente
            </Text>
            <Text className="text-gray-600 text-center text-base">
              Para quem é esta entrega?
            </Text>
          </View>

          <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <Text className="text-gray-800 font-semibold text-base mb-3">
              Nome do Cliente *
            </Text>
            <TextInput
              value={dadosOT.cliente_nome}
              onChangeText={updateClienteNome}
              placeholder="Ex: João Silva, Empresa ABC Ltda..."
              className="bg-gray-100 p-4 rounded-lg text-gray-800 text-base"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
          </View>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Botões de navegação */}
          <View className="flex-row space-x-3">
            <TouchableOpacity 
              onPress={etapaAnterior}
              className="flex-1 bg-gray-200 p-4 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-gray-700 text-lg mr-2">←</Text>
              <Text className="text-gray-700 font-semibold">Voltar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={proximaEtapa}
              disabled={!dadosOT.cliente_nome.trim()}
              className={`flex-1 p-4 rounded-lg flex-row items-center justify-center ${
                dadosOT.cliente_nome.trim() 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
              }`}
            >
              <Text className={`font-semibold text-lg mr-2 ${
                dadosOT.cliente_nome.trim() 
                  ? 'text-white' 
                  : 'text-gray-500'
              }`}>
                Continuar
              </Text>
              <Text className={`text-lg ${
                dadosOT.cliente_nome.trim() 
                  ? 'text-white' 
                  : 'text-gray-500'
              }`}>
                →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ==============================================================================
  // 📍 ETAPA 3: ENDEREÇO DE ENTREGA
  // ==============================================================================
  
  const renderEtapa3Entrega = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 p-6">
          <View className="items-center mb-8">
            <Text className="text-6xl mb-4">📍</Text>
            <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
              Endereço de Entrega
            </Text>
            <Text className="text-gray-600 text-center text-base">
              Para onde devemos levar a mercadoria?
            </Text>
          </View>

          <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
            <Text className="text-gray-800 font-semibold text-base mb-3">
              Endereço Completo *
            </Text>
            <TextInput
              value={dadosOT.endereco_entrega}
              onChangeText={updateEnderecoEntrega}
              placeholder="Rua, número, bairro..."
              className="bg-gray-100 p-4 rounded-lg text-gray-800 text-base"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

          <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <Text className="text-gray-800 font-semibold text-base mb-3">
              Cidade *
            </Text>
            <TextInput
              value={dadosOT.cidade_entrega}
              onChangeText={updateCidadeEntrega}
              placeholder="Ex: São Paulo, Rio de Janeiro..."
              className="bg-gray-100 p-4 rounded-lg text-gray-800 text-base"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
          </View>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Botões de navegação */}
          <View className="flex-row space-x-3">
            <TouchableOpacity 
              onPress={etapaAnterior}
              className="flex-1 bg-gray-200 p-4 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-gray-700 text-lg mr-2">←</Text>
              <Text className="text-gray-700 font-semibold">Voltar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={proximaEtapa}
              disabled={!dadosOT.endereco_entrega.trim() || !dadosOT.cidade_entrega.trim()}
              className={`flex-1 p-4 rounded-lg flex-row items-center justify-center ${
                dadosOT.endereco_entrega.trim() && dadosOT.cidade_entrega.trim()
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
              }`}
            >
              <Text className={`font-semibold text-lg mr-2 ${
                dadosOT.endereco_entrega.trim() && dadosOT.cidade_entrega.trim()
                  ? 'text-white' 
                  : 'text-gray-500'
              }`}>
                Continuar
              </Text>
              <Text className={`text-lg ${
                dadosOT.endereco_entrega.trim() && dadosOT.cidade_entrega.trim()
                  ? 'text-white' 
                  : 'text-gray-500'
              }`}>
                →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ==============================================================================
  // 📝 ETAPA 4: OBSERVAÇÕES
  // ==============================================================================
  
  const renderEtapa4Observacoes = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 p-6">
          <View className="items-center mb-8">
            <Text className="text-6xl mb-4">📝</Text>
            <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
              Observações
            </Text>
            <Text className="text-gray-600 text-center text-base">
              Alguma informação adicional sobre esta entrega?
            </Text>
          </View>

          <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <Text className="text-gray-800 font-semibold text-base mb-3">
              Observações (Opcional)
            </Text>
            <TextInput
              value={dadosOT.observacoes}
              onChangeText={updateObservacoes}
              placeholder="Ex: Produto frágil, entregar pela manhã, aguardar no portão..."
              className="bg-gray-100 p-4 rounded-lg text-gray-800 text-base"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Botões de navegação */}
          <View className="flex-row space-x-3">
            <TouchableOpacity 
              onPress={etapaAnterior}
              className="flex-1 bg-gray-200 p-4 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-gray-700 text-lg mr-2">←</Text>
              <Text className="text-gray-700 font-semibold">Voltar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={proximaEtapa}
              className="flex-1 bg-blue-500 p-4 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-white font-semibold text-lg mr-2">
                Revisar
              </Text>
              <Text className="text-white text-lg">→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ==============================================================================
  // ✅ ETAPA 5: CONFIRMAÇÃO E CRIAÇÃO
  // ==============================================================================
  
  const renderEtapa5Confirmacao = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 p-6">
          <View className="items-center mb-8">
            <Text className="text-6xl mb-4">✅</Text>
            <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
              Revisar e Confirmar
            </Text>
            <Text className="text-gray-600 text-center text-base">
              Verifique os dados antes de criar a OT
            </Text>
          </View>

          {/* Resumo da OT */}
          <View className="bg-white rounded-lg shadow-sm mb-6">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-gray-800 font-bold text-lg">
                Resumo da Ordem de Transporte
              </Text>
            </View>

            <View className="p-4 space-y-4">
              {/* Cliente */}
              <View>
                <Text className="text-gray-500 text-sm font-semibold mb-1">CLIENTE</Text>
                <Text className="text-gray-800 text-base">{dadosOT.cliente_nome}</Text>
              </View>

              {/* Origem */}
              <View>
                <Text className="text-gray-500 text-sm font-semibold mb-1">ORIGEM</Text>
                <Text className="text-gray-800 text-base">{dadosOT.endereco_origem || 'GPS Capturado'}</Text>
                {dadosOT.latitude && dadosOT.longitude && (
                  <Text className="text-gray-500 text-xs mt-1">
                    GPS: {dadosOT.latitude.toFixed(6)}, {dadosOT.longitude.toFixed(6)}
                  </Text>
                )}
              </View>

              {/* Destino */}
              <View>
                <Text className="text-gray-500 text-sm font-semibold mb-1">DESTINO</Text>
                <Text className="text-gray-800 text-base">{dadosOT.endereco_entrega}</Text>
                <Text className="text-gray-600 text-sm mt-1">{dadosOT.cidade_entrega}</Text>
              </View>

              {/* Observações */}
              {dadosOT.observacoes.trim() && (
                <View>
                  <Text className="text-gray-500 text-sm font-semibold mb-1">OBSERVAÇÕES</Text>
                  <Text className="text-gray-800 text-base">{dadosOT.observacoes}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Botões de ação final */}
          <View className="space-y-3">
            <TouchableOpacity 
              onPress={criarOT}
              disabled={loading}
              className="bg-green-500 p-4 rounded-lg flex-row items-center justify-center"
            >
              {loading && (
                <ActivityIndicator color="white" className="mr-2" />
              )}
              <Text className="text-white font-bold text-lg">
                {loading ? 'Criando OT...' : '🚛 Criar Ordem de Transporte'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={etapaAnterior}
              disabled={loading}
              className="bg-gray-200 p-4 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-gray-700 text-lg mr-2">←</Text>
              <Text className="text-gray-700 font-semibold">Voltar e Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={voltarParaHome}
              disabled={loading}
              className="bg-red-100 p-4 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-red-600 font-semibold">Cancelar e Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ==============================================================================
  // 🎯 RENDERIZAÇÃO PRINCIPAL
  // ==============================================================================
  
  const renderEtapaAtual = () => {
    switch (etapaAtual) {
      case 1: return renderEtapa1Localizacao();
      case 2: return renderEtapa2Cliente();
      case 3: return renderEtapa3Entrega();
      case 4: return renderEtapa4Observacoes();
      case 5: return renderEtapa5Confirmacao();
      default: return renderEtapa1Localizacao();
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm">
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity onPress={voltarParaHome}>
            <Text className="text-blue-500 text-lg font-semibold">← Voltar</Text>
          </TouchableOpacity>
          <Text className="text-gray-800 text-lg font-bold">Criar Nova OT</Text>
          <View className="w-16" />
        </View>
        
        {/* Indicador de progresso */}
        {renderIndicadorProgresso()}
      </View>

      {/* Conteúdo da etapa atual */}
      {renderEtapaAtual()}
    </View>
  );
}