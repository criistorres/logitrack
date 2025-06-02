// ==============================================================================
// 📝 TELA DE REGISTRO - DESIGN PROFISSIONAL LOGITRACK
// ==============================================================================

// Arquivo: mobile/src/screens/auth/RegisterScreen.tsx
// SUBSTITUA o conteúdo atual por esta versão profissional

import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Button, Card, Input, ScreenContainer } from '../../components/ui';
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
  
  console.log('📝 RegisterScreen: Renderizando versão profissional');
  
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Formatadores
  const formatCPF = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/);
    if (match) {
      return [match[1], match[2], match[3], match[4]]
        .filter(Boolean)
        .join('.')
        .replace(/\.(\d{2})$/, '-$1');
    }
    return text;
  };
  
  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    if (match) {
      return [match[1], match[2], match[3]]
        .filter(Boolean)
        .join('')
        .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return text;
  };
  
  const handleRegister = async () => {
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
      const result = await register(formData);
      
      if (result.success) {
        Alert.alert(
          'Conta Criada! 🎉', 
          'Sua conta foi criada com sucesso! Aguarde a ativação pela equipe de logística.',
          [{ text: 'Fazer Login', onPress: () => navigation.navigate('Login' as never) }]
        );
      } else {
        Alert.alert('Erro no Cadastro', result.message || 'Não foi possível criar sua conta. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };
  
  const goToLogin = () => {
    navigation.navigate('Login' as never);
  };
  
  return (
    <ScreenContainer 
      title="Criar Conta"
      subtitle="Cadastre-se para acessar a plataforma"
      showBackButton 
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-accent-500 rounded-2xl items-center justify-center shadow-lg shadow-accent-500/30 mb-4">
            <Text className="text-white text-3xl">📝</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900 mb-2">
            Junte-se ao LogiTrack
          </Text>
          <Text className="text-neutral-600 text-center">
            Crie sua conta gratuita e comece a gerenciar{'\n'}suas operações de transporte
          </Text>
        </View>
        
        {/* Form */}
        <Card variant="elevated" padding="lg" className="mb-6">
          
          {/* Informações Pessoais */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-neutral-900 mb-3">
              📋 Informações Pessoais
            </Text>
            
            <Input
              label="Nome"
              placeholder="Seu primeiro nome"
              value={formData.first_name}
              onChangeText={(text) => updateField('first_name', text)}
              leftIcon="👤"
              variant="outlined"
              required
            />
            
            <Input
              label="Sobrenome"
              placeholder="Seu sobrenome"
              value={formData.last_name}
              onChangeText={(text) => updateField('last_name', text)}
              leftIcon="👤"
              variant="outlined"
              required
            />
            
            <Input
              label="Email Profissional"
              placeholder="seu.email@empresa.com"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              leftIcon="📧"
              keyboardType="email-address"
              autoCapitalize="none"
              variant="outlined"
              required
            />
            
            <Input
              label="CPF"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChangeText={(text) => updateField('cpf', formatCPF(text))}
              leftIcon="📄"
              keyboardType="numeric"
              maxLength={14}
              variant="outlined"
              required
            />
            
            <Input
              label="Telefone"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChangeText={(text) => updateField('phone', formatPhone(text))}
              leftIcon="📱"
              keyboardType="phone-pad"
              maxLength={15}
              variant="outlined"
            />
          </View>
          
          {/* Informações da CNH */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-neutral-900 mb-3">
              🚗 Informações da CNH
            </Text>
            
            <Input
              label="Número da CNH"
              placeholder="12345678901"
              value={formData.cnh_numero}
              onChangeText={(text) => updateField('cnh_numero', text)}
              leftIcon="🪪"
              keyboardType="numeric"
              variant="outlined"
            />
            
            {/* Categoria CNH */}
            <View className="mb-4">
              <Text className="text-neutral-700 text-sm font-semibold mb-2">
                Categoria da CNH
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {['A', 'B', 'AB', 'C', 'D', 'E'].map((categoria) => (
                  <Button
                    key={categoria}
                    title={categoria}
                    onPress={() => updateField('cnh_categoria', categoria)}
                    variant={formData.cnh_categoria === categoria ? 'primary' : 'outline'}
                    size="sm"
                  />
                ))}
              </View>
            </View>
            
            <Input
              label="Validade da CNH"
              placeholder="2025-12-31"
              value={formData.cnh_validade}
              onChangeText={(text) => updateField('cnh_validade', text)}
              leftIcon="📅"
              hint="Formato: YYYY-MM-DD"
              variant="outlined"
            />
          </View>
          
          {/* Informações de Acesso */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-neutral-900 mb-3">
              🔒 Informações de Acesso
            </Text>
            
            <Input
              label="Senha"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              leftIcon="🔐"
              secureTextEntry
              variant="outlined"
              hint="Use uma senha forte com letras, números e símbolos"
              required
            />
            
            <Input
              label="Confirmar Senha"
              placeholder="Digite a senha novamente"
              value={formData.password_confirm}
              onChangeText={(text) => updateField('password_confirm', text)}
              leftIcon="🔐"
              secureTextEntry
              variant="outlined"
              required
            />
          </View>
          
          {/* Botões */}
          <Button
            title="Criar Conta Gratuita"
            onPress={handleRegister}
            loading={loading}
            variant="accent"
            size="lg"
            leftIcon="🚀"
            fullWidth
            className="mb-4"
          />
          
          {/* Login Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-neutral-600">Já tem uma conta? </Text>
            <Text
              onPress={goToLogin}
              className="text-primary-500 font-semibold active:text-primary-600"
            >
              Fazer login
            </Text>
          </View>
        </Card>
        
        {/* Footer */}
        <Card variant="filled" padding="md" className="mb-6">
          <View className="flex-row items-start">
            <Text className="text-success-500 mr-3 text-lg">✅</Text>
            <View className="flex-1">
              <Text className="text-neutral-700 font-semibold mb-1">Conta Gratuita</Text>
              <Text className="text-neutral-600 text-sm">
                Sua conta será ativada pela equipe de logística em até 24 horas após o cadastro.
              </Text>
            </View>
          </View>
        </Card>
        
      </ScrollView>
    </ScreenContainer>
  );
}