// mobile/src/navigation/TabNavigator.tsx - BOTTOM TAB NAVIGATION

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

// Importar telas existentes
import HomeScreen from '../screens/HomeScreen';
import { CriarOTScreen, ListaOTScreen } from '../screens/ots';

// Importar telas novas (criaremos)
import PerfilScreen from '../screens/PerfilScreen';

// ==============================================================================
// 📋 TIPOS DE NAVEGAÇÃO
// ==============================================================================

export type TabParamList = {
  HomeTab: undefined;
  OTsTab: undefined;
  CriarTab: undefined;
  PerfilTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type OTsStackParamList = {
  ListaOTs: undefined;
  DetalhesOT: { otId: number };
};

export type CriarStackParamList = {
  CriarOT: undefined;
};

export type PerfilStackParamList = {
  Perfil: undefined;
  Configuracoes: undefined;
};

// ==============================================================================
// 🏠 HOME STACK - Dashboard e Estatísticas
// ==============================================================================

const HomeStack = createStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen 
        name="Home" 
        component={HomeScreen}
      />
    </HomeStack.Navigator>
  );
}

// ==============================================================================
// 📦 OTs STACK - Lista, Detalhes, Transferências
// ==============================================================================

const OTsStack = createStackNavigator<OTsStackParamList>();

function OTsStackNavigator() {
  return (
    <OTsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <OTsStack.Screen 
        name="ListaOTs" 
        component={ListaOTScreen}
      />
      {/* Tela futura - DetalhesOT */}
      {/* <OTsStack.Screen 
        name="DetalhesOT" 
        component={DetalhesOTScreen}
      /> */}
    </OTsStack.Navigator>
  );
}

// ==============================================================================
// ➕ CRIAR STACK - Fluxo de Criação de OT
// ==============================================================================

const CriarStack = createStackNavigator<CriarStackParamList>();

function CriarStackNavigator() {
  return (
    <CriarStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <CriarStack.Screen 
        name="CriarOT" 
        component={CriarOTScreen}
      />
    </CriarStack.Navigator>
  );
}

// ==============================================================================
// 👤 PERFIL STACK - Perfil, Configurações, Logout
// ==============================================================================

const PerfilStack = createStackNavigator<PerfilStackParamList>();

function PerfilStackNavigator() {
  return (
    <PerfilStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <PerfilStack.Screen 
        name="Perfil" 
        component={PerfilScreen}
      />
      {/* Tela futura - Configurações */}
      {/* <PerfilStack.Screen 
        name="Configuracoes" 
        component={ConfiguracoesScreen}
      /> */}
    </PerfilStack.Navigator>
  );
}

// ==============================================================================
// 🗂️ TAB NAVIGATOR PRINCIPAL
// ==============================================================================

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Header global desabilitado (cada stack controla seu header)
        headerShown: false,
        
        // Configuração de ícones
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'OTsTab':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'CriarTab':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'PerfilTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        
        // Cores e estilo LogiTrack
        tabBarActiveTintColor: '#3B82F6', // blue-500
        tabBarInactiveTintColor: '#9CA3AF', // gray-400
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB', // gray-200
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        
        // Badge para OTs (implementaremos depois)
        tabBarBadge: route.name === 'OTsTab' ? undefined : undefined, // TODO: contador de OTs
      })}
    >
      
      {/* ============================================================
           🏠 TAB HOME - Dashboard Principal
           ============================================================ */}
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator}
        options={{
          title: 'Home',
          tabBarLabel: 'Dashboard',
        }}
      />

      {/* ============================================================
           📦 TAB OTs - Lista e Gestão de OTs
           ============================================================ */}
      <Tab.Screen 
        name="OTsTab" 
        component={OTsStackNavigator}
        options={{
          title: 'Minhas OTs',
          tabBarLabel: 'OTs',
          // Badge dinâmico será implementado aqui
          tabBarBadge: undefined, // TODO: contador de OTs ativas
        }}
      />

      {/* ============================================================
           ➕ TAB CRIAR - Criação de Nova OT
           ============================================================ */}
      <Tab.Screen 
        name="CriarTab" 
        component={CriarStackNavigator}
        options={{
          title: 'Criar OT',
          tabBarLabel: 'Criar',
          // Estilo especial para botão de criar
          tabBarIconStyle: {
            marginTop: -2,
          },
        }}
      />

      {/* ============================================================
           👤 TAB PERFIL - Configurações e Logout
           ============================================================ */}
      <Tab.Screen 
        name="PerfilTab" 
        component={PerfilStackNavigator}
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
        }}
      />
      
    </Tab.Navigator>
  );
}

// ==============================================================================
// 📝 NOTAS DE IMPLEMENTAÇÃO
// ==============================================================================

/**
 * 🎯 ESTRUTURA DE NAVEGAÇÃO IMPLEMENTADA:
 * 
 * TAB NAVIGATOR (Principal)
 * ├── HomeTab (Stack)
 * │   └── Home
 * ├── OTsTab (Stack)  
 * │   ├── ListaOTs
 * │   └── DetalhesOT (futuro)
 * ├── CriarTab (Stack)
 * │   └── CriarOT
 * └── PerfilTab (Stack)
 *     ├── Perfil
 *     └── Configuracoes (futuro)
 * 
 * 🔄 PRÓXIMAS IMPLEMENTAÇÕES:
 * - Badge contador de OTs ativas
 * - DetalhesOTScreen
 * - ConfiguracoesScreen  
 * - Animações de transição
 * - Deep linking entre tabs
 * 
 * 🎨 DESIGN SYSTEM:
 * - Cores LogiTrack (blue-500, gray-400)
 * - Ícones Ionicons consistentes
 * - Typography e spacing padronizados
 * - Estados focused/unfocused bem definidos
 */