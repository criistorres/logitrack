// mobile/src/services/authService.ts - VERSÃO COMPLETA COM REGISTER

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';

/**
 * Tipos para autenticação
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
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

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'motorista' | 'logistica' | 'admin';
    cpf: string;
  };
}

export interface RegisterResponse {
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

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'motorista' | 'logistica' | 'admin';
  cpf: string;
  phone?: string;
  is_active: boolean;
}

/**
 * Serviço de Autenticação
 * Gerencia login, logout, register e tokens
 */
class AuthService {
  /**
   * Realizar login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🔐 AuthService: Fazendo login via API...');
      const response = await apiService.post<any>('/auth/login/', credentials);
      
      console.log('🔐 AuthService: Resposta completa da API:', response.data);
      
      // Extrair tokens da estrutura correta da API
      const { data } = response.data; // Primeira camada
      const { user, tokens } = data;   // Segunda camada
      
      console.log('🔐 AuthService: Tokens extraídos:', tokens);
      console.log('🔐 AuthService: Usuário extraído:', user);
      
      // Salvar tokens no AsyncStorage
      await AsyncStorage.multiSet([
        ['@LogiTrack:token', tokens.access],
        ['@LogiTrack:refreshToken', tokens.refresh],
        ['@LogiTrack:user', JSON.stringify(user)],
      ]);
      
      console.log('✅ AuthService: Tokens salvos no AsyncStorage');
      
      // Retornar estrutura consistente
      return {
        user,
        access: tokens.access,
        refresh: tokens.refresh
      };
      
    } catch (error) {
      console.error('❌ AuthService: Erro no login:', error);
      throw error;
    }
  }

  /**
   * 🆕 Realizar registro
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      console.log('📝 AuthService: Fazendo registro via API...');
      console.log('📝 AuthService: Dados enviados:', {
        email: data.email,
        role: data.role,
        first_name: data.first_name,
        last_name: data.last_name
      });
      
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
      
      console.log('📝 AuthService: Dados formatados para API:', registerData);
      
      // 🎯 USAR APISERVICE AO INVÉS DE FETCH DIRETO
      const response = await apiService.post<any>('/auth/register/', registerData);
      
      console.log('📝 AuthService: Resposta completa da API:', response.data);
      
      // Verificar se foi sucesso
      if (response.data.success && response.data.data) {
        console.log('✅ AuthService: Registro bem-sucedido');
        
        const { user, tokens } = response.data.data;
        
        // Salvar tokens automaticamente
        await AsyncStorage.multiSet([
          ['@LogiTrack:token', tokens.access],
          ['@LogiTrack:refreshToken', tokens.refresh],
          ['@LogiTrack:user', JSON.stringify(user)],
        ]);
        
        console.log('✅ AuthService: Tokens do registro salvos no AsyncStorage');
        
        return {
          success: true,
          message: 'Conta criada com sucesso!',
          data: response.data.data
        };
      } else {
        console.log('❌ AuthService: Erro no registro:', response.data);
        return {
          success: false,
          message: response.data.message || 'Erro ao criar conta',
          errors: response.data.errors || {}
        };
      }
      
    } catch (error: any) {
      console.error('❌ AuthService: Erro no registro:', error);
      
      // Tratar diferentes tipos de erro
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || 'Erro ao criar conta',
          errors: error.response.data.errors || {}
        };
      } else {
        return {
          success: false,
          message: 'Erro de conexão. Tente novamente.',
          errors: { network: ['Erro de rede'] }
        };
      }
    }
  }

  /**
 * 🚪 Realizar logout - VERSÃO CORRIGIDA
 */
async logout(): Promise<void> {
  try {
    console.log('🚪 AuthService: Fazendo logout...');
    
    // CORREÇÃO: Pegar refresh token do AsyncStorage
    const refreshToken = await AsyncStorage.getItem('@LogiTrack:refreshToken');
    
    if (refreshToken) {
      console.log('🚪 AuthService: Enviando refresh token para logout...');
      
      // CORREÇÃO: Enviar refresh token no body da requisição
      await apiService.post('/auth/logout/', {
        refresh: refreshToken
      });
      
      console.log('✅ AuthService: Logout realizado no servidor');
    } else {
      console.log('⚠️ AuthService: Nenhum refresh token encontrado, fazendo logout local apenas');
    }
    
  } catch (error) {
    console.error('❌ Erro ao fazer logout no servidor:', error);
    // Continuar com logout local mesmo se o servidor falhar
  } finally {
    // Limpar dados locais independente do resultado
    await AsyncStorage.multiRemove([
      '@LogiTrack:token',
      '@LogiTrack:refreshToken',
      '@LogiTrack:user',
    ]);
    console.log('✅ AuthService: Dados locais limpos');
  }
}
  
  /**
   * Obter usuário atual do AsyncStorage
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem('@LogiTrack:user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  }
  
  /**
   * Verificar se está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('@LogiTrack:token');
      return !!token;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Renovar token usando refresh token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem('@LogiTrack:refreshToken');
      
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }
      
      const response = await apiService.post<{ access: string }>('/auth/token/refresh/', {
        refresh: refreshToken,
      });
      
      // Salvar novo token
      await AsyncStorage.setItem('@LogiTrack:token', response.data.access);
      
      return response.data.access;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      // Se falhar, fazer logout
      await this.logout();
      return null;
    }
  }
  
  /**
   * Solicitar redefinição de senha
   */
  async requestPasswordReset(email: string): Promise<void> {
    await apiService.post('/auth/password/reset/', { email });
  }
}

// Exportar instância única do serviço
export default new AuthService();