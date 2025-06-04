// src/services/api.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

/**
 * Configuração da API para comunicação com Django backend
 */

// URL base da API - use seu IP de desenvolvimento
const DEVELOPMENT_IP = '192.168.0.12'; // ⚠️ ALTERE para seu IP real
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? `http://${DEVELOPMENT_IP}:8000/api`
  : process.env.NEXT_PUBLIC_API_URL || 'https://api.logitrack.com/api';

console.log('🌐 API Base URL:', API_BASE_URL);

/**
 * Instância configurada do Axios
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de Request
 * Adiciona o token de autenticação em todas as requisições
 */
api.interceptors.request.use(
  async (config) => {
    try {
      // Buscar token dos cookies
      const token = Cookies.get('logitrack_token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Request:', {
          url: config.url,
          method: config.method,
          headers: config.headers,
        });
      }
      
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Response
 * Trata erros globalmente
 */
api.interceptors.response.use(
  (response) => {
    // Log em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    // Log de erro em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    
    // Tratar erro 401 (não autorizado)
    if (error.response?.status === 401) {
      // Limpar token e redirecionar para login
      Cookies.remove('logitrack_token');
      Cookies.remove('logitrack_refresh_token');
      Cookies.remove('logitrack_user');
      
      // Se estiver no browser, redirecionar
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Funções auxiliares para requisições HTTP
 */
export const apiService = {
  /**
   * GET request
   */
  get: <T = any>(url: string, params?: any) => 
    api.get<T>(url, { params }),
  
  /**
   * POST request
   */
  post: <T = any>(url: string, data?: any) => 
    api.post<T>(url, data),
  
  /**
   * PUT request
   */
  put: <T = any>(url: string, data?: any) => 
    api.put<T>(url, data),
  
  /**
   * PATCH request
   */
  patch: <T = any>(url: string, data?: any) => 
    api.patch<T>(url, data),
  
  /**
   * DELETE request
   */
  delete: <T = any>(url: string) => 
    api.delete<T>(url),
};

export default api;