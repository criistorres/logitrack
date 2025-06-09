// mobile/src/screens/HomeScreen.tsx - VERSÃO CORRIGIDA COM ÍCONES VÁLIDOS

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// ===== IMPORT DO COMPONENTE SAFE AREA =====
import { TabScreenWrapper } from '../components/common/SafeScreenWrapper';

/**
 * 🏠 Tela Home - Versão com Ícones Corretos
 * 
 * ✅ Mudanças aplicadas:
 * - Ícones Ionicons válidos
 * - SafeScreenWrapper para tabs
 * - Cores e estilos otimizados
 * - Sem erros de renderização
 */
export default function HomeScreen() {
  const { user } = useAuth();
  
  // ==============================================================================
  // 🔧 HANDLERS DE AÇÕES RÁPIDAS
  // ==============================================================================
  
  const handleAcaoRapida = useCallback((acao: string) => {
    Alert.alert('Ação Rápida', `Funcionalidade "${acao}" será implementada em breve.`);
  }, []);

  const handleVerDetalhes = useCallback((tipo: string) => {
    Alert.alert('Ver Detalhes', `Detalhes de "${tipo}" serão implementados em breve.`);
  }, []);

  // ==============================================================================
  // 🎯 RENDERIZAÇÃO PRINCIPAL - SEM ERROS
  // ==============================================================================

  return (
    <TabScreenWrapper withPadding>
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* =====================================================================
             HEADER DE BOAS-VINDAS
             ===================================================================== */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 32, marginRight: 12 }}>👋</Text>
                <View>
                  <Text style={{ 
                    color: '#1F2937', 
                    fontSize: 24, 
                    fontWeight: 'bold',
                    letterSpacing: 0.5,
                  }}>
                    Olá, {user?.nome?.split(' ')[0] || 'Motorista'}!
                  </Text>
                  <Text style={{ 
                    color: '#6B7280', 
                    fontSize: 16,
                    marginTop: 2,
                  }}>
                    Bem-vindo ao LogiTrack
                  </Text>
                </View>
              </View>
              
              <View style={{ 
                backgroundColor: '#EFF6FF', 
                padding: 12, 
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: '#2563EB',
              }}>
                <Text style={{ 
                  color: '#1E40AF', 
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  🚛 Status: Ativo e Pronto para Entregas
                </Text>
              </View>
            </View>
            
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#F3F4F6',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="person" size={28} color="#6B7280" />
            </View>
          </View>
        </View>

        {/* =====================================================================
             ESTATÍSTICAS RÁPIDAS - ÍCONES CORRETOS
             ===================================================================== */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            color: '#1F2937',
            marginBottom: 16,
          }}>
            📊 Resumo de Hoje
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Card OTs Ativas */}
            <TouchableOpacity 
              style={{
                flex: 1,
                backgroundColor: '#DBEAFE',
                padding: 16,
                borderRadius: 12,
                marginRight: 8,
                alignItems: 'center',
              }}
              onPress={() => handleVerDetalhes('OTs Ativas')}
            >
              <Ionicons name="car-outline" size={24} color="#2563EB" />
              <Text style={{ 
                fontSize: 24, 
                fontWeight: 'bold', 
                color: '#1E40AF',
                marginTop: 8,
              }}>
                3
              </Text>
              <Text style={{ 
                fontSize: 12, 
                color: '#1E40AF',
                textAlign: 'center',
              }}>
                OTs Ativas
              </Text>
            </TouchableOpacity>
            
            {/* Card Entregas Hoje */}
            <TouchableOpacity 
              style={{
                flex: 1,
                backgroundColor: '#DCFCE7',
                padding: 16,
                borderRadius: 12,
                marginHorizontal: 4,
                alignItems: 'center',
              }}
              onPress={() => handleVerDetalhes('Entregas')}
            >
              <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
              <Text style={{ 
                fontSize: 24, 
                fontWeight: 'bold', 
                color: '#15803D',
                marginTop: 8,
              }}>
                7
              </Text>
              <Text style={{ 
                fontSize: 12, 
                color: '#15803D',
                textAlign: 'center',
              }}>
                Entregas
              </Text>
            </TouchableOpacity>
            
            {/* Card KM Rodados */}
            <TouchableOpacity 
              style={{
                flex: 1,
                backgroundColor: '#FEF3C7',
                padding: 16,
                borderRadius: 12,
                marginLeft: 8,
                alignItems: 'center',
              }}
              onPress={() => handleVerDetalhes('Quilometragem')}
            >
              <Ionicons name="speedometer-outline" size={24} color="#D97706" />
              <Text style={{ 
                fontSize: 24, 
                fontWeight: 'bold', 
                color: '#B45309',
                marginTop: 8,
              }}>
                245
              </Text>
              <Text style={{ 
                fontSize: 12, 
                color: '#B45309',
                textAlign: 'center',
              }}>
                KM Hoje
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =====================================================================
             AÇÕES RÁPIDAS - ÍCONES VÁLIDOS
             ===================================================================== */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            color: '#1F2937',
            marginBottom: 16,
          }}>
            ⚡ Ações Rápidas
          </Text>
          
          {/* Botão Emergência */}
          <TouchableOpacity 
            style={{
              backgroundColor: '#FEE2E2',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#FECACA',
            }}
            onPress={() => handleAcaoRapida('Emergência')}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#DC2626',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="warning" size={20} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: 'bold', 
                color: '#991B1B',
              }}>
                🚨 Reportar Emergência
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: '#7F1D1D',
                marginTop: 2,
              }}>
                Acidente, pane ou problema urgente
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#991B1B" />
          </TouchableOpacity>
          
          {/* Botão Atualizar Localização */}
          <TouchableOpacity 
            style={{
              backgroundColor: '#EFF6FF',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#DBEAFE',
            }}
            onPress={() => handleAcaoRapida('Localização')}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#2563EB',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="location" size={20} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: 'bold', 
                color: '#1E40AF',
              }}>
                📍 Atualizar Localização
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: '#1E40AF',
                marginTop: 2,
              }}>
                Sincronizar GPS atual
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#1E40AF" />
          </TouchableOpacity>
          
          {/* Botão Suporte */}
          <TouchableOpacity 
            style={{
              backgroundColor: '#F3F4F6',
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
            onPress={() => handleAcaoRapida('Suporte')}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#6B7280',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="help-circle" size={20} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: 'bold', 
                color: '#374151',
              }}>
                💬 Falar com Suporte
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: '#6B7280',
                marginTop: 2,
              }}>
                Dúvidas ou ajuda técnica
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* =====================================================================
             INFORMAÇÕES DO MOTORISTA
             ===================================================================== */}
        <View style={{
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: '#1F2937',
            marginBottom: 16,
          }}>
            👤 Informações do Motorista
          </Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
              Nome Completo
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
              {user?.nome || 'Nome não disponível'}
            </Text>
          </View>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
              Role
            </Text>
            <View style={{
              backgroundColor: user?.role === 'MOTORISTA' ? '#DCFCE7' : '#FEF3C7',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              alignSelf: 'flex-start',
            }}>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600',
                color: user?.role === 'MOTORISTA' ? '#15803D' : '#B45309',
              }}>
                {user?.role || 'Não definido'}
              </Text>
            </View>
          </View>
          
          <View>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
              Status de Conectividade
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#16A34A',
                marginRight: 8,
              }} />
              <Text style={{ fontSize: 14, color: '#1F2937' }}>
                Online - Conectado
              </Text>
            </View>
          </View>
        </View>

        {/* Espaçamento final para tab bar */}
        <View style={{ height: 20 }} />
        
      </ScrollView>
    </TabScreenWrapper>
  );
}

// ==============================================================================
// ✅ ÍCONES CORRETOS UTILIZADOS
// ==============================================================================

/**
 * 🎯 ÍCONES IONICONS VÁLIDOS NESTA TELA:
 * 
 * ✅ INTERFACE:
 * - person                 → Avatar do usuário
 * - chevron-forward        → Setas dos botões
 * 
 * ✅ ESTATÍSTICAS:
 * - car-outline           → OTs ativas (substituiu "truck")
 * - checkmark-circle      → Entregas concluídas
 * - speedometer-outline   → Quilometragem
 * 
 * ✅ AÇÕES RÁPIDAS:
 * - warning               → Emergência
 * - location              → GPS/localização
 * - help-circle           → Suporte
 * 
 * 🚀 RESULTADO:
 * - Zero erros de ícones inválidos
 * - Visual profissional mantido
 * - Todos os ícones são oficiais do Ionicons
 * - Compatível iOS e Android
 */