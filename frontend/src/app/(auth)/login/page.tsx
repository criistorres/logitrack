// src/app/(auth)/login/page.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Truck } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button, Input, Card, Alert } from '../../../components/ui';

/**
 * Página de Login - Interface Web LogiTrack
 * SSR compatível com sistema de autenticação integrado
 */

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  
  console.log('🔐 LoginPage: Renderizando página de login web');
  
  // Atualizar campo do formulário
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Limpar erro geral
    if (submitError) {
      setSubmitError('');
    }
  };
  
  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validar senha
    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 LoginPage: Iniciando submit...');
    
    if (!validateForm()) {
      console.log('❌ LoginPage: Formulário inválido');
      return;
    }
    
    try {
      const result = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      
      if (!result.success) {
        console.log('❌ LoginPage: Erro no login:', result.message);
        
        // Tratar erros específicos
        if (result.errors?.credentials) {
          setErrors({ 
            email: 'Email ou senha incorretos',
            password: 'Email ou senha incorretos'
          });
        } else if (result.errors) {
          // Mapear erros da API para campos do formulário
          const apiErrors: Record<string, string> = {};
          Object.keys(result.errors).forEach(key => {
            const errorArray = result.errors![key];
            if (Array.isArray(errorArray) && errorArray.length > 0) {
              apiErrors[key] = errorArray[0];
            }
          });
          setErrors(apiErrors);
        } else {
          setSubmitError(result.message);
        }
      }
      // Se sucesso, o redirect é feito automaticamente pelo context
    } catch (error) {
      console.error('❌ LoginPage: Erro inesperado:', error);
      setSubmitError('Ocorreu um erro inesperado. Tente novamente.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header com Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl shadow-lg mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LogiTrack</h1>
          <p className="text-gray-600">Sistema de Gerenciamento de Transporte</p>
        </div>
        
        {/* Card de Login */}
        <Card padding="lg" className="shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bem-vindo de volta! 👋
            </h2>
            <p className="text-gray-600">
              Faça login para acessar o painel de controle
            </p>
          </div>
          
          {/* Erro Geral */}
          {submitError && (
            <Alert type="error" className="mb-6">
              {submitError}
            </Alert>
          )}
          
          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Campo Email */}
            <Input
              label="Email Profissional"
              type="email"
              placeholder="seu.email@empresa.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              error={errors.email}
              leftIcon={<Mail size={18} />}
              required
              autoComplete="email"
              autoFocus
            />
            
            {/* Campo Senha */}
            <Input
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              error={errors.password}
              leftIcon={<Lock size={18} />}
              required
              autoComplete="current-password"
            />
            
            {/* Link Esqueci Senha */}
            <div className="flex justify-end">
              <Link 
                href="/reset-password" 
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
            
            {/* Botão Login */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Entrando...' : 'Entrar no Painel'}
            </Button>
          </form>
          
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">ou</span>
            </div>
          </div>
          
          {/* Link Registro */}
          <div className="text-center">
            <p className="text-gray-600">
              Ainda não tem conta?{' '}
              <Link 
                href="/register" 
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline focus:outline-none focus:underline"
              >
                Criar conta empresarial
              </Link>
            </p>
          </div>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 LogiTrack. Sistema seguro e confiável para sua logística.
          </p>
        </div>
        
        {/* Debug Info (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && (
          <Card padding="sm" className="mt-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center text-yellow-800">
              <span className="mr-2">🔧</span>
              <div className="text-xs">
                <strong>Modo Desenvolvimento:</strong> Interface Web • SSR Ativo • Integração Django API
              </div>
            </div>
          </Card>
        )}
        
      </div>
    </div>
  );
}