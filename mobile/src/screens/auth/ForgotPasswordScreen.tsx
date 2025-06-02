// mobile/src/screens/auth/ForgotPasswordScreen.tsx - VERSÃO SIMPLIFICADA

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
// 🔄 FORGOT PASSWORD SCREEN SIMPLIFICADO
// ==============================================================================

export function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { requestPasswordReset, confirmPasswordReset } = useAuth();
  
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  console.log('🔄 ForgotPasswordScreen: Renderizando versão simplificada');
  
  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Digite seu email');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await requestPasswordReset(email.trim());
      
      Alert.alert(
        'Código Enviado!',
        'Um código de 6 dígitos foi enviado para seu email.',
        [{ text: 'OK', onPress: () => setStep('code') }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Erro ao enviar código');
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmReset = async () => {
    if (!code.trim() || !newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'Senhas não coincidem');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await confirmPasswordReset({
        code: code.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      if (result.success) {
        Alert.alert(
          'Sucesso!',
          'Senha redefinida com sucesso!',
          [{ text: 'OK', onPress: () => navigation.navigate('Login' as never) }]
        );
      } else {
        Alert.alert('Erro', result.message || 'Código inválido');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
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
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 20 }}>Redefinir Senha</Text>
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
          
          {step === 'email' ? (
            <>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
                Esqueceu sua senha?
              </Text>
              <Text style={{ color: '#666', marginBottom: 25, textAlign: 'center' }}>
                Digite seu email para receber um código de redefinição
              </Text>
              
              <Text style={{ marginBottom: 5, fontWeight: '600' }}>Email</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 25,
                  fontSize: 16
                }}
                placeholder="Digite seu email cadastrado"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TouchableOpacity
                onPress={handleRequestReset}
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
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Enviar Código</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
                Digite o código
              </Text>
              
              <View style={{ 
                backgroundColor: '#e3f2fd', 
                padding: 15, 
                borderRadius: 8, 
                marginBottom: 20 
              }}>
                <Text style={{ color: '#1976d2', textAlign: 'center', fontSize: 14 }}>
                  📧 Código enviado para: {email}
                </Text>
              </View>
              
              <Text style={{ marginBottom: 5, fontWeight: '600' }}>Código de 6 dígitos</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 15,
                  fontSize: 16,
                  textAlign: 'center',
                  letterSpacing: 2
                }}
                placeholder="123456"
                value={code}
                onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))}
                keyboardType="numeric"
                maxLength={6}
              />
              
              <Text style={{ marginBottom: 5, fontWeight: '600' }}>Nova Senha</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 15,
                  fontSize: 16
                }}
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              
              <Text style={{ marginBottom: 5, fontWeight: '600' }}>Confirmar Nova Senha</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 25,
                  fontSize: 16
                }}
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              
              <TouchableOpacity
                onPress={handleConfirmReset}
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
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Redefinir Senha</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setStep('email')}>
                <Text style={{ color: '#3b82f6', textAlign: 'center' }}>← Voltar para email</Text>
              </TouchableOpacity>
            </>
          )}
          
          {/* Link Login */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 15 }}>
            <Text style={{ color: '#666' }}>Lembrou da senha? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text style={{ color: '#3b82f6', fontWeight: '600' }}>Fazer login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}