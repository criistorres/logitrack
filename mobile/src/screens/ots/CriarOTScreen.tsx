// mobile/src/screens/ots/CriarOTScreen.tsx - INTEGRADO COM API REAL

import React, { useState, useCallback, useMemo } from 'react';
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
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configurações', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        return;
      }

      console.log('✅ Permissão concedida, obtendo localização...');
      
      // Obter localização atual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        // maximumAge: 300000, // Cache por 5 minutos
        timeInterval: 10000  // Intervalo de atualização
      });
      
      console.log('📍 Localização obtida:', location.coords);
      
      // Reverse geocoding para obter endereço
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      const enderecoFormatado = address 
        ? `${address.street || 'Local'}, ${address.streetNumber || ''} - ${address.subregion || address.city || 'Cidade'}, ${address.region || 'Estado'}`
        : `Lat: ${location.coords.latitude.toFixed(6)}, Lng: ${location.coords.longitude.toFixed(6)}`;
      
      console.log('🏠 Endereço formatado:', enderecoFormatado);
      
      setDadosOT(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        endereco_origem: enderecoFormatado
      }));
      
    } catch (error: any) {
      console.error('❌ Erro ao obter localização:', error);
      
      let mensagemErro = 'Erro ao obter localização';
      
      // Tratar erros específicos do expo-location
      if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
        mensagemErro = 'Serviços de localização desabilitados. Ative o GPS nas configurações.';
      } else if (error.code === 'E_LOCATION_UNAUTHORIZED') {
        mensagemErro = 'Permissão de localização negada.';
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        mensagemErro = 'Localização não disponível. Verifique se o GPS está funcionando.';
      } else if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
        mensagemErro = 'Timeout ao obter localização. Tente novamente ou verifique o sinal GPS.';
      }
      
      setErroLocalizacao(mensagemErro);
      Alert.alert('Erro de Localização', mensagemErro);
      
    } finally {
      setLocalizacaoCarregando(false);
    }
  }, []);

  // ==============================================================================
  // 🚪 FUNÇÃO PARA CANCELAR E SAIR
  // ==============================================================================
  
  const cancelarEVoltarHome = useCallback(() => {
    Alert.alert(
      'Cancelar Criação de OT',
      'Tem certeza que deseja cancelar? Todos os dados preenchidos serão perdidos.',
      [
        {
          text: 'Continuar Editando',
          style: 'cancel'
        },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: () => {
            console.log('🚪 Usuário cancelou criação de OT');
            navigation.navigate('Home');
          }
        }
      ]
    );
  }, [navigation]);
  
  const proximaEtapa = useCallback(() => {
    if (etapaAtual < 5) {
      setEtapaAtual(etapaAtual + 1);
    }
  }, [etapaAtual]);
  
  const etapaAnterior = useCallback(() => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
    }
  }, [etapaAtual]);
  
  const pularEtapa = useCallback(() => {
    if (etapaAtual < 5) {
      setEtapaAtual(etapaAtual + 1);
    }
  }, [etapaAtual]);

  // ==============================================================================
  // 💾 CRIAÇÃO DA OT COM API REAL
  // ==============================================================================
  
  const criarOT = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('🚚 Iniciando criação de OT com API real...');
      
      // Preparar dados para API
      const dadosAPI: CriarOTRequest = {
        endereco_entrega: dadosOT.endereco_entrega.trim(),
        cidade_entrega: dadosOT.cidade_entrega.trim(),
      };
      
      // Adicionar campos opcionais apenas se preenchidos
      if (dadosOT.cliente_nome.trim()) {
        dadosAPI.cliente_nome = dadosOT.cliente_nome.trim();
      }
      
      if (dadosOT.observacoes.trim()) {
        dadosAPI.observacoes = dadosOT.observacoes.trim();
      }
      
      if (dadosOT.latitude && dadosOT.longitude) {
        dadosAPI.latitude_origem = dadosOT.latitude;
        dadosAPI.longitude_origem = dadosOT.longitude;
      }
      
      if (dadosOT.endereco_origem.trim()) {
        dadosAPI.endereco_origem = dadosOT.endereco_origem.trim();
      }
      
      console.log('📋 Dados enviados para API:', dadosAPI);
      
      // Chamar API para criar OT
      const response = await otService.criarOT(dadosAPI);
      
      if (response.success && response.data) {
        console.log('✅ OT criada com sucesso:', response.data.numero_ot);
        
        Alert.alert(
          '🎉 OT Criada com Sucesso!',
          `Número da OT: ${response.data.numero_ot}\nStatus: ${response.data.status}\n\nAgora você pode iniciar o carregamento.`,
          [
            { 
              text: 'Ver Detalhes', 
              onPress: () => {
                // TODO: Navegar para tela de detalhes da OT
                console.log('🔍 Navegar para detalhes da OT:', response.data?.id);
                navigation.navigate('Home');
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
  // 📐 COMPONENTE: INDICADOR DE PROGRESSO (Memoizado)
  // ==============================================================================
  
  const IndicadorProgresso = useMemo(() => (
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
              className={`flex-1 h-1 mx-2 ${
                numero < etapaAtual ? 'bg-blue-500' : 'bg-gray-300'
              }`} 
            />
          )}
        </React.Fragment>
      ))}
    </View>
  ), [etapaAtual]);

  // ==============================================================================
  // 📍 ETAPA 1: CONFIRMAÇÃO DE LOCALIZAÇÃO
  // ==============================================================================
  
  const Etapa1Localizacao = useMemo(() => (
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
              Confirme sua localização
            </Text>
            <Text className="text-gray-600 text-center text-base">
              Vamos registrar onde você está para iniciar a OT
            </Text>
          </View>

          {dadosOT.latitude ? (
            <View className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
              <Text className="text-green-800 font-semibold mb-2">📍 Localização capturada:</Text>
              <Text className="text-green-700">{dadosOT.endereco_origem}</Text>
              <Text className="text-green-600 text-sm mt-1">
                Lat: {dadosOT.latitude?.toFixed(6)}, Lng: {dadosOT.longitude?.toFixed(6)}
              </Text>
            </View>
          ) : erroLocalizacao ? (
            <View className="bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
              <Text className="text-red-800 font-semibold mb-2">❌ Erro de localização:</Text>
              <Text className="text-red-700">{erroLocalizacao}</Text>
              <Text className="text-red-600 text-sm mt-1">
                Tente novamente ou verifique as permissões do app
              </Text>
            </View>
          ) : (
            <View className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
              <Text className="text-blue-800 text-center">
                Pressione o botão abaixo para capturar sua localização atual
              </Text>
            </View>
          )}

          <View className="flex-1 justify-end">
            {!dadosOT.latitude ? (
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
  ), [dadosOT.latitude, dadosOT.longitude, dadosOT.endereco_origem, localizacaoCarregando, erroLocalizacao, obterLocalizacao, proximaEtapa]);

  // ==============================================================================
  // 👤 ETAPA 2: INFORMAÇÕES DO CLIENTE
  // ==============================================================================
  
  const Etapa2Cliente = useMemo(() => (
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

          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2 text-base">Nome do Cliente</Text>
            <TextInput
              value={dadosOT.cliente_nome}
              onChangeText={updateClienteNome}
              placeholder="Ex: Empresa ABC Ltda"
              className="border border-gray-300 rounded-lg p-4 text-base bg-white"
              returnKeyType="next"
              blurOnSubmit={false}
            />
            <Text className="text-gray-500 text-sm mt-1">
              * Este campo pode ser preenchido depois se necessário
            </Text>
          </View>

          <View className="flex-1 justify-end space-y-3">
            <TouchableOpacity 
              onPress={proximaEtapa}
              className="bg-blue-500 p-4 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-white font-semibold text-lg mr-2">Continuar</Text>
              <Text className="text-white text-lg">→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={pularEtapa}
              className="bg-gray-200 p-4 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-gray-700 font-semibold">Pular (Adicionar Depois)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={etapaAnterior}
              className="bg-gray-100 p-3 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-gray-600">← Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  ), [dadosOT.cliente_nome, updateClienteNome, proximaEtapa, pularEtapa, etapaAnterior]);

  // ==============================================================================
  // 🎯 ETAPA 3: DESTINO DA ENTREGA
  // ==============================================================================
  
  const Etapa3Destino = useMemo(() => {
    const podeProxima = dadosOT.endereco_entrega.trim() && dadosOT.cidade_entrega.trim();
    
    return (
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
              <Text className="text-6xl mb-4">🎯</Text>
              <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
                Destino da Entrega
              </Text>
              <Text className="text-gray-600 text-center text-base">
                Onde a mercadoria será entregue?
              </Text>
            </View>

            <View className="space-y-4 mb-6">
              <View>
                <Text className="text-gray-700 font-semibold mb-2 text-base">
                  Endereço de Entrega *
                </Text>
                <TextInput
                  value={dadosOT.endereco_entrega}
                  onChangeText={updateEnderecoEntrega}
                  placeholder="Ex: Rua das Flores, 123 - Centro"
                  className="border border-gray-300 rounded-lg p-4 text-base bg-white h-20"
                  multiline
                  textAlignVertical="top"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>
              
              <View>
                <Text className="text-gray-700 font-semibold mb-2 text-base">
                  Cidade de Entrega *
                </Text>
                <TextInput
                  value={dadosOT.cidade_entrega}
                  onChangeText={updateCidadeEntrega}
                  placeholder="Ex: Campinas"
                  className="border border-gray-300 rounded-lg p-4 text-base bg-white"
                  returnKeyType="done"
                />
              </View>
            </View>

            <View className="flex-1 justify-end space-y-3">
              <TouchableOpacity 
                onPress={proximaEtapa}
                disabled={!podeProxima}
                className={`p-4 rounded-lg flex-row items-center justify-center ${
                  podeProxima ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <Text className={`font-semibold text-lg mr-2 ${
                  podeProxima ? 'text-white' : 'text-gray-500'
                }`}>
                  Continuar
                </Text>
                <Text className={`text-lg ${
                  podeProxima ? 'text-white' : 'text-gray-500'
                }`}>→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={etapaAnterior}
                className="bg-gray-100 p-3 rounded-lg flex-row items-center justify-center"
              >
                <Text className="text-gray-600">← Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }, [dadosOT.endereco_entrega, dadosOT.cidade_entrega, updateEnderecoEntrega, updateCidadeEntrega, proximaEtapa, etapaAnterior]);

  // ==============================================================================
  // 📝 ETAPA 4: OBSERVAÇÕES
  // ==============================================================================
  
  const Etapa4Observacoes = useMemo(() => (
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
              Alguma informação importante sobre a carga ou entrega?
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2 text-base">
              Observações (Opcional)
            </Text>
            <TextInput
              value={dadosOT.observacoes}
              onChangeText={updateObservacoes}
              placeholder="Ex: Mercadoria frágil, entregar no setor de recebimento..."
              className="border border-gray-300 rounded-lg p-4 text-base bg-white h-32"
              multiline
              textAlignVertical="top"
              returnKeyType="done"
            />
            <Text className="text-gray-500 text-sm mt-1">
              * Estas informações ajudam outros motoristas e a logística
            </Text>
          </View>

          <View className="flex-1 justify-end space-y-3">
            <TouchableOpacity 
              onPress={proximaEtapa}
              className="bg-blue-500 p-4 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-white font-semibold text-lg mr-2">
                {dadosOT.observacoes.trim() ? 'Continuar' : 'Continuar sem Observações'}
              </Text>
              <Text className="text-white text-lg">→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={pularEtapa}
              className="bg-gray-200 p-4 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-gray-700 font-semibold">Pular</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={etapaAnterior}
              className="bg-gray-100 p-3 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-gray-600">← Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  ), [dadosOT.observacoes, updateObservacoes, proximaEtapa, pularEtapa, etapaAnterior]);

  // ==============================================================================
  // ✅ ETAPA 5: RESUMO E CONFIRMAÇÃO
  // ==============================================================================
  
  const Etapa5Resumo = useMemo(() => (
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
              Confirme os Dados
            </Text>
            <Text className="text-gray-600 text-center text-base">
              Revise as informações antes de criar a OT
            </Text>
          </View>

          <View className="flex-1 mb-6">
            <View className="space-y-4">
              {/* Localização */}
              <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <Text className="font-semibold text-gray-800 mb-2">📍 Local de Origem</Text>
                <Text className="text-gray-700">{dadosOT.endereco_origem || 'Localização capturada'}</Text>
                {dadosOT.latitude && dadosOT.longitude && (
                  <Text className="text-gray-500 text-sm mt-1">
                    Coordenadas: {dadosOT.latitude.toFixed(6)}, {dadosOT.longitude.toFixed(6)}
                  </Text>
                )}
              </View>

              {/* Cliente */}
              <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <Text className="font-semibold text-gray-800 mb-2">👤 Cliente</Text>
                <Text className="text-gray-700">
                  {dadosOT.cliente_nome || 'Não informado (pode ser adicionado depois)'}
                </Text>
              </View>

              {/* Destino */}
              <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <Text className="font-semibold text-gray-800 mb-2">🎯 Destino</Text>
                <Text className="text-gray-700 mb-1">{dadosOT.endereco_entrega}</Text>
                <Text className="text-gray-600">{dadosOT.cidade_entrega}</Text>
              </View>

              {/* Observações */}
              {dadosOT.observacoes && (
                <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <Text className="font-semibold text-gray-800 mb-2">📝 Observações</Text>
                  <Text className="text-gray-700">{dadosOT.observacoes}</Text>
                </View>
              )}
            </View>
          </View>

          <View className="space-y-3">
            <TouchableOpacity 
              onPress={criarOT}
              disabled={loading}
              className="bg-green-500 p-4 rounded-lg flex-row items-center justify-center"
            >
              {loading && <ActivityIndicator color="white" className="mr-2" />}
              <Text className="text-white font-semibold text-lg">
                {loading ? 'Criando OT na API...' : '✅ Criar Ordem de Transporte'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={etapaAnterior}
              disabled={loading}
              className="bg-gray-100 p-3 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-gray-600">← Voltar para Corrigir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  ), [dadosOT, loading, criarOT, etapaAnterior]);

  // ==============================================================================
  // 🎨 RENDER PRINCIPAL
  // ==============================================================================
  
  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1: return Etapa1Localizacao;
      case 2: return Etapa2Cliente;
      case 3: return Etapa3Destino;
      case 4: return Etapa4Observacoes;
      case 5: return Etapa5Resumo;
      default: return Etapa1Localizacao;
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header com Progresso e Botão Cancelar */}
      <View className="pt-12 pb-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between px-4 mb-4">
          <Text className="text-lg font-semibold text-gray-800">
            Nova Ordem de Transporte
          </Text>
          <TouchableOpacity
            onPress={cancelarEVoltarHome}
            className="p-2 rounded-full bg-gray-100"
          >
            <Text className="text-gray-600 text-lg font-bold">✕</Text>
          </TouchableOpacity>
        </View>
        {IndicadorProgresso}
        <Text className="text-center text-gray-600">
          Etapa {etapaAtual} de 5
        </Text>
      </View>

      {/* Conteúdo da Etapa Atual */}
      {renderEtapa()}
    </View>
  );
}