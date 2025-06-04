// src/app/dashboard/page.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, User, Settings, BarChart3, Truck, Package, Route } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, LoadingSpinner } from '../../components/ui';

/**
 * Dashboard Principal - LogiTrack Web
 * Painel de controle para logística e administração
 */

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  
  console.log('📊 DashboardPage: Renderizando dashboard web para:', user?.email);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando dashboard..." />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card padding="lg" className="max-w-md text-center">
          <p className="text-gray-600 mb-4">Sessão expirada</p>
          <Link href="/login">
            <Button variant="primary">Fazer Login</Button>
          </Link>
        </Card>
      </div>
    );
  }
  
  const handleLogout = async () => {
    if (confirm('Tem certeza que deseja sair?')) {
      await logout();
    }
  };
  
  // Determinar saudação baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };
  
  // Role labels
  const roleLabels = {
    motorista: 'Motorista',
    logistica: 'Equipe de Logística',
    admin: 'Administrador'
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo e Título */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LogiTrack</h1>
                <p className="text-xs text-gray-500">Painel de Controle</p>
              </div>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {roleLabels[user.role]}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} className="mr-1" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user.first_name}! 👋
          </h2>
          <p className="text-gray-600">
            Bem-vindo ao painel de controle do LogiTrack. Gerencie suas operações de transporte.
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card padding="md" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center">
              <Package className="w-8 h-8 mr-3" />
              <div>
                <p className="text-blue-100 text-sm">OTs Ativas</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </Card>
          
          <Card padding="md" className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center">
              <Route className="w-8 h-8 mr-3" />
              <div>
                <p className="text-green-100 text-sm">Entregas Hoje</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </Card>
          
          <Card padding="md" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center">
              <Truck className="w-8 h-8 mr-3" />
              <div>
                <p className="text-orange-100 text-sm">Em Trânsito</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </Card>
          
          <Card padding="md" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 mr-3" />
              <div>
                <p className="text-purple-100 text-sm">Performance</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Actions Card */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⚡ Ações Rápidas
            </h3>
            
            <div className="space-y-3">
              <Button variant="outline" fullWidth className="justify-start">
                <Package className="w-4 h-4 mr-2" />
                Gerenciar Ordens de Transporte
              </Button>
              
              <Button variant="outline" fullWidth className="justify-start">
                <User className="w-4 h-4 mr-2" />
                Gerenciar Motoristas
              </Button>
              
              <Button variant="outline" fullWidth className="justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios e Analytics
              </Button>
              
              <Button variant="outline" fullWidth className="justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Configurações do Sistema
              </Button>
            </div>
          </Card>
          
          {/* Recent Activity */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📈 Atividade Recente
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    OT #2025042600123 entregue
                  </p>
                  <p className="text-xs text-gray-500">há 15 minutos</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Nova OT criada por João Silva
                  </p>
                  <p className="text-xs text-gray-500">há 1 hora</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Transferência de OT aprovada
                  </p>
                  <p className="text-xs text-gray-500">há 2 horas</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* User Info */}
        <Card padding="lg" className="bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <User className="w-6 h-6 text-blue-600 mr-3 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Informações da Conta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-700"><strong>Nome:</strong> {user.first_name} {user.last_name}</p>
                  <p className="text-blue-700"><strong>Email:</strong> {user.email}</p>
                  <p className="text-blue-700"><strong>CPF:</strong> {user.cpf}</p>
                </div>
                <div>
                  <p className="text-blue-700"><strong>Função:</strong> {roleLabels[user.role]}</p>
                  <p className="text-blue-700"><strong>Status:</strong> {user.is_active ? '✅ Ativo' : '❌ Inativo'}</p>
                  <p className="text-blue-700"><strong>Membro desde:</strong> {new Date(user.date_joined).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
      </main>
      
      {/* Debug Info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4">
          <Card padding="sm" className="bg-yellow-50 border-yellow-200 max-w-xs">
            <div className="flex items-center text-yellow-800">
              <span className="mr-2">🔧</span>
              <div className="text-xs">
                <strong>Debug Mode:</strong> Interface Web • SSR Ativo • Autenticação JWT
              </div>
            </div>
          </Card>
        </div>
      )}
      
    </div>
  );
}