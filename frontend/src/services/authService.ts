// src/services/authService.ts

import Cookies from 'js-cookie';
import { apiService } from '../services/api';
import { 
  LoginCredentials, 
  RegisterData, 
  PasswordResetRequest, 
  PasswordResetConfirm,
  AuthResponse,
  ApiResponse,
  User 
} from '@/types/auth';

/**
 * Serviço de Autenticação para Next.js
 * Gerencia login, logout, tokens e dados do usuário
 */
class AuthService {
  
  /**
   * Realizar login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 AuthService: Iniciando login...');
      
      const response = await apiService.post<AuthResponse>('/auth/login/', credentials);
      
      if (response.data.success && response.data.data) {
        const { user, tokens } = response.data.data;
        
        // Salvar tokens e dados do usuário nos cookies
        this.saveAuthData(user, tokens.access, tokens.refresh);
        
        console.log('✅ AuthService: Login bem-sucedido');
        return response.data;
      }
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ AuthService: Erro no login:', error);
      
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
    }
  }

  /**
   * Realizar logout
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 AuthService: Iniciando logout...');
      
      // Tentar chamar endpoint de logout no backend
      const refreshToken = Cookies.get('logitrack_refresh_token');
      if (refreshToken) {
        await apiService.post('/auth/logout/', { refresh: refreshToken });
      }
      
    } catch (error) {
      console.error('❌ AuthService: Erro no logout:', error);
    } finally {
      // Limpar dados locais independente do resultado
      this.clearAuthData();
      console.log('✅ AuthService: Logout realizado');
    }
  }

  /**
   * Registrar novo usuário
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('📝 AuthService: Iniciando registro...');
      
      const response = await apiService.post<AuthResponse>('/auth/register/', data);
      
      if (response.data.success && response.data.data) {
        const { user, tokens } = response.data.data;
        
        // Salvar tokens e dados do usuário nos cookies
        this.saveAuthData(user, tokens.access, tokens.refresh);
        
        console.log('✅ AuthService: Registro bem-sucedido');
      }
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ AuthService: Erro no registro:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro de conexão. Tente novamente.',
        errors: error.response?.data?.errors || { network: ['Erro de rede'] }
      };
    }
  }

  /**
   * Solicitar redefinição de senha
   */
  async requestPasswordReset(email: string): Promise<ApiResponse> {
    try {
      console.log('🔄 AuthService: Solicitando reset de senha...');
      
      const response = await apiService.post<ApiResponse>('/auth/password/reset/', { email });
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ AuthService: Erro no reset de senha:', error);
      
      return {
        success: false,
        message: 'Erro de conexão. Tente novamente.'
      };
    }
  }

  /**
   * Confirmar redefinição de senha
   */
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<ApiResponse> {
    try {
      console.log('🔄 AuthService: Confirmando reset de senha...');
      
      const response = await apiService.post<ApiResponse>('/auth/password/confirm/', data);
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ AuthService: Erro na confirmação de reset:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro de conexão. Tente novamente.',
        errors: error.response?.data?.errors
      };
    }
  }

  /**
   * Obter usuário atual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // Primeiro tentar do cookie
      const userCookie = Cookies.get('logitrack_user');
      if (userCookie) {
        return JSON.parse(userCookie);
      }

      // Se não tiver no cookie, buscar da API
      const response = await apiService.get<ApiResponse<User>>('/auth/user/');
      
      if (response.data.success && response.data.data) {
        const user = response.data.data;
        
        // Salvar no cookie para próximas consultas
        Cookies.set('logitrack_user', JSON.stringify(user), { 
          expires: 7, // 7 dias
          sameSite: 'lax' 
        });
        
        return user;
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ AuthService: Erro ao obter usuário:', error);
      return null;
    }
  }

  /**
   * Verificar se está autenticado
   */
  isAuthenticated(): boolean {
    const token = Cookies.get('logitrack_token');
    return !!token;
  }

  /**
   * Renovar token usando refresh token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = Cookies.get('logitrack_refresh_token');
      
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }
      
      const response = await apiService.post<{ access: string }>('/auth/token/refresh/', {
        refresh: refreshToken,
      });
      
      // Salvar novo token
      Cookies.set('logitrack_token', response.data.access, { 
        expires: 1, // 1 dia
        sameSite: 'lax' 
      });
      
      return response.data.access;
      
    } catch (error) {
      console.error('❌ AuthService: Erro ao renovar token:', error);
      // Se falhar, fazer logout
      await this.logout();
      return null;
    }
  }

  /**
   * Salvar dados de autenticação nos cookies
   */
  private saveAuthData(user: User, accessToken: string, refreshToken: string): void {
    // Configurações dos cookies
    const cookieOptions = {
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
    };

    // Salvar tokens
    Cookies.set('logitrack_token', accessToken, { 
      ...cookieOptions,
      expires: 1 // 1 dia para access token
    });
    
    Cookies.set('logitrack_refresh_token', refreshToken, { 
      ...cookieOptions,
      expires: 7 // 7 dias para refresh token
    });
    
    // Salvar dados do usuário
    Cookies.set('logitrack_user', JSON.stringify(user), { 
      ...cookieOptions,
      expires: 7 // 7 dias
    });

    console.log('💾 AuthService: Dados de autenticação salvos nos cookies');
  }

  /**
   * Limpar dados de autenticação
   */
  private clearAuthData(): void {
    Cookies.remove('logitrack_token');
    Cookies.remove('logitrack_refresh_token');
    Cookies.remove('logitrack_user');
    
    console.log('🗑️ AuthService: Dados de autenticação removidos');
  }
}

// Exportar instância única do serviço
export default new AuthService();