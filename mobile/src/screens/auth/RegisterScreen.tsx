// mobile/src/screens/auth/RegisterScreen.tsx - ULTRA SIMPLIFICADO

import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

// ==============================================================================
// 📝 REGISTER SCREEN ULTRA SIMPLIFICADO
// ==============================================================================

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
  
  console.log('📝 RegisterScreen: Renderizando versão ultra simplificada');
  
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleRegister = async () => {
    // Validação básica
    if (!formData.email.trim() || !formData.password || !formData.first_name.trim()) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }
    
    if (formData.password !== formData.password_confirm) {
      Alert.alert('Erro', 'Senhas não coincidem');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        Alert.alert('Sucesso!', 'Conta criada com sucesso!', [
          { text: 'OK', onPress: () => navigation.navigate('Login' as never) }
        ]);
      } else {
        Alert.alert('Erro', result.message || 'Erro ao criar conta');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  };
  
  const goToLogin = () => {
    navigation.navigate('Login' as never);
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 20, 
        paddingTop: 50,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 18, color: '#3b82f6' }}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 20 }}>
          Criar Conta
        </Text>
      </View>
      
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <View style={{ 
          backgroundColor: 'white', 
          padding: 20, 
          borderRadius: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            marginBottom: 20, 
            textAlign: 'center' 
          }}>
            Criar Nova Conta
          </Text>
          
          {/* Nome */}
          <Text style={{ marginBottom: 5, fontWeight: '600' }}>Nome *</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              marginBottom: 15,
              fontSize: 16,
              backgroundColor: 'white'
            }}
            placeholder="Seu primeiro nome"
            value={formData.first_name}
            onChangeText={(text) => updateField('first_name', text)}
          />
          
          {/* Sobrenome */}
          <Text style={{ marginBottom: 5, fontWeight: '600' }}>Sobrenome *</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              marginBottom: 15,
              fontSize: 16,
              backgroundColor: 'white'
            }}
            placeholder="Seu sobrenome"
            value={formData.last_name}
            onChangeText={(text) => updateField('last_name', text)}
          />
          
          {/* Email */}
          <Text style={{ marginBottom: 5, fontWeight: '600' }}>Email *</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              marginBottom: 15,
              fontSize: 16,
              backgroundColor: 'white'
            }}
            placeholder="seu@email.com"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          {/* CPF */}
          <Text style={{ marginBottom: 5, fontWeight: '600' }}>CPF *</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              marginBottom: 15,
              fontSize: 16,
              backgroundColor: 'white'
            }}
            placeholder="12345678901"
            value={formData.cpf}
            onChangeText={(text) => updateField('cpf', text.replace(/\D/g, ''))}
            keyboardType="numeric"
            maxLength={11}
          />
          
          {/* Telefone */}
          <Text style={{ marginBottom: 5, fontWeight: '600' }}>Telefone</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              marginBottom: 15,
              fontSize: 16,
              backgroundColor: 'white'
            }}
            placeholder="11999999999"
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text.replace(/\D/g, ''))}
            keyboardType="phone-pad"
          />
          
          {/* CNH */}
          <Text style={{ marginBottom: 5, fontWeight: '600' }}>Número da CNH</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              marginBottom: 15,
              fontSize: 16,
              backgroundColor: 'white'
            }}
            placeholder="12345678901"
            value={formData.cnh_numero}
            onChangeText={(text) => updateField('cnh_numero', text)}
            keyboardType="numeric"
          />
          
          {/* Validade CNH */}
          <Text style={{ marginBottom: 5, fontWeight: '600' }}>Validade CNH</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              marginBottom: 15,
              fontSize: 16,
              backgroundColor: 'white'
            }}
            placeholder="2025-12-31"
            value={formData.cnh_validade}
            onChangeText={(text) => updateField('cnh_validade', text)}
          />
          
          {/* Senha */}
          <Text style={{ marginBottom: 5, fontWeight: '600' }}>Senha *</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              marginBottom: 15,
              fontSize: 16,
              backgroundColor: 'white'
            }}
            placeholder="Mínimo 8 caracteres"
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            secureTextEntry
          />
          
          {/* Confirmar Senha */}
          <Text style={{ marginBottom: 5, fontWeight: '600' }}>Confirmar Senha *</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              marginBottom: 25,
              fontSize: 16,
              backgroundColor: 'white'
            }}
            placeholder="Digite a senha novamente"
            value={formData.password_confirm}
            onChangeText={(text) => updateField('password_confirm', text)}
            secureTextEntry
          />
          
          {/* Botão Registrar */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '#3b82f6',
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 15
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                Criar Conta
              </Text>
            )}
          </TouchableOpacity>
          
          {/* Link Login */}
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ color: '#666' }}>Já tem conta? </Text>
            <TouchableOpacity onPress={goToLogin}>
              <Text style={{ color: '#3b82f6', fontWeight: '600' }}>
                Fazer login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}