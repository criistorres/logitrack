// src/app/(auth)/register/page.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Phone, CreditCard, Calendar, Truck } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button, Input, Card, Alert } from '../../../components/ui';
import { RegisterData } from '../../../types/auth';

/**
 * Página de Registro - Interface Web LogiTrack
 * Formulário completo para cadastro de novos usuários
 */

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  
  // Estados do formulário
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    cpf: '',
    phone: '',
    role: 'motorista',
    cnh_numero: '',
    cnh_categoria: 'B',
    cnh_validade: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  console.log('📝 RegisterPage: Renderizando página de registro web');
  
  // Atualizar campo do formulário
  const updateField = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Limpar mensagens
    if (submitError) setSubmitError('');
    if (successMessage) setSuccessMessage('');
  };
  
  // Formatadores
  const formatCPF = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/);
    if (match) {
      return [match[1], match[2], match[3], match[4]]
        .filter(Boolean)
        .join('.')
        .replace(/\.(\d{2})$/, '-$1');
    }
    return text;
  };
  
  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    if (match) {
      return [match[1], match[2], match[3]]
        .filter(Boolean)
        .join('')
        .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return text;
  };
  
  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validar campos obrigatórios
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    if (!formData.password_confirm) newErrors.password_confirm = 'Confirmação de senha é obrigatória';
    if (!formData.first_name.trim()) newErrors.first_name = 'Nome é obrigatório';
    if (!formData.last_name.trim()) newErrors.last_name = 'Sobrenome é obrigatório';
    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
    
    // Validar email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validar senha
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    }
    
    // Validar confirmação de senha
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Senhas não coincidem';
    }
    
    // Validar CPF (formato básico)
    const cpfNumbers = formData.cpf.replace(/\D/g, '');
    if (formData.cpf && cpfNumbers.length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
    }
    
    // Validar campos específicos de motorista
    if (formData.role === 'motorista') {
      if (!formData.cnh_numero?.trim()) newErrors.cnh_numero = 'Número da CNH é obrigatório para motoristas';
      if (!formData.cnh_categoria) newErrors.cnh_categoria = 'Categoria da CNH é obrigatória';
      if (!formData.cnh_validade) newErrors.cnh_validade = 'Validade da CNH é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 RegisterPage: Iniciando submit...');
    
    if (!validateForm()) {
      console.log('❌ RegisterPage: Formulário inválido');
      return;
    }
    
    try {
      // Preparar dados
      const submitData: RegisterData = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        cpf: formData.cpf.replace(/\D/g, ''), // Apenas números
        phone: formData.phone?.replace(/\D/g, '') || '', // Apenas números
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      };
      
      const result = await register(submitData);
      
      if (result.success) {
        console.log('✅ RegisterPage: Registro bem-sucedido');
        setSuccessMessage('Conta criada com sucesso! Aguarde ativação pela equipe.');
        // O redirect é feito automaticamente pelo context
      } else {
        console.log('❌ RegisterPage: Erro no registro:', result.message);
        
        if (result.errors) {
          // Mapear erros da API
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
    } catch (error) {
      console.error('❌ RegisterPage: Erro inesperado:', error);
      setSubmitError('Ocorreu um erro inesperado. Tente novamente.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header com Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl shadow-lg mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta LogiTrack</h1>
          <p className="text-gray-600">Cadastre-se para acessar a plataforma profissional</p>
        </div>
        
        {/* Card de Registro */}
        <Card padding="lg" className="shadow-xl">
          
          {/* Mensagem de Sucesso */}
          {successMessage && (
            <Alert type="success" className="mb-6" title="Conta Criada!">
              {successMessage}
            </Alert>
          )}
          
          {/* Erro Geral */}
          {submitError && (
            <Alert type="error" className="mb-6">
              {submitError}
            </Alert>
          )}
          
          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Informações Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                👤 Informações Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  placeholder="Seu primeiro nome"
                  value={formData.first_name}
                  onChange={(e) => updateField('first_name', e.target.value)}
                  error={errors.first_name}
                  leftIcon={<User size={18} />}
                  required
                />
                
                <Input
                  label="Sobrenome"
                  placeholder="Seu sobrenome"
                  value={formData.last_name}
                  onChange={(e) => updateField('last_name', e.target.value)}
                  error={errors.last_name}
                  leftIcon={<User size={18} />}
                  required
                />
              </div>
              
              <Input
                label="Email Profissional"
                type="email"
                placeholder="seu.email@empresa.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
                leftIcon={<Mail size={18} />}
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => updateField('cpf', formatCPF(e.target.value))}
                  error={errors.cpf}
                  leftIcon={<CreditCard size={18} />}
                  maxLength={14}
                  required
                />
                
                <Input
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', formatPhone(e.target.value))}
                  error={errors.phone}
                  leftIcon={<Phone size={18} />}
                  maxLength={15}
                />
              </div>
            </div>
            
            {/* Informações da CNH (apenas para motoristas) */}
            {formData.role === 'motorista' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  🚗 Informações da CNH
                </h3>
                
                <Input
                  label="Número da CNH"
                  placeholder="12345678901"
                  value={formData.cnh_numero}
                  onChange={(e) => updateField('cnh_numero', e.target.value)}
                  error={errors.cnh_numero}
                  leftIcon={<CreditCard size={18} />}
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Categoria da CNH <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['A', 'B', 'AB', 'C', 'D', 'E'].map((categoria) => (
                        <button
                          key={categoria}
                          type="button"
                          onClick={() => updateField('cnh_categoria', categoria)}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            formData.cnh_categoria === categoria
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {categoria}
                        </button>
                      ))}
                    </div>
                    {errors.cnh_categoria && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.cnh_categoria}
                      </p>
                    )}
                  </div>
                  
                  <Input
                    label="Validade da CNH"
                    type="date"
                    value={formData.cnh_validade}
                    onChange={(e) => updateField('cnh_validade', e.target.value)}
                    error={errors.cnh_validade}
                    leftIcon={<Calendar size={18} />}
                    hint="Data de validade da sua CNH"
                    required
                  />
                </div>
              </div>
            )}
            
            {/* Informações de Acesso */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                🔒 Informações de Acesso
              </h3>
              
              <Input
                label="Senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                error={errors.password}
                leftIcon={<Lock size={18} />}
                hint="Use uma senha forte com letras, números e símbolos"
                required
              />
              
              <Input
                label="Confirmar Senha"
                type="password"
                placeholder="Digite a senha novamente"
                value={formData.password_confirm}
                onChange={(e) => updateField('password_confirm', e.target.value)}
                error={errors.password_confirm}
                leftIcon={<Lock size={18} />}
                required
              />
            </div>
            
            {/* Botão Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Criando Conta...' : 'Criar Conta Empresarial'}
            </Button>
          </form>
          
          {/* Link Login */}
          <div className="mt-6 text-center border-t pt-6">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline focus:outline-none focus:underline"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </Card>
        
        {/* Info Footer */}
        <Card padding="sm" className="mt-6 bg-green-50 border-green-200">
          <div className="flex items-center text-green-800">
            <span className="mr-2">✅</span>
            <div className="text-sm">
              <strong>Conta Gratuita:</strong> Sua conta será ativada pela equipe de logística em até 24 horas.
            </div>
          </div>
        </Card>
        
      </div>
    </div>
  );
}