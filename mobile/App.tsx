// App.tsx

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './global.css';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator'; // ← Import direto

/**
 * Componente principal da aplicação
 * 
 * 🔄 MUDANÇAS NESTA VERSÃO:
 * - Adicionado AuthProvider para gerenciar estado de autenticação
 * - RootNavigator com import direto (sem index.ts problemático)
 * - Configuração completa de context e navegação
 */
export default function App() {
  console.log('🚀 App: Inicializando aplicação...');
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}