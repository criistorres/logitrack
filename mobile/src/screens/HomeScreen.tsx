// mobile/src/screens/HomeScreen.tsx - VERSÃO SIMPLIFICADA

import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// ==============================================================================
// 🏠 HOME SCREEN SIMPLIFICADO
// ==============================================================================

export default function HomeScreen() {
  const { user, logout } = useAuth();
  
  console.log('🏠 HomeScreen: Renderizando versão simplificada para:', user?.email);
  
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
  
  const showComingSoon = (feature: string) => {
    Alert.alert('Em breve', `${feature} será implementado em breve!`);
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Status Bar Space */}
      <View style={{ height: 50, backgroundColor: '#f5f5f5' }} />
      
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          
          {/* Header de Boas-vindas */}
          <View style={{ 
            backgroundColor: 'white', 
            borderRadius: 12, 
            padding: 20, 
            marginBottom: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
              🎉 Bem-vindo!
            </Text>
            <Text style={{ fontSize: 18, marginBottom: 5 }}>
              {user?.first_name || 'Usuário'} 👋
            </Text>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 15 }}>
              LogiTrack - Sistema de Transporte
            </Text>
            
            {/* Info do usuário */}
            <View style={{ 
              backgroundColor: '#f0f8ff', 
              borderRadius: 8, 
              padding: 15, 
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
          <View style={{ flexDirection: 'row', marginBottom: 20 }}>
            <View style={{ 
              backgroundColor: '#3b82f6', 
              borderRadius: 12, 
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
              <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>0</Text>
              <Text style={{ color: '#bfdbfe', fontSize: 12, textAlign: 'center' }}>OTs Ativas</Text>
            </View>
            
            <View style={{ 
              backgroundColor: '#10b981', 
              borderRadius: 12, 
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
              <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>0</Text>
              <Text style={{ color: '#a7f3d0', fontSize: 12, textAlign: 'center' }}>Entregas Hoje</Text>
            </View>
          </View>
          
          {/* Menu de Opções */}
          <View style={{ 
            backgroundColor: 'white', 
            borderRadius: 12, 
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            
            <TouchableOpacity 
              onPress={() => showComingSoon('Nova OT')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 18,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0'
              }}
            >
              <Text style={{ fontSize: 22, marginRight: 15 }}>📦</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                Nova OT
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => showComingSoon('Minhas OTs')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 18,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0'
              }}
            >
              <Text style={{ fontSize: 22, marginRight: 15 }}>📋</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                Minhas OTs
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => showComingSoon('Buscar por NF')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 18,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0'
              }}
            >
              <Text style={{ fontSize: 22, marginRight: 15 }}>🔍</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                Buscar por NF
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => showComingSoon('Meu Perfil')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 18,
              }}
            >
              <Text style={{ fontSize: 22, marginRight: 15 }}>👤</Text>
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
              borderRadius: 12,
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
          
          {/* Debug Info */}
          {__DEV__ && (
            <View style={{
              marginTop: 20,
              padding: 15,
              backgroundColor: '#fff3cd',
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: '#ffc107'
            }}>
              <Text style={{ fontSize: 12, color: '#856404', fontWeight: 'bold' }}>
                🛠️ DEBUG - App Simplificado
              </Text>
              <Text style={{ fontSize: 10, color: '#856404', marginTop: 5 }}>
                • Navegação funcional{'\n'}
                • Contexto corrigido{'\n'}
                • Estrutura simplificada
              </Text>
            </View>
          )}
          
        </View>
      </ScrollView>
    </View>
  );
}