// mobile/src/screens/auth/index.ts - VERSÃO ORGANIZADA

/**
 * Arquivo de exportação para telas de autenticação
 * Facilita importações e mantém organização
 */

// Exportações principais
export { ForgotPasswordScreen } from './ForgotPasswordScreen';
export { default as LoginScreen } from './LoginScreen';
export { RegisterScreen } from './RegisterScreen';

// Tipos de navegação (re-export para facilitar)
export type { AuthStackParamList } from '../../navigation/AuthNavigator';
