// src/contexts/AuthContext.tsx

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import authService from '../services/authService';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  PasswordResetConfirm,
  AuthResponse,
  ApiResponse,
  AuthContextType 
} from '../types/auth';

/**
 * Context de Autenticação para Next.js
 * Gerencia estado global de autenticação
 */

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Computed state
  const isAuthenticated = !!user;
  
  // ==============================================================================
  // 🔄 VERIFICAR STATUS DE AUTENTICAÇÃO NO INÍCIO
  // ==============================================================================
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  const checkAuthStatus = async (): Promise<void> => {
    try {
      console.log('🔍 AuthContext: Verificando status de autenticação...');
      setIsLoading(true);
      
      // Verificar se há token
      const isAuth = authService.isAuthenticated();
      console.log(`🔍 AuthContext: Token encontrado: ${isAuth}`);
      
      if (isAuth) {
        // Buscar dados do usuário
        const userData = await authService.getCurrentUser();
        console.log(`🔍 AuthContext: Dados do usuário:`, userData?.email);
        
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
  
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('🔐 AuthContext: Iniciando login...');
      setIsLoading(true);
      
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        console.log(`✅ AuthContext: Usuário logado: ${response.data.user.email}`);
        
        // Redirecionar para dashboard
        router.push('/dashboard');
      }
      
      return response;
      
    } catch (error: any) {
      console.error('❌ AuthContext: Erro no login:', error);
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
  // 📝 MÉTODO DE REGISTRO
  // ==============================================================================
  
  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      console.log('📝 AuthContext: Iniciando registro...');
      setIsLoading(true);
      
      const response = await authService.register(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        console.log(`✅ AuthContext: Usuário registrado: ${response.data.user.email}`);
        
        // Redirecionar para dashboard
        router.push('/dashboard');
      }
      
      return response;
      
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
      
      await authService.logout();
      setUser(null);
      
      console.log('✅ AuthContext: Logout realizado');
      
      // Redirecionar para login
      router.push('/login');
      
    } catch (error) {
      console.error('❌ AuthContext: Erro no logout:', error);
      // Mesmo com erro, limpar estado local
      setUser(null);
      router.push('/login');
    }
  };
  
  // ==============================================================================
  // 🔄 RESET DE SENHA
  // ==============================================================================
  
  const requestPasswordReset = async (email: string): Promise<ApiResponse> => {
    try {
      console.log('🔄 AuthContext: Solicitando reset de senha...');
      
      const response = await authService.requestPasswordReset(email);
      
      return response;
      
    } catch (error) {
      console.error('❌ AuthContext: Erro no reset de senha:', error);
      return {
        success: false,
        message: 'Erro de conexão. Tente novamente.'
      };
    }
  };
  
  const confirmPasswordReset = async (data: PasswordResetConfirm): Promise<ApiResponse> => {
    try {
      console.log('🔄 AuthContext: Confirmando reset de senha...');
      
      const response = await authService.confirmPasswordReset(data);
      
      return response;
      
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
  
  const value: AuthContextType = {
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}

export { AuthContext };