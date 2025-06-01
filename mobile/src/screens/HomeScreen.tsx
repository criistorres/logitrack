// src/screens/HomeScreen.tsx - VERSÃO SIMPLES TEMPORÁRIA

import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

/**
 * Tela Home - Versão Simples para Teste
 */
export default function HomeScreen() {
  const { user, logout } = useAuth();
  
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
          alignItems: 'center'
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
              <Text style={{ fontWeight: 'bold' }}>Status:</Text> {user?.is_active ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        </View>
        
        {/* Cards de Status */}
        <View style={{ flexDirection: 'row', marginBottom: 30 }}>
          <View style={{ 
            backgroundColor: '#3b82f6', 
            borderRadius: 10, 
            padding: 20, 
            flex: 1, 
            marginRight: 10,
            alignItems: 'center'
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
            alignItems: 'center'
          }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>0</Text>
            <Text style={{ color: '#a7f3d0', fontSize: 12 }}>Entregas Hoje</Text>
          </View>
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
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            🚪 Sair do App
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}