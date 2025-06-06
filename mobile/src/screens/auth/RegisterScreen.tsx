// mobile/src/screens/auth/RegisterScreen.tsx - VERSÃO CORRIGIDA

import { useNavigation } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { 
  Alert, 
  ScrollView, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    cpf: '',
    phone: '',
    role: 'motorista' as const,
    cnh_numero: '',
    cnh_categoria: 'B',
    cnh_validade: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  console.log('📝 RegisterScreen: Renderizando versão corrigida');

  // ==============================================================================
  // 🔧 FUNÇÕES OTIMIZADAS (useCallback para evitar re-renders)
  // ==============================================================================
  
  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Formatadores
  const formatCPF = useCallback((text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/);
    if (match) {
      return [match[1], match[2], match[3], match[4]]
        .filter(Boolean)
        .join('.')
        .replace(/\.(\d{2})$/, '-$1');
    }
    return text;
  }, []);
  
  const formatPhone = useCallback((text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    if (match) {
      return [match[1], match[2], match[3]]
        .filter(Boolean)
        .join('')
        .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return text;
  }, []);

  const formatCNHValidade = useCallback((text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/(\d{0,4})(\d{0,2})(\d{0,2})/);
    if (match) {
      return [match[1], match[2], match[3]]
        .filter(Boolean)
        .join('-')
        .replace(/(\d{4})-(\d{2})-(\d{2})/, '$1-$2-$3');
    }
    return text;
  }, []);
  
  const handleRegister = useCallback(async () => {
    // Validação básica
    if (!formData.email.trim() || !formData.password || !formData.first_name.trim()) {
      Alert.alert('Dados Incompletos', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    if (formData.password !== formData.password_confirm) {
      Alert.alert('Senhas Diferentes', 'As senhas digitadas não coincidem. Verifique e tente novamente.');
      return;
    }
    
    if (formData.password.length < 8) {
      Alert.alert('Senha Fraca', 'A senha deve ter pelo menos 8 caracteres para maior segurança.');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('📝 RegisterScreen: Iniciando registro...');
      const result = await register(formData);
      
      if (result.success) {
        Alert.alert(
          'Conta Criada! 🎉', 
          'Sua conta foi criada com sucesso! O time de logistica irá avaliar seu cadastro dentro de 24horas.'
        );
      } else {
        Alert.alert('Erro no Cadastro', result.message || 'Não foi possível criar sua conta. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ RegisterScreen: Erro no registro:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, [formData, register, navigation]);
  
  const goToLogin = useCallback(() => {
    navigation.navigate('Login' as never);
  }, [navigation]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-4 pb-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between px-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 rounded-full bg-gray-100"
          >
            <Text className="text-gray-600 text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            Criar Conta
          </Text>
          <View className="w-10" />
        </View>
      </View>

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
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-blue-500 rounded-2xl items-center justify-center shadow-lg mb-4">
                <Text className="text-white text-3xl">📝</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                Junte-se ao LogiTrack
              </Text>
              <Text className="text-gray-600 text-center">
                Crie sua conta gratuita e comece a gerenciar{'\n'}suas operações de transporte
              </Text>
            </View>
            
            {/* Form */}
            <View className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
              
              {/* Informações Pessoais */}
              <View className="mb-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  📋 Informações Pessoais
                </Text>
                
                <View className="space-y-4">
                  <View>
                    <Text className="text-gray-700 font-semibold mb-2">Nome *</Text>
                    <TextInput
                      value={formData.first_name}
                      onChangeText={(text) => updateField('first_name', text)}
                      placeholder="Seu primeiro nome"
                      className="border border-gray-300 rounded-lg p-4 text-base bg-white"
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 font-semibold mb-2">Sobrenome *</Text>
                    <TextInput
                      value={formData.last_name}
                      onChangeText={(text) => updateField('last_name', text)}
                      placeholder="Seu sobrenome"
                      className="border border-gray-300 rounded-lg p-4 text-base bg-white"
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 font-semibold mb-2">Email *</Text>
                    <TextInput
                      value={formData.email}
                      onChangeText={(text) => updateField('email', text)}
                      placeholder="seu.email@exemplo.com"
                      className="border border-gray-300 rounded-lg p-4 text-base bg-white"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 font-semibold mb-2">CPF *</Text>
                    <TextInput
                      value={formData.cpf}
                      onChangeText={(text) => updateField('cpf', formatCPF(text))}
                      placeholder="000.000.000-00"
                      className="border border-gray-300 rounded-lg p-4 text-base bg-white"
                      keyboardType="numeric"
                      maxLength={14}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 font-semibold mb-2">Telefone</Text>
                    <TextInput
                      value={formData.phone}
                      onChangeText={(text) => updateField('phone', formatPhone(text))}
                      placeholder="(11) 99999-9999"
                      className="border border-gray-300 rounded-lg p-4 text-base bg-white"
                      keyboardType="phone-pad"
                      maxLength={15}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>
                </View>
              </View>

              {/* Informações Profissionais */}
              <View className="mb-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  🚛 Informações Profissionais
                </Text>
                
                <View className="space-y-4">
                  <View>
                    <Text className="text-gray-700 font-semibold mb-2">Perfil</Text>
                    <View className="flex-row space-x-2">
                      <TouchableOpacity
                        onPress={() => updateField('role', 'motorista')}
                        className={`flex-1 p-3 rounded-lg border ${
                          formData.role === 'motorista' 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'bg-gray-100 border-gray-300'
                        }`}
                      >
                        <Text className={`text-center font-semibold ${
                          formData.role === 'motorista' ? 'text-white' : 'text-gray-700'
                        }`}>
                          🚛 Motorista
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => updateField('role', 'logistica')}
                        className={`flex-1 p-3 rounded-lg border ${
                          formData.role === 'logistica' 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'bg-gray-100 border-gray-300'
                        }`}
                      >
                        <Text className={`text-center font-semibold ${
                          formData.role === 'logistica' ? 'text-white' : 'text-gray-700'
                        }`}>
                          📊 Logística
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {formData.role === 'motorista' && (
                    <>
                      <View>
                        <Text className="text-gray-700 font-semibold mb-2">Número da CNH</Text>
                        <TextInput
                          value={formData.cnh_numero}
                          onChangeText={(text) => updateField('cnh_numero', text)}
                          placeholder="123456789"
                          className="border border-gray-300 rounded-lg p-4 text-base bg-white"
                          keyboardType="numeric"
                          returnKeyType="next"
                          blurOnSubmit={false}
                        />
                      </View>

                      <View>
                        <Text className="text-gray-700 font-semibold mb-2">Categoria da CNH</Text>
                        <View className="flex-row space-x-2">
                          {['A', 'B', 'C', 'D', 'E'].map((categoria) => (
                            <TouchableOpacity
                              key={categoria}
                              onPress={() => updateField('cnh_categoria', categoria)}
                              className={`flex-1 p-3 rounded-lg border ${
                                formData.cnh_categoria === categoria 
                                  ? 'bg-blue-500 border-blue-500' 
                                  : 'bg-gray-100 border-gray-300'
                              }`}
                            >
                              <Text className={`text-center font-semibold ${
                                formData.cnh_categoria === categoria ? 'text-white' : 'text-gray-700'
                              }`}>
                                {categoria}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      <View>
                        <Text className="text-gray-700 font-semibold mb-2">Validade da CNH</Text>
                        <TextInput
                          value={formData.cnh_validade}
                          onChangeText={(text) => updateField('cnh_validade', formatCNHValidade(text))}
                          placeholder="2025-12-31"
                          className="border border-gray-300 rounded-lg p-4 text-base bg-white"
                          returnKeyType="next"
                          blurOnSubmit={false}
                        />
                        <Text className="text-gray-500 text-sm mt-1">Formato: AAAA-MM-DD</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
              
              {/* Informações de Acesso */}
              <View className="mb-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  🔒 Informações de Acesso
                </Text>
                
                <View className="space-y-4">
                  <View>
                    <Text className="text-gray-700 font-semibold mb-2">Senha *</Text>
                    <TextInput
                      value={formData.password}
                      onChangeText={(text) => updateField('password', text)}
                      placeholder="Mínimo 8 caracteres"
                      className="border border-gray-300 rounded-lg p-4 text-base bg-white"
                      secureTextEntry
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                    <Text className="text-gray-500 text-sm mt-1">
                      Use uma senha forte com letras, números e símbolos
                    </Text>
                  </View>
                  
                  <View>
                    <Text className="text-gray-700 font-semibold mb-2">Confirmar Senha *</Text>
                    <TextInput
                      value={formData.password_confirm}
                      onChangeText={(text) => updateField('password_confirm', text)}
                      placeholder="Digite a senha novamente"
                      className="border border-gray-300 rounded-lg p-4 text-base bg-white"
                      secureTextEntry
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>
              
              {/* Botão Criar Conta */}
              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                className="bg-blue-500 p-4 rounded-lg flex-row items-center justify-center mb-4"
              >
                {loading && <ActivityIndicator color="white" className="mr-2" />}
                <Text className="text-white font-semibold text-lg">
                  {loading ? 'Criando Conta...' : '🚀 Criar Conta Gratuita'}
                </Text>
              </TouchableOpacity>
              
              {/* Link Login */}
              <View className="flex-row justify-center items-center">
                <Text className="text-gray-600">Já tem uma conta? </Text>
                <TouchableOpacity onPress={goToLogin}>
                  <Text className="text-blue-500 font-semibold">
                    Fazer login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Footer */}
            <View className="bg-green-50 p-4 rounded-lg border border-green-200">
              <View className="flex-row items-start">
                <Text className="text-green-500 mr-3 text-lg">✅</Text>
                <View className="flex-1">
                  <Text className="text-gray-700 font-semibold mb-1">Conta Gratuita</Text>
                  <Text className="text-gray-600 text-sm">
                    Sua conta será ativada automaticamente e você poderá começar a usar imediatamente.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}