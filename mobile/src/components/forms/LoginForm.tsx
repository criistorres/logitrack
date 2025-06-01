// src/components/forms/LoginForm.tsx

import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../ui';

// ==============================================================================
// 🔐 FORMULÁRIO DE LOGIN
// ==============================================================================

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

export function LoginForm({ onSuccess, onForgotPassword, onRegister }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Atualizar campo do formulário
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validar senha
    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submeter formulário
  const handleSubmit = async () => {
    console.log('🔐 LoginForm: Iniciando submit...');
    
    if (!validateForm()) {
      console.log('❌ LoginForm: Formulário inválido');
      return;
    }
    
    try {
      const result = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      
      if (result.success) {
        console.log('✅ LoginForm: Login bem-sucedido');
        onSuccess?.();
      } else {
        console.log('❌ LoginForm: Erro no login:', result.message);
        
        // Tratar erros específicos
        if (result.errors?.credentials) {
          setErrors({ 
            email: 'Email ou senha incorretos',
            password: 'Email ou senha incorretos'
          });
        } else if (result.errors) {
          // Mapear erros da API para campos do formulário
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
      console.error('❌ LoginForm: Erro inesperado:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    }
  };
  
  return (
    <View>
      {/* Campo Email */}
      <Input
        label="Email"
        placeholder="Digite seu email"
        value={formData.email}
        onChangeText={(text) => updateField('email', text)}
        error={errors.email}
        leftIcon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        required
      />
      
      {/* Campo Senha */}
      <Input
        label="Senha"
        placeholder="Digite sua senha"
        value={formData.password}
        onChangeText={(text) => updateField('password', text)}
        error={errors.password}
        leftIcon="lock-closed-outline"
        secureTextEntry={true}
        required
      />
      
      {/* Link Esqueci Senha */}
      <View className="mb-6">
        <Text
          onPress={onForgotPassword}
          className="text-blue-500 text-sm text-right font-medium"
        >
          Esqueci minha senha
        </Text>
      </View>
      
      {/* Botão Login */}
      <Button
        title="Entrar"
        onPress={handleSubmit}
        loading={isLoading}
        leftIcon="log-in-outline"
        className="mb-4"
      />
      
      {/* Link Criar Conta */}
      <View className="flex-row justify-center items-center">
        <Text className="text-gray-600">Não tem uma conta? </Text>
        <Text
          onPress={onRegister}
          className="text-blue-500 font-medium"
        >
          Criar conta
        </Text>
      </View>
    </View>
  );
}