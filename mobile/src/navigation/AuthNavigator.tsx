// src/navigation/AuthNavigator.tsx

import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import {
    AuthStackParamList,
    ForgotPasswordScreen,
    LoginScreen,
    RegisterScreen
} from '../screens/auth';

const Stack = createStackNavigator<AuthStackParamList>();

/**
 * Navegador para as telas de autenticação
 * Gerencia o fluxo de login, registro e reset de senha
 */
export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
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
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
      
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
      />
      
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
      />
    </Stack.Navigator>
  );
}