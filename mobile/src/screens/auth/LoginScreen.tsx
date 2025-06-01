// src/screens/auth/LoginScreen.tsx

import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginForm } from '../../components/forms/LoginForm';
import { FormContainer } from '../../components/ui';

// ==============================================================================
// 📋 TIPOS DE NAVEGAÇÃO
// ==============================================================================

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

// ==============================================================================
// 🔐 TELA DE LOGIN
// ==============================================================================

function LoginScreen({ navigation }: LoginScreenProps) {
  // Handlers de navegação
  const handleLoginSuccess = () => {
    console.log('✅ LoginScreen: Login bem-sucedido, usuário será redirecionado automaticamente');
    // A navegação será controlada pelo RootNavigator baseado no estado de auth
  };
  
  const handleForgotPassword = () => {
    console.log('🔄 LoginScreen: Navegando para reset de senha');
    navigation.navigate('ForgotPassword');
  };
  
  const handleRegister = () => {
    console.log('📝 LoginScreen: Navegando para registro');
    navigation.navigate('Register');
  };
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      <ScrollView 
        className="flex-1" 
        contentContainerClassName="min-h-full"
        showsVerticalScrollIndicator={false}
      >
        {/* Header com Logo */}
        <View className="items-center pt-12 pb-8">
          {/* Logo Placeholder - substituir por logo real */}
          <View className="w-24 h-24 bg-blue-500 rounded-full items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">🚛</Text>
          </View>
          
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            LogiTrack
          </Text>
          
          <Text className="text-gray-600 text-center px-8">
            Sistema de Gerenciamento de Transporte
          </Text>
        </View>
        
        {/* Formulário de Login */}
        <View className="flex-1 px-6">
          <FormContainer
            title="Bem-vindo!"
            subtitle="Entre com suas credenciais para acessar o sistema"
          >
            <LoginForm
              onSuccess={handleLoginSuccess}
              onForgotPassword={handleForgotPassword}
              onRegister={handleRegister}
            />
          </FormContainer>
        </View>
        
        {/* Footer */}
        <View className="items-center py-6">
          <Text className="text-gray-500 text-sm">
            Versão 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ⚠️ EXPORT DEFAULT - IMPORTANTE!
export default LoginScreen;