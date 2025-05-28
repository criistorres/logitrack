// Configurações da API (para uso futuro)
export const API_CONFIG = {
    BASE_URL: __DEV__ ? 'http://localhost:8000' : 'https://api.logitrack.com',
    TIMEOUT: 10000,
  };
  
  // Cores do tema (além do Tailwind)
  export const COLORS = {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };
  
  // Configurações do app
  export const APP_CONFIG = {
    name: 'LogiTrack',
    version: '1.0.0',
    environment: __DEV__ ? 'development' : 'production',
  };