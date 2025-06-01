// src/screens/auth/ForgotPasswordScreen.tsx

import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ForgotPasswordForm } from '../../components/forms/ForgotPasswordForm';
import { FormContainer, ScreenContainer } from '../../components/ui';
import { AuthStackParamList } from './LoginScreen';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

export function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  // Handlers de navegação
  const handleResetSuccess = () => {
    console.log('✅ ForgotPasswordScreen: Reset bem-sucedido, voltando para login');
    navigation.navigate('Login');
  };
  
  const handleLogin = () => {
    console.log('🔐 ForgotPasswordScreen: Navegando para login');
    navigation.navigate('Login');
  };
  
  const handleBack = () => {
    console.log('← ForgotPasswordScreen: Voltando');
    navigation.goBack();
  };
  
  return (
    <ScreenContainer
      title="Redefinir Senha"
      showBackButton
      onBackPress={handleBack}
    >
      <StatusBar style="dark" />
      
      <ScrollView 
        className="flex-1 p-6"
        showsVerticalScrollIndicator={false}
      >
        <FormContainer
          title="Esqueceu sua senha?"
          subtitle="Digite seu email para receber um código de redefinição"
        >
          <ForgotPasswordForm
            onSuccess={handleResetSuccess}
            onLogin={handleLogin}
          />
        </FormContainer>
        
        {/* Informações de Ajuda */}
        <View className="bg-blue-50 rounded-lg p-4 mt-6">
          <Text className="text-blue-800 font-semibold mb-2">
            ℹ️ Como funciona:
          </Text>
          <Text className="text-blue-700 text-sm mb-2">
            1. Digite seu email cadastrado
          </Text>
          <Text className="text-blue-700 text-sm mb-2">
            2. Receba um código de 6 dígitos por email
          </Text>
          <Text className="text-blue-700 text-sm mb-2">
            3. Digite o código e sua nova senha
          </Text>
          <Text className="text-blue-700 text-sm">
            4. Faça login com a nova senha
          </Text>
          
          <View className="border-t border-blue-200 mt-4 pt-4">
            <Text className="text-blue-600 text-xs">
              ⏰ O código expira em 30 minutos
            </Text>
            <Text className="text-blue-600 text-xs">
              🔒 Máximo 3 tentativas por código
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}