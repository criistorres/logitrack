// src/types/auth.ts

/**
 * Tipos para sistema de autenticação LogiTrack
 */

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'motorista' | 'logistica' | 'admin';
  cpf: string;
  phone?: string;
  is_active: boolean;
  date_joined: string;
  cnh_numero?: string;
  cnh_categoria?: string;
  cnh_validade?: string;
  foto_perfil?: string;
}

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

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  code: string;
  new_password: string;
  confirm_password: string;
}

// Responses da API
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    tokens: {
      access: string;
      refresh: string;
    };
  };
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Context types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  requestPasswordReset: (email: string) => Promise<ApiResponse>;
  confirmPasswordReset: (data: PasswordResetConfirm) => Promise<ApiResponse>;
  refreshUserData: () => Promise<void>;
}