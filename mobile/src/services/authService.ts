// src/services/authService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';

/**
 * Tipos para autenticação
 */
export interface LoginCredentials {
  email: string;
  password: string;
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
 * Gerencia login, logout e tokens
 */
class AuthService {
  /**
   * Realizar login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiService.post<any>('/auth/login/', credentials);
      
      console.log('🔐 AuthService: Resposta completa da API:', response.data);
      
      // ✅ CORREÇÃO: Extrair tokens da estrutura correta da API
      const { data } = response.data; // Primeira camada
      const { user, tokens } = data;   // Segunda camada
      
      console.log('🔐 AuthService: Tokens extraídos:', tokens);
      console.log('🔐 AuthService: Usuário extraído:', user);
      
      // Salvar tokens no AsyncStorage
      await AsyncStorage.multiSet([
        ['@LogiTrack:token', tokens.access],           // ✅ Usar tokens.access
        ['@LogiTrack:refreshToken', tokens.refresh],   // ✅ Usar tokens.refresh
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
   * Realizar logout
   */
  async logout(): Promise<void> {
    try {
      // Chamar endpoint de logout (se existir)
      await apiService.post('/auth/logout/');
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    } finally {
      // Limpar dados locais independente do resultado
      await AsyncStorage.multiRemove([
        '@LogiTrack:token',
        '@LogiTrack:refreshToken',
        '@LogiTrack:user',
      ]);
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