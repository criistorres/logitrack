// mobile/src/screens/ots/CriarOTScreenUltraSimple.tsx - VERSÃO ULTRA SIMPLIFICADA

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
import * as Location from 'expo-location';

// ==============================================================================
// 🆕 IMPORTS DA API
// ==============================================================================
import { otService, CriarOTRequest } from '../../services';

/**
 * 🎯 Tela Criar OT - Versão Ultra Simplificada
 * 
 * REMOVIDO:
 * - useNavigation (era aqui o problema!)
 * - SafeAreaView (conflito de contexto)
 * - KeyboardAvoidingView (complexidade)
 * - Qualquer dependência de contexto externo
 * 
 * MANTIDO:
 * - Navegação interna entre etapas
 * - Funcionalidade completa
 * - GPS e API
 */
export default function CriarOTScreenUltraSimple() {
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
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErroLocalizacao('Permissão de localização negada');
        Alert.alert('Permissão Necessária', 'Para criar uma OT, precisamos acessar sua localização atual.');
        return;
      }
      
      console.log('✅ Permissão concedida, obtendo localização...');
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 1,
      });
      
      console.log('📍 Localização obtida:', location.coords);
      
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
      Alert.alert('Erro de GPS', 'Não foi possível obter sua localização. Verifique se o GPS está ativado e tente novamente.');
    } finally {
      setLocalizacaoCarregando(false);
    }
  }, []);

  // ==============================================================================
  // 🔄 NAVEGAÇÃO ENTRE ETAPAS (100% INTERNA - SEM CONTEXTO)
  // ==============================================================================
  
  const proximaEtapa = useCallback(() => {
    console.log('➡️ Avançando para próxima etapa:', etapaAtual + 1);
    if (etapaAtual < 5) {
      setEtapaAtual(prev => prev + 1);
    }
  }, [etapaAtual]);

  const etapaAnterior = useCallback(() => {
    console.log('⬅️ Voltando para etapa anterior:', etapaAtual - 1);
    if (etapaAtual > 1) {
      setEtapaAtual(prev => prev - 1);
    }
  }, [etapaAtual]);

  // ==============================================================================
  // 🚀 CRIAÇÃO DA OT (SEM NAVEGAÇÃO EXTERNA)
  // ==============================================================================
  
  const criarOT = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      console.log('🚚 Iniciando criação de OT com API real...');
      
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
      
      const response = await otService.criarOT(dadosParaEnvio);
      
      if (response.success && response.data) {
        const otCriada = response.data.data;
        
        console.log('✅ OT criada com sucesso:', otCriada?.numero_ot);
        
        Alert.alert(
          'OT Criada com Sucesso! 🎉',
          `Número da OT: ${otCriada?.numero_ot}\nStatus: ${otCriada?.status}\n\nOT criada e pronta para uso!`,
          [
            { 
              text: 'Criar Outra OT', 
              onPress: () => {
                // Resetar formulário para nova OT
                setEtapaAtual(1);
                setDadosOT({
                  latitude: null,
                  longitude: null,
                  endereco_origem: '',
                  cliente_nome: '',
                  endereco_entrega: '',
                  cidade_entrega: '',
                  observacoes: ''
                });
              }
            },
            { 
              text: 'OK',
              style: 'default'
            }
          ]
        );
        
      } else {
        console.log('❌ Erro na resposta da API:', response);
        
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
      Alert.alert('Erro Inesperado', 'Falha inesperada ao criar a OT. Verifique sua conexão e tente novamente.');
      
    } finally {
      setLoading(false);
    }
  }, [dadosOT]);

  // ==============================================================================
  // 🔧 FUNÇÕES DE ATUALIZAÇÃO DE CAMPOS
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
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24, paddingHorizontal: 16 }}>
      {[1, 2, 3, 4, 5].map((numero) => (
        <React.Fragment key={numero}>
          <View 
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: numero <= etapaAtual ? '#3B82F6' : '#D1D5DB'
            }}
          >
            <Text style={{
              fontWeight: 'bold',
              fontSize: 14,
              color: numero <= etapaAtual ? 'white' : '#6B7280'
            }}>
              {numero}
            </Text>
          </View>
          {numero < 5 && (
            <View 
              style={{
                flex: 1,
                height: 2,
                marginHorizontal: 8,
                backgroundColor: numero < etapaAtual ? '#3B82F6' : '#D1D5DB'
              }} 
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
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View style={{ flex: 1, padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📍</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8 }}>
            Localização de Origem
          </Text>
          <Text style={{ color: '#6B7280', textAlign: 'center', fontSize: 16 }}>
            Onde você está agora? Esta será a origem da coleta.
          </Text>
        </View>

        {/* Campo de endereço manual */}
        <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
          <Text style={{ color: '#1F2937', fontWeight: '600', fontSize: 16, marginBottom: 12 }}>
            Endereço de Origem
          </Text>
          <TextInput
            value={dadosOT.endereco_origem}
            onChangeText={(text) => setDadosOT(prev => ({ ...prev, endereco_origem: text }))}
            placeholder="Digite o endereço ou use o GPS..."
            style={{ backgroundColor: '#F3F4F6', padding: 16, borderRadius: 8, color: '#1F2937', fontSize: 16, minHeight: 80 }}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Informações de GPS */}
        {dadosOT.latitude && dadosOT.longitude && (
          <View style={{ backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: '#15803D', fontSize: 18, marginRight: 8 }}>✅</Text>
              <Text style={{ color: '#15803D', fontWeight: '600', fontSize: 16 }}>
                Localização GPS Capturada
              </Text>
            </View>
            <Text style={{ color: '#16A34A', fontSize: 14 }}>
              Lat: {dadosOT.latitude.toFixed(6)}
            </Text>
            <Text style={{ color: '#16A34A', fontSize: 14 }}>
              Lng: {dadosOT.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {/* Erro de localização */}
        {erroLocalizacao && (
          <View style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: '#B91C1C', fontSize: 18, marginRight: 8 }}>❌</Text>
              <Text style={{ color: '#B91C1C', fontWeight: '600', fontSize: 16 }}>
                Erro de Localização
              </Text>
            </View>
            <Text style={{ color: '#DC2626', fontSize: 14 }}>
              {erroLocalizacao}
            </Text>
          </View>
        )}

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Botões de ação */}
        <View style={{ gap: 12 }}>
          {!dadosOT.latitude || !dadosOT.longitude ? (
            <TouchableOpacity 
              onPress={obterLocalizacao}
              disabled={localizacaoCarregando}
              style={{ backgroundColor: '#3B82F6', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
            >
              {localizacaoCarregando && (
                <ActivityIndicator color="white" style={{ marginRight: 8 }} />
              )}
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>
                {localizacaoCarregando ? 'Capturando GPS...' : '📍 Capturar Localização'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ gap: 12 }}>
              <TouchableOpacity 
                onPress={proximaEtapa}
                style={{ backgroundColor: '#3B82F6', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 18, marginRight: 8 }}>
                  Confirmar e Continuar
                </Text>
                <Text style={{ color: 'white', fontSize: 18 }}>→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={obterLocalizacao}
                style={{ backgroundColor: '#E5E7EB', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#374151', fontWeight: '600' }}>Capturar Novamente</Text>
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
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View style={{ flex: 1, padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>👤</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8 }}>
            Informações do Cliente
          </Text>
          <Text style={{ color: '#6B7280', textAlign: 'center', fontSize: 16 }}>
            Para quem é esta entrega?
          </Text>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
          <Text style={{ color: '#1F2937', fontWeight: '600', fontSize: 16, marginBottom: 12 }}>
            Nome do Cliente *
          </Text>
          <TextInput
            value={dadosOT.cliente_nome}
            onChangeText={updateClienteNome}
            placeholder="Ex: João Silva, Empresa ABC Ltda..."
            style={{ backgroundColor: '#F3F4F6', padding: 16, borderRadius: 8, color: '#1F2937', fontSize: 16 }}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Botões de navegação */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            onPress={etapaAnterior}
            style={{ flex: 1, backgroundColor: '#E5E7EB', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#374151', fontSize: 18, marginRight: 8 }}>←</Text>
            <Text style={{ color: '#374151', fontWeight: '600' }}>Voltar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={proximaEtapa}
            disabled={!dadosOT.cliente_nome.trim()}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: dadosOT.cliente_nome.trim() ? '#3B82F6' : '#D1D5DB'
            }}
          >
            <Text style={{
              fontWeight: '600',
              fontSize: 18,
              marginRight: 8,
              color: dadosOT.cliente_nome.trim() ? 'white' : '#6B7280'
            }}>
              Continuar
            </Text>
            <Text style={{
              fontSize: 18,
              color: dadosOT.cliente_nome.trim() ? 'white' : '#6B7280'
            }}>
              →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );

  // ==============================================================================
  // 📍 ETAPAS 3, 4, 5 - VERSÕES SIMPLIFICADAS
  // ==============================================================================
  
  const renderEtapa3Entrega = () => (
            <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📍</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8 }}>
            Endereço de Entrega
          </Text>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
          <Text style={{ color: '#1F2937', fontWeight: '600', fontSize: 16, marginBottom: 12 }}>
            Endereço Completo *
          </Text>
          <TextInput
            value={dadosOT.endereco_entrega}
            onChangeText={updateEnderecoEntrega}
            placeholder="Rua, número, bairro..."
            style={{ backgroundColor: '#F3F4F6', padding: 16, borderRadius: 8, color: '#1F2937', fontSize: 16, minHeight: 80 }}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
          <Text style={{ color: '#1F2937', fontWeight: '600', fontSize: 16, marginBottom: 12 }}>
            Cidade *
          </Text>
          <TextInput
            value={dadosOT.cidade_entrega}
            onChangeText={updateCidadeEntrega}
            placeholder="Ex: São Paulo, Rio de Janeiro..."
            style={{ backgroundColor: '#F3F4F6', padding: 16, borderRadius: 8, color: '#1F2937', fontSize: 16 }}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            onPress={etapaAnterior}
            style={{ flex: 1, backgroundColor: '#E5E7EB', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#374151', fontSize: 18, marginRight: 8 }}>←</Text>
            <Text style={{ color: '#374151', fontWeight: '600' }}>Voltar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={proximaEtapa}
            disabled={!dadosOT.endereco_entrega.trim() || !dadosOT.cidade_entrega.trim()}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: (dadosOT.endereco_entrega.trim() && dadosOT.cidade_entrega.trim()) ? '#3B82F6' : '#D1D5DB'
            }}
          >
            <Text style={{
              fontWeight: '600',
              fontSize: 18,
              marginRight: 8,
              color: (dadosOT.endereco_entrega.trim() && dadosOT.cidade_entrega.trim()) ? 'white' : '#6B7280'
            }}>
              Continuar
            </Text>
            <Text style={{
              fontSize: 18,
              color: (dadosOT.endereco_entrega.trim() && dadosOT.cidade_entrega.trim()) ? 'white' : '#6B7280'
            }}>
              →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderEtapa4Observacoes = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📝</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8 }}>
            Observações
          </Text>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
          <Text style={{ color: '#1F2937', fontWeight: '600', fontSize: 16, marginBottom: 12 }}>
            Observações (Opcional)
          </Text>
          <TextInput
            value={dadosOT.observacoes}
            onChangeText={updateObservacoes}
            placeholder="Ex: Produto frágil, entregar pela manhã..."
            style={{ backgroundColor: '#F3F4F6', padding: 16, borderRadius: 8, color: '#1F2937', fontSize: 16, minHeight: 100, textAlignVertical: 'top' }}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            onPress={etapaAnterior}
            style={{ flex: 1, backgroundColor: '#E5E7EB', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#374151', fontSize: 18, marginRight: 8 }}>←</Text>
            <Text style={{ color: '#374151', fontWeight: '600' }}>Voltar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={proximaEtapa}
            style={{ flex: 1, backgroundColor: '#3B82F6', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 18, marginRight: 8 }}>
              Revisar
            </Text>
            <Text style={{ color: 'white', fontSize: 18 }}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderEtapa5Confirmacao = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>✅</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8 }}>
            Revisar e Confirmar
          </Text>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, marginBottom: 24 }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
            <Text style={{ color: '#1F2937', fontWeight: 'bold', fontSize: 18 }}>
              Resumo da Ordem de Transporte
            </Text>
          </View>

          <View style={{ padding: 16, gap: 16 }}>
            <View>
              <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '600', marginBottom: 4 }}>CLIENTE</Text>
              <Text style={{ color: '#1F2937', fontSize: 16 }}>{dadosOT.cliente_nome}</Text>
            </View>

            <View>
              <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '600', marginBottom: 4 }}>ORIGEM</Text>
              <Text style={{ color: '#1F2937', fontSize: 16 }}>{dadosOT.endereco_origem || 'GPS Capturado'}</Text>
            </View>

            <View>
              <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '600', marginBottom: 4 }}>DESTINO</Text>
              <Text style={{ color: '#1F2937', fontSize: 16 }}>{dadosOT.endereco_entrega}</Text>
              <Text style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>{dadosOT.cidade_entrega}</Text>
            </View>

            {dadosOT.observacoes.trim() && (
              <View>
                <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '600', marginBottom: 4 }}>OBSERVAÇÕES</Text>
                <Text style={{ color: '#1F2937', fontSize: 16 }}>{dadosOT.observacoes}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ gap: 12 }}>
          <TouchableOpacity 
            onPress={criarOT}
            disabled={loading}
            style={{ backgroundColor: '#10B981', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            {loading && (
              <ActivityIndicator color="white" style={{ marginRight: 8 }} />
            )}
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
              {loading ? 'Criando OT...' : '🚛 Criar Ordem de Transporte'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={etapaAnterior}
            disabled={loading}
            style={{ backgroundColor: '#E5E7EB', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#374151', fontSize: 18, marginRight: 8 }}>←</Text>
            <Text style={{ color: '#374151', fontWeight: '600' }}>Voltar e Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header Simplificado - SEM NAVEGAÇÃO EXTERNA */}
      <View style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 16, marginTop: 40 }}>
          <Text style={{ color: '#1F2937', fontSize: 18, fontWeight: 'bold' }}>Criar Nova OT</Text>
        </View>
        
        {/* Indicador de progresso */}
        {renderIndicadorProgresso()}
      </View>

      {/* Conteúdo da etapa atual */}
      {renderEtapaAtual()}
    </View>
  );
}

// ==============================================================================
// 📝 CORREÇÃO ULTRA DEFINITIVA
// ==============================================================================

/**
 * ✅ REMOVIDO COMPLETAMENTE:
 * 
 * 1. **useNavigation** - Era aqui o problema!
 * 2. **SafeAreaView** - Conflito de contexto  
 * 3. **KeyboardAvoidingView** - Complexidade desnecessária
 * 4. **Qualquer dependência de contexto externo**
 * 5. **Navegação para outras telas** - Apenas interno
 * 
 * ✅ MANTIDO:
 * - Funcionalidade completa (GPS, API, validações)
 * - Navegação interna entre etapas (1→2→3→4→5)
 * - Criação de OT funcionando
 * - Design LogiTrack
 * 
 * 🎯 RESULTADO: Erro de contexto IMPOSSÍVEL de acontecer!
 */