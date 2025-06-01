// src/components/forms/ForgotPasswordForm.tsx

import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../ui';

// ==============================================================================
// 🔄 FORMULÁRIO DE RESET DE SENHA
// ==============================================================================

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onLogin?: () => void;
}

export function ForgotPasswordForm({ onSuccess, onLogin }: ForgotPasswordFormProps) {
  const { requestPasswordReset, confirmPasswordReset } = useAuth();
  
  // Estados do formulário
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Atualizar campo do formulário
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  // Submeter email para reset
  const handleRequestReset = async () => {
    console.log('🔄 ForgotPasswordForm: Solicitando reset...');
    
    if (!formData.email.trim()) {
      setErrors({ email: 'Email é obrigatório' });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Email inválido' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await requestPasswordReset(formData.email.trim().toLowerCase());
      
      if (result.success) {
        console.log('✅ ForgotPasswordForm: Código enviado');
        Alert.alert(
          'Código Enviado!',
          'Um código de 6 dígitos foi enviado para seu email. O código expira em 30 minutos.',
          [{ text: 'OK', onPress: () => setStep('code') }]
        );
      } else {
        Alert.alert('Aviso', result.message);
        // Mesmo com "erro", prosseguir para tela de código por segurança
        setStep('code');
      }
    } catch (error) {
      console.error('❌ ForgotPasswordForm: Erro:', error);
      Alert.alert('Erro', 'Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Confirmar reset com código
  const handleConfirmReset = async () => {
    console.log('🔄 ForgotPasswordForm: Confirmando reset...');
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.code.trim()) newErrors.code = 'Código é obrigatório';
    if (formData.code.length !== 6) newErrors.code = 'Código deve ter 6 dígitos';
    if (!formData.new_password) newErrors.new_password = 'Nova senha é obrigatória';
    if (formData.new_password.length < 8) newErrors.new_password = 'Senha deve ter pelo menos 8 caracteres';
    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Senhas não coincidem';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await confirmPasswordReset({
        code: formData.code.trim(),
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      });
      
      if (result.success) {
        console.log('✅ ForgotPasswordForm: Senha alterada');
        Alert.alert(
          'Sucesso!',
          'Sua senha foi redefinida com sucesso. Faça login com a nova senha.',
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        console.log('❌ ForgotPasswordForm: Erro na confirmação:', result.message);
        
        if (result.errors) {
          const apiErrors: Record<string, string> = {};
          Object.keys(result.errors).forEach(key => {
            const errorArray = result.errors[key];
            if (Array.isArray(errorArray) && errorArray.length > 0) {
              apiErrors[key] = errorArray[0];
            }
          });
          setErrors(apiErrors);
        } else {
          Alert.alert('Erro', result.message);
        }
      }
    } catch (error) {
      console.error('❌ ForgotPasswordForm: Erro:', error);
      Alert.alert('Erro', 'Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (step === 'email') {
    return (
      <View>
        <Input
          label="Email"
          placeholder="Digite seu email cadastrado"
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          error={errors.email}
          leftIcon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          required
        />
        
        <Button
          title="Enviar Código"
          onPress={handleRequestReset}
          loading={isLoading}
          leftIcon="send-outline"
          className="mb-4"
        />
        
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600">Lembrou da senha? </Text>
          <Text
            onPress={onLogin}
            className="text-blue-500 font-medium"
          >
            Fazer login
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View>
      <View className="bg-blue-50 p-4 rounded-lg mb-6">
        <Text className="text-blue-800 text-sm text-center">
          📧 Código enviado para: {formData.email}
        </Text>
        <Text className="text-blue-600 text-xs text-center mt-1">
          Verifique sua caixa de entrada e spam
        </Text>
      </View>
      
      <Input
        label="Código de 6 dígitos"
        placeholder="123456"
        value={formData.code}
        onChangeText={(text) => updateField('code', text.replace(/\D/g, '').slice(0, 6))}
        error={errors.code}
        leftIcon="keypad-outline"
        keyboardType="numeric"
        maxLength={6}
        required
      />
      
      <Input
        label="Nova Senha"
        placeholder="Mínimo 8 caracteres"
        value={formData.new_password}
        onChangeText={(text) => updateField('new_password', text)}
        error={errors.new_password}
        leftIcon="lock-closed-outline"
        secureTextEntry={true}
        required
      />
      
      <Input
        label="Confirmar Nova Senha"
        placeholder="Digite a senha novamente"
        value={formData.confirm_password}
        onChangeText={(text) => updateField('confirm_password', text)}
        error={errors.confirm_password}
        leftIcon="lock-closed-outline"
        secureTextEntry={true}
        required
      />
      
      <Button
        title="Redefinir Senha"
        onPress={handleConfirmReset}
        loading={isLoading}
        leftIcon="checkmark-outline"
        className="mb-4"
      />
      
      <View className="flex-row justify-center items-center space-x-4">
        <Text
          onPress={() => setStep('email')}
          className="text-blue-500 font-medium"
        >
          ← Voltar
        </Text>
        <Text className="text-gray-400">|</Text>
        <Text
          onPress={onLogin}
          className="text-blue-500 font-medium"
        >
          Fazer login
        </Text>
      </View>
    </View>
  );
}