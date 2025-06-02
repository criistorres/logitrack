import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Button, Card, Input, ScreenContainer } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

export function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { requestPasswordReset, confirmPasswordReset } = useAuth();
  
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  console.log('🔄 ForgotPasswordScreen: Renderizando versão profissional');
  
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleRequestReset = async () => {
    if (!formData.email.trim()) {
      Alert.alert('Email Obrigatório', 'Por favor, digite seu email para continuar.');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Email Inválido', 'Por favor, digite um email válido.');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await requestPasswordReset(formData.email.trim().toLowerCase());
      
      Alert.alert(
        'Código Enviado! 📧',
        'Um código de 6 dígitos foi enviado para seu email. O código expira em 30 minutos.',
        [{ text: 'Continuar', onPress: () => setStep('code') }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmReset = async () => {
    // Validações
    if (!formData.code.trim() || formData.code.length !== 6) {
      Alert.alert('Código Inválido', 'Digite o código de 6 dígitos enviado para seu email.');
      return;
    }
    
    if (!formData.new_password || formData.new_password.length < 8) {
      Alert.alert('Senha Fraca', 'A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    
    if (formData.new_password !== formData.confirm_password) {
      Alert.alert('Senhas Diferentes', 'As senhas digitadas não coincidem.');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await confirmPasswordReset({
        code: formData.code.trim(),
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      });
      
      if (result.success) {
        Alert.alert(
          'Senha Redefinida! 🎉',
          'Sua senha foi alterada com sucesso. Faça login com a nova senha.',
          [{ text: 'Fazer Login', onPress: () => navigation.navigate('Login' as never) }]
        );
      } else {
        Alert.alert('Erro', result.message || 'Código inválido ou expirado.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível redefinir a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const goToLogin = () => {
    navigation.navigate('Login' as never);
  };
  
  return (
    <ScreenContainer 
      title="Redefinir Senha"
      subtitle="Recupere o acesso à sua conta"
      showBackButton 
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-warning-500 rounded-2xl items-center justify-center shadow-lg shadow-warning-500/30 mb-4">
            <Text className="text-white text-3xl">{step === 'email' ? '🔐' : '📧'}</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900 mb-2">
            {step === 'email' ? 'Esqueceu sua senha?' : 'Digite o código'}
          </Text>
          <Text className="text-neutral-600 text-center">
            {step === 'email' 
              ? 'Digite seu email para receber um código de redefinição'
              : 'Enviamos um código de 6 dígitos para seu email'
            }
          </Text>
        </View>
        
        <Card variant="elevated" padding="lg" className="mb-6">
          
          {step === 'email' ? (
            <>
              <Input
                label="Email da Conta"
                placeholder="Digite seu email cadastrado"
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                leftIcon="📧"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                variant="outlined"
                size="lg"
                required
              />
              
              <Button
                title="Enviar Código de Redefinição"
                onPress={handleRequestReset}
                loading={loading}
                variant="primary"
                size="lg"
                leftIcon="📤"
                fullWidth
                className="mb-4"
              />
            </>
          ) : (
            <>
              {/* Info do Email */}
              <Card variant="filled" padding="md" className="mb-6 bg-primary-50 border-primary-200">
                <View className="flex-row items-center">
                  <Text className="text-primary-500 mr-3 text-lg">📧</Text>
                  <View className="flex-1">
                    <Text className="text-primary-700 font-semibold text-sm">Código enviado para:</Text>
                    <Text className="text-primary-600 text-sm">{formData.email}</Text>
                  </View>
                </View>
              </Card>
              
              <Input
                label="Código de 6 Dígitos"
                placeholder="123456"
                value={formData.code}
                onChangeText={(text) => updateField('code', text.replace(/\D/g, '').slice(0, 6))}
                leftIcon="🔢"
                keyboardType="numeric"
                maxLength={6}
                variant="outlined"
                size="lg"
                hint="Verifique sua caixa de entrada e spam"
                required
              />
              
              <Input
                label="Nova Senha"
                placeholder="Mínimo 8 caracteres"
                value={formData.new_password}
                onChangeText={(text) => updateField('new_password', text)}
                leftIcon="🔐"
                secureTextEntry
                variant="outlined"
                size="lg"
                required
              />
              
              <Input
                label="Confirmar Nova Senha"
                placeholder="Digite a senha novamente"
                value={formData.confirm_password}
                onChangeText={(text) => updateField('confirm_password', text)}
                leftIcon="🔐"
                secureTextEntry
                variant="outlined"
                size="lg"
                required
              />
              
              <Button
                title="Redefinir Minha Senha"
                onPress={handleConfirmReset}
                loading={loading}
                variant="success"
                size="lg"
                leftIcon="✅"
                fullWidth
                className="mb-4"
              />
              
              {/* Voltar para Email */}
              <Button
                title="← Voltar para Email"
                onPress={() => setStep('email')}
                variant="ghost"
                size="md"
                className="mb-2"
              />
            </>
          )}
          
          {/* Link Login */}
          <View className="flex-row justify-center items-center">
            <Text className="text-neutral-600">Lembrou da senha? </Text>
            <Text
              onPress={goToLogin}
              className="text-primary-500 font-semibold active:text-primary-600"
            >
              Fazer login
            </Text>
          </View>
        </Card>
        
        {/* Dicas de Segurança */}
        <Card variant="outlined" padding="md" className="border-neutral-200">
          <View className="flex-row items-start">
            <Text className="text-neutral-400 mr-3 text-lg">💡</Text>
            <View className="flex-1">
              <Text className="text-neutral-700 font-semibold mb-1">Dicas de Segurança</Text>
              <Text className="text-neutral-600 text-sm leading-5">
                • O código expira em 30 minutos{'\n'}
                • Máximo 3 tentativas por código{'\n'}
                • Use uma senha forte e única{'\n'}
                • Não compartilhe seu código com ninguém
              </Text>
            </View>
          </View>
        </Card>
        
      </ScrollView>
    </ScreenContainer>
  );
}