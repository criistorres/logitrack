// src/navigation/RootNavigator.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importar telas (vamos criar depois)
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen'

// Definir tipos para as rotas
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

// Criar o Stack Navigator
const Stack = createStackNavigator<RootStackParamList>();

/**
 * Navegador principal da aplicação
 * Gerencia a navegação entre telas
 */
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3b82f6', // bg-blue-500
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Tela de Login */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            headerShown: false, // Esconder header na tela de login
          }}
        />
        
        {/* Tela Home */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'LogiTrack',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}