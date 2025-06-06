// mobile/src/services/index.ts - VERSÃO ATUALIZADA COMPLETA

// ==============================================================================
// 📦 EXPORTS DOS SERVIÇOS
// ==============================================================================

// Serviço de API base
export { default as api, apiService } from './api';

// Serviço de autenticação
export { default as authService } from './authService';

// 🆕 Serviço de Ordens de Transporte
export { default as otService } from './otService';

// ==============================================================================
// 📋 TIPOS EXPORTADOS
// ==============================================================================

// Tipos de autenticação (atualizados)
export type { 
  LoginCredentials, 
  LoginResponse,
  RegisterData,
  RegisterResponse,
  User 
} from './authService';

// 🆕 Tipos de OTs
export type { 
  CriarOTRequest,
  OT,
  CriarOTResponse,
  ListarOTsResponse,
  DetalhesOTResponse,
  AtualizarStatusRequest
} from './otService';