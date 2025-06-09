// mobile/App.tsx - VERSÃO COMPLETA E DEFINITIVA COM TAB NAVIGATION

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import './global.css';

// Contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Screens
import { ForgotPasswordScreen, LoginScreen, RegisterScreen } from './src/screens/auth';
import HomeScreen from './src/screens/HomeScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import CriarOTScreenFixed from './src/screens/ots/CriarOTScreenFixed';
import ListaOTScreenFixed from './src/screens/ots/ListaOTScreenFixed';

// ==============================================================================
// 📋 TIPOS DE NAVEGAÇÃO DEFINITIVOS
// ==============================================================================

// Stack para autenticação (sem tabs)
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Tab Navigation (aplicação principal)
type MainTabParamList = {
  HomeTab: undefined;
  OTsTab: undefined;
  CriarTab: undefined;
  PerfilTab: undefined;
};

// Stacks dentro de cada tab (futuro)
type HomeStackParamList = {
  Home: undefined;
};

type OTsStackParamList = {
  ListaOTs: undefined;
  DetalhesOT: { otId: number };
};

type CriarStackParamList = {
  CriarOT: undefined;
};

type PerfilStackParamList = {
  Perfil: undefined;
  Configuracoes: undefined;
};

// ==============================================================================
// 🏗️ NAVEGADORES
// ==============================================================================

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const HomeStack = createStackNavigator<HomeStackParamList>();
const OTsStack = createStackNavigator<OTsStackParamList>();
const CriarStack = createStackNavigator<CriarStackParamList>();
const PerfilStack = createStackNavigator<PerfilStackParamList>();

// ==============================================================================
// 🏠 HOME STACK NAVIGATOR
// ==============================================================================

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

// ==============================================================================
// 📦 OTs STACK NAVIGATOR
// ==============================================================================

function OTsStackNavigator() {
  return (
    <OTsStack.Navigator screenOptions={{ headerShown: false }}>
      <OTsStack.Screen name="ListaOTs" component={ListaOTScreenFixed} />
      {/* Futuro: DetalhesOT */}
    </OTsStack.Navigator>
  );
}

// ==============================================================================
// ➕ CRIAR STACK NAVIGATOR
// ==============================================================================

function CriarStackNavigator() {
  return (
    <CriarStack.Navigator screenOptions={{ headerShown: false }}>
      <CriarStack.Screen name="CriarOT" component={CriarOTScreenFixed} />
    </CriarStack.Navigator>
  );
}

// ==============================================================================
// 👤 PERFIL STACK NAVIGATOR
// ==============================================================================

function PerfilStackNavigator() {
  return (
    <PerfilStack.Navigator screenOptions={{ headerShown: false }}>
      <PerfilStack.Screen name="Perfil" component={PerfilScreen} />
      {/* Futuro: Configuracoes */}
    </PerfilStack.Navigator>
  );
}

// ==============================================================================
// 🗂️ MAIN TAB NAVIGATOR
// ==============================================================================

function MainTabNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
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
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <MainTab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator}
        options={{
          title: 'Home',
          tabBarLabel: 'Dashboard',
        }}
      />
      
      <MainTab.Screen 
        name="OTsTab" 
        component={OTsStackNavigator}
        options={{
          title: 'OTs',
          tabBarLabel: 'Minhas OTs',
        }}
      />
      
      <MainTab.Screen 
        name="CriarTab" 
        component={CriarStackNavigator}
        options={{
          title: 'Criar',
          tabBarLabel: 'Criar OT',
        }}
      />
      
      <MainTab.Screen 
        name="PerfilTab" 
        component={PerfilStackNavigator}
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
        }}
      />
    </MainTab.Navigator>
  );
}

// ==============================================================================
// 🚪 AUTH STACK NAVIGATOR
// ==============================================================================

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ presentation: 'modal' }}
      />
      <AuthStack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ presentation: 'modal' }}
      />
    </AuthStack.Navigator>
  );
}

// ==============================================================================
// 🎯 COMPONENTE PRINCIPAL DE CONTEÚDO
// ==============================================================================

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  console.log('🗺️ AppContent:', { isAuthenticated, isLoading, userEmail: user?.email });
  
  // Loading screen profissional
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <View className="w-24 h-24 bg-blue-500 rounded-full justify-center items-center mb-6">
          <Text className="text-white text-4xl">🚛</Text>
        </View>
        <Text className="text-3xl font-bold mb-3 text-gray-800">LogiTrack</Text>
        <Text className="text-gray-600 mb-6 text-center px-8">
          Carregando sua área de trabalho...
        </Text>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }
  
  // Renderizar navegação baseada no estado de autenticação
  return isAuthenticated ? <MainTabNavigator /> : <AuthStackNavigator />;
}

// ==============================================================================
// 🚀 APP PRINCIPAL - LOGITRAK
// ==============================================================================

export default function App() {
  console.log('🚀 App: Inicializando LogiTrack com Tab Navigation...');
  
  return (
    <GestureHandlerRootView className="flex-1">
      <NavigationContainer>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

// ==============================================================================
// 📝 ESTRUTURA FINAL DE NAVEGAÇÃO
// ==============================================================================

/**
 * 🎯 ARQUITETURA LIMPA E DEFINITIVA:
 * 
 * NavigationContainer
 * └── AuthProvider
 *     └── AppContent
 *         ├── 🚪 AuthStackNavigator (quando não logado)
 *         │   ├── Login
 *         │   ├── Register (modal)
 *         │   └── ForgotPassword (modal)
 *         │
 *         └── 🔐 MainTabNavigator (quando logado)
 *             ├── 🏠 HomeTab → HomeStackNavigator
 *             │   └── Home
 *             ├── 📦 OTsTab → OTsStackNavigator  
 *             │   ├── ListaOTs
 *             │   └── DetalhesOT (futuro)
 *             ├── ➕ CriarTab → CriarStackNavigator
 *             │   └── CriarOT
 *             └── 👤 PerfilTab → PerfilStackNavigator
 *                 ├── Perfil
 *                 └── Configuracoes (futuro)
 * 
 * ✅ BENEFÍCIOS:
 * - Estrutura limpa e escalável
 * - Contexto de navegação sempre disponível
 * - Tipos TypeScript corretos
 * - Performance otimizada
 * - UX profissional com tabs
 * - Nunca mais erros de contexto
 */