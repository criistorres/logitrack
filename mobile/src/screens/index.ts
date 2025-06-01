

// ============================================================================
// 📄 src/screens/index.ts (ATUALIZADO)
// ============================================================================

/**
 * Arquivo de exportação central para todas as telas
 * Facilita a importação em outros arquivos
 */

// Telas de autenticação
export {
  ForgotPasswordScreen, LoginScreen,
  RegisterScreen, type AuthStackParamList
} from './auth';

// Telas principais (existentes)
export { default as HomeScreen } from './HomeScreen';
