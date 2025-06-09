// mobile/src/navigation/OTsStackNavigator.tsx - STACK NAVIGATION PARA OTs

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Importar telas de OTs
import ListaOTScreenFixed from '../screens/ots/ListaOTScreenFixed';
import DetalhesOTScreen from '../screens/ots/DetalhesOTScreen';
import AtualizarStatusScreen from '../screens/ots/AtualizarStatusScreen';
import FinalizarOTScreen from '../screens/ots/FinalizarOTScreen';

// Importar tipos necessários
import { OT } from '../services';

// ==============================================================================
// 📋 TIPOS DE NAVEGAÇÃO PARA OTs
// ==============================================================================

export type OTsStackParamList = {
  ListaOTs: undefined;
  DetalhesOT: { otId: number };
  AtualizarStatus: { ot: OT };
  FinalizarOT: { ot: OT };
};

// ==============================================================================
// 🗂️ STACK NAVIGATOR PARA OTs
// ==============================================================================

const OTsStack = createStackNavigator<OTsStackParamList>();

/**
 * 📦 Stack Navigator para Ordens de Transporte
 * 
 * Rotas:
 * - ListaOTs: Lista principal de OTs
 * - DetalhesOT: Detalhes de uma OT específica
 */
export default function OTsStackNavigator() {
  return (
    <OTsStack.Navigator
      screenOptions={{
        headerShown: false, // Cada tela controla seu próprio header
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
      <OTsStack.Screen 
        name="ListaOTs" 
        component={ListaOTScreenFixed}
        options={{
          title: 'Minhas OTs',
        }}
      />
      
      <OTsStack.Screen 
        name="DetalhesOT" 
        component={DetalhesOTScreen}
        options={{
          title: 'Detalhes da OT',
          gestureDirection: 'horizontal',
        }}
      />
      
      <OTsStack.Screen 
        name="AtualizarStatus" 
        component={AtualizarStatusScreen}
        options={{
          title: 'Atualizar Status',
          gestureDirection: 'horizontal',
        }}
      />
      <OTsStack.Screen 
        name="FinalizarOT" 
        component={FinalizarOTScreen}
        options={{
          title: 'Finalizar OT',
          gestureDirection: 'horizontal',
        }}
      />
    </OTsStack.Navigator>
  );
}

// ==============================================================================
// ✅ CARACTERÍSTICAS DESTA NAVEGAÇÃO
// ==============================================================================

/**
 * 🎯 FUNCIONALIDADES:
 * 
 * ✅ STACK NAVIGATION:
 * - Lista OTs → Detalhes OT
 * - Animação slide horizontal
 * - Gesture de voltar habilitado
 * 
 * ✅ TIPOS TYPESCRIPT:
 * - Parâmetros tipados
 * - Navegação type-safe
 * 
 * ✅ HEADERS CUSTOMIZADOS:
 * - Cada tela controla seu header
 * - Integração com SafeScreenWrapper
 * 
 * 🚀 RESULTADO: Navegação profissional entre telas de OT!
 */