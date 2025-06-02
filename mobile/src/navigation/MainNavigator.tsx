// src/navigation/MainNavigator.tsx

import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';

// ==============================================================================
// 📋 TIPOS DE NAVEGAÇÃO PARA ÁREA AUTENTICADA
// ==============================================================================

export type MainStackParamList = {
  Home: undefined;
  // Futuras telas serão adicionadas aqui:
  // Profile: undefined;
  // CreateOT: undefined;
  // OTDetails: { otId: string };
  // etc...
};

const Stack = createStackNavigator<MainStackParamList>();

// ==============================================================================
// 📱 NAVIGATOR PRINCIPAL PARA USUÁRIOS AUTENTICADOS
// ==============================================================================

/**
 * Navigator para usuários autenticados
 * Gerencia as telas principais do app após login
 */
export default function MainNavigator() {
  console.log('📱 MainNavigator: Inicializando navegação autenticada');
  
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false, // Headers customizados nos componentes
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      {/* Tela Principal */}
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'LogiTrack'
        }}
      />
      
      {/* 
        🚀 FUTURAS TELAS SERÃO ADICIONADAS AQUI:
        
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Meu Perfil' }}
        />
        
        <Stack.Screen 
          name="CreateOT" 
          component={CreateOTScreen}
          options={{ title: 'Nova OT' }}
        />
        
        <Stack.Screen 
          name="OTDetails" 
          component={OTDetailsScreen}
          options={{ title: 'Detalhes da OT' }}
        />
      */}
    </Stack.Navigator>
  );
}