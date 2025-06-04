// src/contexts/AuthContext.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authService, LoginCredentials, User } from '../services';

// ==============================================================================
// 📋 TIPOS E INTERFACES
// ==============================================================================

interface AuthContextData {
  // Estado de autenticação
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Métodos de autenticação
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  
  // Reset de senha
  requestPasswordReset: (email: string) => Promise<PasswordResetResponse>;
  confirmPasswordReset: (data: PasswordResetConfirmData) => Promise<PasswordResetConfirmResponse>;
  
  // Utilitários
  refreshUserData: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  cpf: string;
  phone?: string;
  role: 'motorista' | 'logistica' | 'admin';
  cnh_numero?: string;
  cnh_categoria?: string;
  cnh_validade?: string;
}

interface PasswordResetConfirmData {
  code: string;
  new_password: string;
  confirm_password: string;
}

// Tipos de resposta da API
interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    tokens: {
      access: string;
      refresh: string;
    };
  };
  errors?: any;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    tokens: {
      access: string;
      refresh: string;
    };
  };
  errors?: any;
}

interface PasswordResetResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    expires_in_minutes: number;
    max_attempts: number;
  };
}

interface PasswordResetConfirmResponse {
  success: boolean;
  message: string;
  data?: {
    user_email: string;
    changed_at: string;
  };
  errors?: any;
}

// ==============================================================================
// 🎯 CONTEXT CRIAÇÃO
// ==============================================================================

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// ==============================================================================
// 🏗️ PROVIDER COMPONENT
// ==============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Estados locais
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Computed state
  const isAuthenticated = !!user;
  
  // ==============================================================================
  // 🔄 VERIFICAR STATUS DE AUTENTICAÇÃO NO INÍCIO
  // ==============================================================================
  const DEVELOPMENT_IP = '192.168.0.12'
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  const checkAuthStatus = async (): Promise<void> => {
    try {
      console.log('🔍 AuthContext: Verificando status de autenticação...');
      setIsLoading(true);
      
      // Verificar se há token armazenado
      const isAuth = await authService.isAuthenticated();
      console.log(`🔍 AuthContext: Token encontrado: ${isAuth}`);
      
      if (isAuth) {
        // Buscar dados do usuário
        const userData = await authService.getCurrentUser();
        console.log(`🔍 AuthContext: Dados do usuário: ${userData?.email}`);
        
        if (userData) {
          setUser(userData);
          console.log('✅ AuthContext: Usuário autenticado automaticamente');
        } else {
          console.log('❌ AuthContext: Token inválido, fazendo logout');
          await logout();
        }
      } else {
        console.log('ℹ️ AuthContext: Usuário não autenticado');
      }
    } catch (error) {
      console.error('❌ AuthContext: Erro ao verificar status de auth:', error);
      await logout(); // Limpar qualquer token inválido
    } finally {
      setIsLoading(false);
    }
  };
  
  // ==============================================================================
  // 🔐 MÉTODO DE LOGIN
  // ==============================================================================
  
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      console.log('🔐 AuthContext: Iniciando login...');
      console.log(`🔐 Email: ${credentials.email}`);
      
      setIsLoading(true);
      
      // 🔧 CORREÇÃO: Usar authService que já está configurado corretamente
      const response = await authService.login(credentials);
      console.log('🔐 AuthContext: Resposta do authService:', response);
      
      // ✅ authService já salva os tokens automaticamente no AsyncStorage
      // ✅ Apenas atualizar o estado local
      setUser(response.user);
      
      console.log(`✅ AuthContext: Usuário logado: ${response.user.email}`);
      
      return {
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: response.user,
          tokens: {
            access: response.access,
            refresh: response.refresh
          }
        }
      };
      
    } catch (error: any) {
      console.error('❌ AuthContext: Erro no login:', error);
      
      // Tratar diferentes tipos de erro
      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Email ou senha incorretos',
          errors: { credentials: ['Credenciais inválidas'] }
        };
      } else if (error.response?.status === 400) {
        return {
          success: false,
          message: 'Dados inválidos',
          errors: error.response.data?.errors || {}
        };
      } else {
        return {
          success: false,
          message: 'Erro de conexão. Tente novamente.',
          errors: { network: ['Erro de rede'] }
        };
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // ==============================================================================
  // 📝 MÉTODO DE REGISTRO
  // ==============================================================================
  
  const register = async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      console.log('📝 AuthContext: Iniciando registro...');
      console.log(`📝 Email: ${data.email}`);
      console.log(`📝 Role: ${data.role}`);
      
      setIsLoading(true);
      
      // Preparar dados para API
      const registerData = {
        ...data,
        // Garantir que campos de CNH estejam presentes se for motorista
        ...(data.role === 'motorista' && {
          cnh_numero: data.cnh_numero || '',
          cnh_categoria: data.cnh_categoria || 'B',
          cnh_validade: data.cnh_validade || ''
        })
      };
      
      // Chamar API de registro
      const response = await fetch(`http://${DEVELOPMENT_IP}:8000/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });
      
      const result = await response.json();
      console.log('📝 AuthContext: Resposta da API:', result);
      
      if (result.success && result.data) {
        console.log('✅ AuthContext: Registro bem-sucedido');
        
        // Salvar tokens
        await AsyncStorage.multiSet([
          ['@LogiTrack:token', result.data.tokens.access],
          ['@LogiTrack:refreshToken', result.data.tokens.refresh],
          ['@LogiTrack:user', JSON.stringify(result.data.user)],
        ]);
        
        // Atualizar estado
        setUser(result.data.user);
        
        return {
          success: true,
          message: 'Conta criada com sucesso!',
          data: result.data
        };
      } else {
        console.log('❌ AuthContext: Erro no registro:', result);
        return {
          success: false,
          message: result.message || 'Erro ao criar conta',
          errors: result.errors || {}
        };
      }
      
    } catch (error: any) {
      console.error('❌ AuthContext: Erro no registro:', error);
      return {
        success: false,
        message: 'Erro de conexão. Tente novamente.',
        errors: { network: ['Erro de rede'] }
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  // ==============================================================================
  // 🚪 MÉTODO DE LOGOUT
  // ==============================================================================
  
  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 AuthContext: Iniciando logout...');
      
      // Chamar serviço de logout
      await authService.logout();
      
      // Limpar estado local
      setUser(null);
      
      console.log('✅ AuthContext: Logout realizado');
      
    } catch (error) {
      console.error('❌ AuthContext: Erro no logout:', error);
      // Mesmo com erro, limpar estado local
      setUser(null);
    }
  };
  
  // ==============================================================================
  // 🔄 RESET DE SENHA
  // ==============================================================================
  
  const requestPasswordReset = async (email: string): Promise<PasswordResetResponse> => {
    try {
      console.log('🔄 AuthContext: Solicitando reset de senha...');
      console.log(`🔄 Email: ${email}`);
      
      const response = await fetch(`http://${DEVELOPMENT_IP}:8000/api/auth/password/reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const result = await response.json();
      console.log('🔄 AuthContext: Resposta do reset:', result);
      
      return {
        success: result.success || false,
        message: result.message || 'Código de redefinição enviado',
        data: result.data
      };
      
    } catch (error) {
      console.error('❌ AuthContext: Erro no reset de senha:', error);
      return {
        success: false,
        message: 'Erro de conexão. Tente novamente.'
      };
    }
  };
  
  const confirmPasswordReset = async (data: PasswordResetConfirmData): Promise<PasswordResetConfirmResponse> => {
    try {
      console.log('🔄 AuthContext: Confirmando reset de senha...');
      console.log(`🔄 Código: ${data.code}`);
      
      const response = await fetch(`http://${DEVELOPMENT_IP}:8000/api/auth/password/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      console.log('🔄 AuthContext: Resposta da confirmação:', result);
      
      return {
        success: result.success || false,
        message: result.message || 'Senha redefinida com sucesso',
        data: result.data,
        errors: result.errors
      };
      
    } catch (error) {
      console.error('❌ AuthContext: Erro na confirmação de reset:', error);
      return {
        success: false,
        message: 'Erro de conexão. Tente novamente.'
      };
    }
  };
  
  // ==============================================================================
  // 🔄 UTILITÁRIOS
  // ==============================================================================
  
  const refreshUserData = async (): Promise<void> => {
    try {
      console.log('🔄 AuthContext: Atualizando dados do usuário...');
      
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
        console.log('✅ AuthContext: Dados do usuário atualizados');
      }
    } catch (error) {
      console.error('❌ AuthContext: Erro ao atualizar dados do usuário:', error);
    }
  };
  
  // ==============================================================================
  // 📦 PROVIDER VALUE
  // ==============================================================================
  
  const value: AuthContextData = {
    // Estado
    user,
    isAuthenticated,
    isLoading,
    
    // Métodos
    login,
    logout,
    register,
    requestPasswordReset,
    confirmPasswordReset,
    refreshUserData,
    checkAuthStatus,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ==============================================================================
// 🪝 HOOK CUSTOMIZADO
// ==============================================================================

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}