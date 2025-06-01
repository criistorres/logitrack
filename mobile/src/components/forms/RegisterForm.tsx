// src/components/forms/RegisterForm.tsx

import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../ui';

// ==============================================================================
// 📝 FORMULÁRIO DE REGISTRO
// ==============================================================================

interface RegisterFormProps {
  onSuccess?: () => void;
  onLogin?: () => void;
}

export function RegisterForm({ onSuccess, onLogin }: RegisterFormProps) {
  const { register, isLoading } = useAuth();
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    cpf: '',
    phone: '',
    role: 'motorista' as 'motorista' | 'logistica' | 'admin',
    cnh_numero: '',
    cnh_categoria: 'B' as string,
    cnh_validade: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Atualizar campo do formulário
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  // Formatar CPF
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
  
  // Formatar telefone
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
  
  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validar campos obrigatórios
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    if (!formData.password_confirm) newErrors.password_confirm = 'Confirmação de senha é obrigatória';
    if (!formData.first_name.trim()) newErrors.first_name = 'Nome é obrigatório';
    if (!formData.last_name.trim()) newErrors.last_name = 'Sobrenome é obrigatório';
    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
    
    // Validar email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validar senha
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    }
    
    // Validar confirmação de senha
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Senhas não coincidem';
    }
    
    // Validar CPF (formato básico)
    const cpfNumbers = formData.cpf.replace(/\D/g, '');
    if (formData.cpf && cpfNumbers.length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
    }
    
    // Validar campos específicos de motorista
    if (formData.role === 'motorista') {
      if (!formData.cnh_numero.trim()) newErrors.cnh_numero = 'Número da CNH é obrigatório para motoristas';
      if (!formData.cnh_categoria) newErrors.cnh_categoria = 'Categoria da CNH é obrigatória';
      if (!formData.cnh_validade) newErrors.cnh_validade = 'Validade da CNH é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submeter formulário
  const handleSubmit = async () => {
    console.log('📝 RegisterForm: Iniciando submit...');
    
    if (!validateForm()) {
      console.log('❌ RegisterForm: Formulário inválido');
      return;
    }
    
    try {
      // Preparar dados
      const submitData = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        cpf: formData.cpf.replace(/\D/g, ''), // Apenas números
        phone: formData.phone.replace(/\D/g, ''), // Apenas números
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      };
      
      const result = await register(submitData);
      
      if (result.success) {
        console.log('✅ RegisterForm: Registro bem-sucedido');
        Alert.alert(
          'Sucesso!', 
          'Conta criada com sucesso! Aguarde ativação pela equipe.',
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        console.log('❌ RegisterForm: Erro no registro:', result.message);
        
        if (result.errors) {
          // Mapear erros da API
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
      console.error('❌ RegisterForm: Erro inesperado:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    }
  };
  
  return (
    <View>
      {/* Informações Pessoais */}
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Informações Pessoais
      </Text>
      
      <Input
        label="Nome"
        placeholder="Seu primeiro nome"
        value={formData.first_name}
        onChangeText={(text) => updateField('first_name', text)}
        error={errors.first_name}
        leftIcon="person-outline"
        required
      />
      
      <Input
        label="Sobrenome"
        placeholder="Seu sobrenome"
        value={formData.last_name}
        onChangeText={(text) => updateField('last_name', text)}
        error={errors.last_name}
        leftIcon="person-outline"
        required
      />
      
      <Input
        label="Email"
        placeholder="seu@email.com"
        value={formData.email}
        onChangeText={(text) => updateField('email', text)}
        error={errors.email}
        leftIcon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        required
      />
      
      <Input
        label="CPF"
        placeholder="000.000.000-00"
        value={formData.cpf}
        onChangeText={(text) => updateField('cpf', formatCPF(text))}
        error={errors.cpf}
        leftIcon="card-outline"
        keyboardType="numeric"
        maxLength={14}
        required
      />
      
      <Input
        label="Telefone"
        placeholder="(11) 99999-9999"
        value={formData.phone}
        onChangeText={(text) => updateField('phone', formatPhone(text))}
        error={errors.phone}
        leftIcon="call-outline"
        keyboardType="phone-pad"
        maxLength={15}
      />
      
      {/* Informações de Acesso */}
      <Text className="text-lg font-semibold text-gray-900 mb-4 mt-6">
        Informações de Acesso
      </Text>
      
      <Input
        label="Senha"
        placeholder="Mínimo 8 caracteres"
        value={formData.password}
        onChangeText={(text) => updateField('password', text)}
        error={errors.password}
        leftIcon="lock-closed-outline"
        secureTextEntry={true}
        required
      />
      
      <Input
        label="Confirmar Senha"
        placeholder="Digite a senha novamente"
        value={formData.password_confirm}
        onChangeText={(text) => updateField('password_confirm', text)}
        error={errors.password_confirm}
        leftIcon="lock-closed-outline"
        secureTextEntry={true}
        required
      />
      
      {/* Informações de CNH (apenas para motoristas) */}
      {formData.role === 'motorista' && (
        <>
          <Text className="text-lg font-semibold text-gray-900 mb-4 mt-6">
            Informações da CNH
          </Text>
          
          <Input
            label="Número da CNH"
            placeholder="12345678901"
            value={formData.cnh_numero}
            onChangeText={(text) => updateField('cnh_numero', text)}
            error={errors.cnh_numero}
            leftIcon="card-outline"
            keyboardType="numeric"
            required
          />
          
          {/* Categoria CNH - Simulação de Select */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Categoria da CNH <Text className="text-red-500">*</Text>
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {['A', 'B', 'AB', 'C', 'D', 'E'].map((categoria) => (
                <Text
                  key={categoria}
                  onPress={() => updateField('cnh_categoria', categoria)}
                  className={`
                    px-4 py-2 rounded-lg border text-center min-w-[50px]
                    ${formData.cnh_categoria === categoria 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-700'
                    }
                  `}
                >
                  {categoria}
                </Text>
              ))}
            </View>
            {errors.cnh_categoria && (
              <Text className="text-red-500 text-sm mt-1 ml-1">
                {errors.cnh_categoria}
              </Text>
            )}
          </View>
          
          <Input
            label="Validade da CNH"
            placeholder="YYYY-MM-DD"
            value={formData.cnh_validade}
            onChangeText={(text) => updateField('cnh_validade', text)}
            error={errors.cnh_validade}
            leftIcon="calendar-outline"
            hint="Formato: YYYY-MM-DD (ex: 2025-12-31)"
            required
          />
        </>
      )}
      
      {/* Botões */}
      <View className="mt-8">
        <Button
          title="Criar Conta"
          onPress={handleSubmit}
          loading={isLoading}
          leftIcon="person-add-outline"
          className="mb-4"
        />
        
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600">Já tem uma conta? </Text>
          <Text
            onPress={onLogin}
            className="text-blue-500 font-medium"
          >
            Fazer login
          </Text>
        </View>
      </View>
    </View>
  );
}