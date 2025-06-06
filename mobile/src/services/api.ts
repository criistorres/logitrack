// src/services/api.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance } from 'axios';

/**
 * URL base da API
 * Em desenvolvimento aponta para localhost
 * Em produção deve apontar para o servidor real
 */
const DEVELOPMENT_IP = '192.168.0.8'
const API_BASE_URL = __DEV__ 
  ? `http://${DEVELOPMENT_IP}:8000/api`  // ← IP da rede local + /api
  : 'https://api.logitrack.com/api';

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
      // Buscar token do AsyncStorage
      const token = await AsyncStorage.getItem('@LogiTrack:token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log em desenvolvimento
      if (__DEV__) {
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
    if (__DEV__) {
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
    if (__DEV__) {
      console.log('❌ Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    
    // Tratar erro 401 (não autorizado)
    if (error.response?.status === 401) {
      // Limpar token e redirecionar para login
      await AsyncStorage.removeItem('@LogiTrack:token');
      // TODO: Redirecionar para tela de login
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