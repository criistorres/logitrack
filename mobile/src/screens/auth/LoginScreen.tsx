// mobile/src/screens/auth/LoginScreen.tsx - ULTRA SIMPLIFICADO

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
// 🔐 LOGIN SCREEN ULTRA SIMPLIFICADO
// ==============================================================================

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  console.log('🔐 LoginScreen: Renderizando versão ultra simplificada');
  
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha email e senha');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login({ email: email.trim(), password });
      
      if (!result.success) {
        Alert.alert('Erro', result.message || 'Email ou senha incorretos');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  };
  
  const goToRegister = () => {
    navigation.navigate('Register' as never);
  };
  
  const goToForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Status bar space */}
      <View style={{ height: 50 }} />
      
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          justifyContent: 'center', 
          padding: 20 
        }}
      >
        
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ 
            width: 80, 
            height: 80, 
            backgroundColor: '#3b82f6', 
            borderRadius: 40, 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: 20
          }}>
            <Text style={{ color: 'white', fontSize: 30 }}>🚛</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#333' }}>
            LogiTrack
          </Text>
          <Text style={{ color: '#666', textAlign: 'center' }}>
            Sistema de Gerenciamento de Transporte
          </Text>
        </View>
        
        {/* Form */}
        <View style={{ 
          backgroundColor: 'white', 
          padding: 20, 
          borderRadius: 10, 
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            marginBottom: 20, 
            textAlign: 'center' 
          }}>
            Bem-vindo!
          </Text>
          
          {/* Email */}
          <Text style={{ marginBottom: 5, fontWeight: '600' }}>Email</Text>
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
            placeholder="Digite seu email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {/* Password */}
          <Text style={{ marginBottom: 5, fontWeight: '600' }}>Senha</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 16,
              backgroundColor: 'white'
            }}
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          {/* Forgot Password */}
          <TouchableOpacity 
            onPress={goToForgotPassword} 
            style={{ marginBottom: 20 }}
          >
            <Text style={{ 
              color: '#3b82f6', 
              textAlign: 'right', 
              fontSize: 14 
            }}>
              Esqueci minha senha
            </Text>
          </TouchableOpacity>
          
          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
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
                Entrar
              </Text>
            )}
          </TouchableOpacity>
          
          {/* Register Link */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'center' 
          }}>
            <Text style={{ color: '#666' }}>Não tem conta? </Text>
            <TouchableOpacity onPress={goToRegister}>
              <Text style={{ color: '#3b82f6', fontWeight: '600' }}>
                Criar conta
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Debug Info */}
        {__DEV__ && (
          <View style={{ 
            backgroundColor: '#fff3cd', 
            padding: 15, 
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#ffc107'
          }}>
            <Text style={{ color: '#856404', fontSize: 12, fontWeight: 'bold' }}>
              🔧 VERSÃO ULTRA SIMPLIFICADA
            </Text>
            <Text style={{ color: '#856404', fontSize: 10, marginTop: 5 }}>
              ✅ Sem componentes customizados{'\n'}
              ✅ Sem SafeAreaView{'\n'}
              ✅ Navegação direta{'\n'}
              ✅ Estrutura mínima{'\n'}
              ✅ Deve funcionar sem erros
            </Text>
          </View>
        )}
        
      </ScrollView>
    </View>
  );
}