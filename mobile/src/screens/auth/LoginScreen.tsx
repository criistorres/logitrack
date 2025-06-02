import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Button, Card, Input, ScreenContainer } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  console.log('🔐 LoginScreen: Renderizando versão profissional');
  
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Dados Incompletos', 'Por favor, preencha email e senha para continuar.');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login({ email: email.trim(), password });
      
      if (!result.success) {
        Alert.alert('Erro no Login', result.message || 'Credenciais inválidas. Verifique seu email e senha.');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
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
    <ScreenContainer className="bg-gradient-to-br from-neutral-50 to-primary-50" safeArea={false}>
      <View className="flex-1 pt-16">
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Header com Logo */}
          <View className="items-center mb-12">
            {/* Logo Container */}
            <View className="relative mb-6">
              <View className="w-28 h-28 bg-primary-500 rounded-3xl items-center justify-center shadow-xl shadow-primary-500/30">
                <Text className="text-white text-5xl">🚛</Text>
              </View>
              {/* Accent Badge */}
              <View className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent-500 rounded-full items-center justify-center border-4 border-white shadow-lg">
                <Text className="text-white text-sm">✓</Text>
              </View>
            </View>
            
            {/* Brand */}
            <Text className="text-4xl font-bold text-neutral-900 mb-2">
              LogiTrack
            </Text>
            <Text className="text-neutral-600 text-center text-base leading-6 max-w-xs">
              Sistema Profissional de{'\n'}Gerenciamento de Transporte
            </Text>
          </View>
          
          {/* Form Card */}
          <Card variant="elevated" padding="lg" className="mb-6">
            <View className="mb-6">
              <Text className="text-2xl font-bold text-neutral-900 mb-2">
                Bem-vindo de volta! 👋
              </Text>
              <Text className="text-neutral-600">
                Faça login para acessar sua conta
              </Text>
            </View>
            
            {/* Email Input */}
            <Input
              label="Email"
              placeholder="Digite seu email profissional"
              value={email}
              onChangeText={setEmail}
              leftIcon="📧"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              variant="outlined"
              size="lg"
              required
            />
            
            {/* Password Input */}
            <Input
              label="Senha"
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              leftIcon="🔒"
              secureTextEntry
              variant="outlined"
              size="lg"
              required
            />
            
            {/* Forgot Password Link */}
            <View className="mb-6">
              <Text
                onPress={goToForgotPassword}
                className="text-primary-500 text-right font-semibold text-base active:text-primary-600"
              >
                Esqueci minha senha
              </Text>
            </View>
            
            {/* Login Button */}
            <Button
              title="Entrar na Plataforma"
              onPress={handleLogin}
              loading={loading}
              variant="primary"
              size="lg"
              leftIcon="🚀"
              fullWidth
              className="mb-4"
            />
            
            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-neutral-200" />
              <Text className="mx-4 text-neutral-500 text-sm">ou</Text>
              <View className="flex-1 h-px bg-neutral-200" />
            </View>
            
            {/* Register Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-neutral-600 text-base">Ainda não tem conta? </Text>
              <Text
                onPress={goToRegister}
                className="text-primary-500 font-semibold text-base active:text-primary-600"
              >
                Criar conta gratuita
              </Text>
            </View>
          </Card>
          
          {/* Footer Info */}
          <View className="items-center mt-6">
            <Text className="text-neutral-400 text-sm text-center leading-5">
              Ao fazer login, você concorda com nossos{'\n'}
              <Text className="text-primary-500 font-medium">Termos de Uso</Text> e {' '}
              <Text className="text-primary-500 font-medium">Política de Privacidade</Text>
            </Text>
          </View>
          
          {/* Debug Badge */}
          {__DEV__ && (
            <Card variant="outlined" padding="sm" className="mt-6 border-warning-200 bg-warning-50">
              <View className="flex-row items-center">
                <Text className="text-warning-600 mr-2">🔧</Text>
                <View className="flex-1">
                  <Text className="text-warning-700 font-semibold text-sm">Versão de Desenvolvimento</Text>
                  <Text className="text-warning-600 text-xs">Design Profissional • Paleta LogiTrack • Tailwind CSS</Text>
                </View>
              </View>
            </Card>
          )}
          
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}