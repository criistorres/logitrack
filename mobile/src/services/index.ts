// src/services/index.ts

/**
 * Arquivo de exportação central para todos os serviços
 */

// API base
export { default as api, apiService } from './api';

// Serviços específicos
export { default as authService } from './authService';

// Tipos
export type { LoginCredentials, LoginResponse, User } from './authService';