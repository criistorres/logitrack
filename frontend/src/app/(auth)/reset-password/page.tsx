// src/app/(auth)/reset-password/page.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Key, Truck } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button, Input, Card, Alert } from '../../../components/ui';

/**
 * Página de Reset de Senha - Interface Web LogiTrack
 * Sistema de código de 6 dígitos via email
 */

export default function ResetPasswordPage() {
  const { requestPasswordReset, confirmPasswordReset } = useAuth();
  
  // Estados do formulário
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');
  
  console.log('🔄 ResetPasswordPage: Renderizando página de reset web');
  
  // Atualizar campo do formulário
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erros
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (submitError) setSubmitError('');
    if (successMessage) setSuccessMessage('');
  };
  
  // Submeter email para reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔄 ResetPasswordPage: Solicitando reset...');
    
    if (!formData.email.trim()) {
      setErrors({ email: 'Email é obrigatório' });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Email inválido' });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await requestPasswordReset(formData.email.trim().toLowerCase());
      
      if (result.success) {
        console.log('✅ ResetPasswordPage: Código enviado');
        setSuccessMessage('Código de 6 dígitos enviado para seu email. O código expira em 30 minutos.');
        setStep('code');
      } else {
        setSubmitError(result.message || 'Erro ao enviar código. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ ResetPasswordPage: Erro:', error);
      setSubmitError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Confirmar reset com código
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔄 ResetPasswordPage: Confirmando reset...');
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.code.trim()) newErrors.code = 'Código é obrigatório';
    if (formData.code.length !== 6) newErrors.code = 'Código deve ter 6 dígitos';
    if (!formData.new_password) newErrors.new_password = 'Nova senha é obrigatória';
    if (formData.new_password.length < 8) newErrors.new_password = 'Senha deve ter pelo menos 8 caracteres';
    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Senhas não coincidem';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await confirmPasswordReset({
        code: formData.code.trim(),
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      });
      
      if (result.success) {
        console.log('✅ ResetPasswordPage: Senha alterada');
        setSuccessMessage('Senha redefinida com sucesso! Faça login com a nova senha.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        console.log('❌ ResetPasswordPage: Erro na confirmação:', result.message);
        
        if (result.errors) {
          const apiErrors: Record<string, string> = {};
          Object.keys(result.errors).forEach(key => {
            const errorArray = result.errors![key];
            if (Array.isArray(errorArray) && errorArray.length > 0) {
              apiErrors[key] = errorArray[0];
            }
          });
          setErrors(apiErrors);
        } else {
          setSubmitError(result.message || 'Código inválido ou expirado.');
        }
      }
    } catch (error) {
      console.error('❌ ResetPasswordPage: Erro:', error);
      setSubmitError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header com Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-xl shadow-lg mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'email' ? 'Redefinir Senha' : 'Digite o Código'}
          </h1>
          <p className="text-gray-600">
            {step === 'email' 
              ? 'Digite seu email para receber um código de redefinição'
              : 'Enviamos um código de 6 dígitos para seu email'
            }
          </p>
        </div>
        
        {/* Card de Reset */}
        <Card padding="lg" className="shadow-xl">
          
          {/* Mensagem de Sucesso */}
          {successMessage && (
            <Alert type="success" className="mb-6" title="Sucesso!">
              {successMessage}
            </Alert>
          )}
          
          {/* Erro Geral */}
          {submitError && (
            <Alert type="error" className="mb-6">
              {submitError}
            </Alert>
          )}
          
          {/* Formulário - Etapa Email */}
          {step === 'email' && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              
              <Input
                label="Email da Conta"
                type="email"
                placeholder="Digite seu email cadastrado"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
                leftIcon={<Mail size={18} />}
                required
                autoFocus
                autoComplete="email"
              />
              
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? 'Enviando...' : 'Enviar Código de Redefinição'}
              </Button>
              
              <div className="text-center">
                <Link 
                  href="/login" 
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:underline"
                >
                  ← Voltar para o login
                </Link>
              </div>
            </form>
          )}
          
          {/* Formulário - Etapa Código */}
          {step === 'code' && (
            <form onSubmit={handleConfirmReset} className="space-y-6">
              
              {/* Info do Email */}
              <Alert type="info" className="mb-4">
                <strong>Código enviado para:</strong> {formData.email}
                <br />
                <small>Verifique sua caixa de entrada e spam</small>
              </Alert>
              
              <Input
                label="Código de 6 Dígitos"
                placeholder="123456"
                value={formData.code}
                onChange={(e) => updateField('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                error={errors.code}
                leftIcon={<Key size={18} />}
                maxLength={6}
                required
                autoFocus
                hint="Verifique sua caixa de entrada e spam"
              />
              
              <Input
                label="Nova Senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.new_password}
                onChange={(e) => updateField('new_password', e.target.value)}
                error={errors.new_password}
                leftIcon={<Lock size={18} />}
                required
                autoComplete="new-password"
              />
              
              <Input
                label="Confirmar Nova Senha"
                type="password"
                placeholder="Digite a senha novamente"
                value={formData.confirm_password}
                onChange={(e) => updateField('confirm_password', e.target.value)}
                error={errors.confirm_password}
                leftIcon={<Lock size={18} />}
                required
                autoComplete="new-password"
              />
              
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Redefinindo...' : 'Redefinir Minha Senha'}
              </Button>
              
              {/* Links de Navegação */}
              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:underline"
                >
                  ← Voltar para email
                </button>
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:underline"
                >
                  Ir para login
                </Link>
              </div>
            </form>
          )}
        </Card>
        
        {/* Dicas de Segurança */}
        <Card padding="sm" className="mt-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start">
            <span className="text-yellow-600 mr-2 text-lg">💡</span>
            <div className="text-yellow-800 text-sm">
              <strong>Dicas de Segurança:</strong>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• O código expira em 30 minutos</li>
                <li>• Máximo 3 tentativas por código</li>
                <li>• Use uma senha forte e única</li>
                <li>• Não compartilhe seu código com ninguém</li>
              </ul>
            </div>
          </div>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Precisa de ajuda? Entre em contato com o suporte técnico.
          </p>
        </div>
        
      </div>
    </div>
  );
}