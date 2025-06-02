// src/screens/HomeScreen.tsx

import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { MainStackParamList } from '../navigation/MainNavigator';

// ==============================================================================
// 📋 TIPOS DE NAVEGAÇÃO
// ==============================================================================

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

// ==============================================================================
// 🏠 TELA HOME - VERSÃO COMPATÍVEL COM NAVEGAÇÃO
// ==============================================================================

/**
 * Tela Home - Dashboard principal para usuários autenticados
 * 
 * 🔧 MUDANÇAS NESTA VERSÃO:
 * - Agora recebe props de navegação adequadamente
 * - Compatível com MainNavigator
 * - Preparada para futuras funcionalidades de navegação
 */
export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, logout } = useAuth();
  
  console.log('🏠 HomeScreen: Renderizando para usuário:', user?.email);
  
  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair do aplicativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            console.log('🚪 HomeScreen: Fazendo logout...');
            await logout();
          }
        }
      ]
    );
  };
  
  // Handlers para futuras navegações
  const handleCreateOT = () => {
    console.log('📦 HomeScreen: Criar nova OT (futuro)');
    // navigation.navigate('CreateOT');
    Alert.alert('Em breve', 'Funcionalidade será implementada em breve!');
  };
  
  const handleMyOTs = () => {
    console.log('📋 HomeScreen: Minhas OTs (futuro)');
    // navigation.navigate('MyOTs');
    Alert.alert('Em breve', 'Funcionalidade será implementada em breve!');
  };
  
  const handleProfile = () => {
    console.log('👤 HomeScreen: Meu perfil (futuro)');
    // navigation.navigate('Profile');
    Alert.alert('Em breve', 'Funcionalidade será implementada em breve!');
  };
  
  const handleSearchByNF = () => {
    console.log('🔍 HomeScreen: Buscar por NF (futuro)');
    Alert.alert('Em breve', 'Funcionalidade será implementada em breve!');
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Header de Boas-vindas */}
        <View style={{ 
          backgroundColor: 'white', 
          borderRadius: 10, 
          padding: 20, 
          marginBottom: 30,
          width: '100%',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
            🎉 Login realizado com sucesso!
          </Text>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            Olá, {user?.first_name || 'Usuário'}! 👋
          </Text>
          <Text style={{ fontSize: 16, color: '#666' }}>
            Bem-vindo ao LogiTrack
          </Text>
          
          {/* Informações do usuário */}
          <View style={{ 
            backgroundColor: '#f0f0f0', 
            borderRadius: 5, 
            padding: 15, 
            marginTop: 15,
            width: '100%'
          }}>
            <Text style={{ fontSize: 14, marginBottom: 5 }}>
              <Text style={{ fontWeight: 'bold' }}>Email:</Text> {user?.email}
            </Text>
            <Text style={{ fontSize: 14, marginBottom: 5 }}>
              <Text style={{ fontWeight: 'bold' }}>Função:</Text> {user?.role}
            </Text>
            <Text style={{ fontSize: 14 }}>
              <Text style={{ fontWeight: 'bold' }}>Status:</Text> {user?.is_active ? 'Ativo ✅' : 'Inativo ❌'}
            </Text>
          </View>
        </View>
        
        {/* Cards de Status */}
        <View style={{ flexDirection: 'row', marginBottom: 30, width: '100%' }}>
          <View style={{ 
            backgroundColor: '#3b82f6', 
            borderRadius: 10, 
            padding: 20, 
            flex: 1, 
            marginRight: 10,
            alignItems: 'center',
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 5,
          }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>0</Text>
            <Text style={{ color: '#bfdbfe', fontSize: 12 }}>OTs Ativas</Text>
          </View>
          
          <View style={{ 
            backgroundColor: '#10b981', 
            borderRadius: 10, 
            padding: 20, 
            flex: 1, 
            marginLeft: 10,
            alignItems: 'center',
            shadowColor: '#10b981',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 5,
          }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>0</Text>
            <Text style={{ color: '#a7f3d0', fontSize: 12 }}>Entregas Hoje</Text>
          </View>
        </View>
        
        {/* Menu de Opções */}
        <View style={{ 
          backgroundColor: 'white', 
          borderRadius: 10, 
          width: '100%',
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          
          <TouchableOpacity 
            onPress={handleCreateOT}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#f0f0f0'
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 12 }}>📦</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
              Nova OT
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleMyOTs}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#f0f0f0'
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 12 }}>📋</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
              Minhas OTs
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleSearchByNF}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#f0f0f0'
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 12 }}>🔍</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
              Buscar por NF
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleProfile}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 12 }}>👤</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
              Meu Perfil
            </Text>
          </TouchableOpacity>
          
        </View>
        
        {/* Botão de Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: '#ef4444',
            paddingVertical: 15,
            paddingHorizontal: 30,
            borderRadius: 8,
            width: '100%',
            alignItems: 'center',
            shadowColor: '#ef4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 5,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            🚪 Sair do App
          </Text>
        </TouchableOpacity>
        
        {/* Informações de Debug (apenas em desenvolvimento) */}
        {__DEV__ && (
          <View style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: '#f8f9fa',
            borderRadius: 5,
            width: '100%'
          }}>
            <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
              🛠️ Debug: Navigation props disponíveis
            </Text>
            <Text style={{ fontSize: 10, color: '#999', textAlign: 'center' }}>
              Estrutura de navegação funcionando corretamente
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}