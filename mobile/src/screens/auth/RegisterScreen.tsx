// src/screens/auth/RegisterScreen.tsx

import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView } from 'react-native';
import { RegisterForm } from '../../components/forms/RegisterForm';
import { FormContainer, ScreenContainer } from '../../components/ui';
import { AuthStackParamList } from './LoginScreen';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  // Handlers de navegação
  const handleRegisterSuccess = () => {
    console.log('✅ RegisterScreen: Registro bem-sucedido, voltando para login');
    navigation.navigate('Login');
  };
  
  const handleLogin = () => {
    console.log('🔐 RegisterScreen: Navegando para login');
    navigation.navigate('Login');
  };
  
  const handleBack = () => {
    console.log('← RegisterScreen: Voltando');
    navigation.goBack();
  };
  
  return (
    <ScreenContainer
      title="Criar Conta"
      showBackButton
      onBackPress={handleBack}
    >
      <StatusBar style="dark" />
      
      <ScrollView 
        className="flex-1 p-6"
        showsVerticalScrollIndicator={false}
      >
        <FormContainer
          title="Criar Nova Conta"
          subtitle="Preencha os dados abaixo para criar sua conta no LogiTrack"
        >
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onLogin={handleLogin}
          />
        </FormContainer>
      </ScrollView>
    </ScreenContainer>
  );
}