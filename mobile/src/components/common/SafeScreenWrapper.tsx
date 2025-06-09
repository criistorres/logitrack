// mobile/src/components/common/SafeScreenWrapper.tsx
// COMPONENTE BASE PARA TODAS AS TELAS - RESOLVE PROBLEMAS DE SAFE AREA

import React from 'react';
import { View, Platform, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// ==============================================================================
// 🎨 CONFIGURAÇÕES DE DESIGN CONSISTENTES
// ==============================================================================

const CORES = {
  fundoPrincipal: '#F9FAFB',
  fundoCard: '#FFFFFF',
  textoEscuro: '#1F2937',
};

// ==============================================================================
// 📱 INTERFACE DO COMPONENTE
// ==============================================================================

interface SafeScreenWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  statusBarBackgroundColor?: string;
  withPadding?: boolean;
  withTabPadding?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

// ==============================================================================
// 🛡️ COMPONENTE WRAPPER UNIVERSAL
// ==============================================================================

/**
 * SafeScreenWrapper - Componente base para todas as telas
 * 
 * ✅ Resolve problemas de:
 * - Safe area inconsistente entre iOS/Android
 * - Tab bar sobrepondo conteúdo
 * - Status bar mal configurada
 * - Padding inconsistente
 * 
 * 🎯 Uso:
 * <SafeScreenWrapper withTabPadding>
 *   <YourScreenContent />
 * </SafeScreenWrapper>
 */
export default function SafeScreenWrapper({
  children,
  backgroundColor = CORES.fundoPrincipal,
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor,
  withPadding = false,
  withTabPadding = true,
  edges = ['top', 'left', 'right'],
}: SafeScreenWrapperProps) {
  
  const insets = useSafeAreaInsets();
  
  // ==============================================================================
  // 📐 CÁLCULOS DE ESPAÇAMENTO RESPONSIVOS
  // ==============================================================================
  
  // Altura da tab bar (configurada no App.tsx)
  const TAB_HEIGHT = Platform.OS === 'ios' ? 85 : 65;
  
  // Padding bottom dinâmico baseado na presença de tabs
  const paddingBottom = withTabPadding ? TAB_HEIGHT : insets.bottom;
  
  // Padding horizontal padrão
  const horizontalPadding = withPadding ? 16 : 0;
  
  // ==============================================================================
  // 🎨 CONFIGURAÇÃO DA STATUS BAR
  // ==============================================================================
  
  const statusBarBg = statusBarBackgroundColor || backgroundColor;
  
  return (
    <>
      {/* ===== STATUS BAR CONFIGURAÇÃO ===== */}
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={Platform.OS === 'android' ? statusBarBg : undefined}
        translucent={false}
      />
      
      {/* ===== SAFE AREA VIEW ===== */}
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor,
        }}
        edges={edges}
      >
        {/* ===== CONTAINER PRINCIPAL ===== */}
        <View
          style={{
            flex: 1,
            backgroundColor,
            paddingHorizontal: horizontalPadding,
            paddingBottom: withTabPadding ? TAB_HEIGHT : 0,
          }}
        >
          {children}
        </View>
      </SafeAreaView>
    </>
  );
}

// ==============================================================================
// 🎯 VARIAÇÕES PRÉ-CONFIGURADAS
// ==============================================================================

/**
 * Variação para telas com tabs (padrão)
 */
export function TabScreenWrapper({ children, ...props }: Omit<SafeScreenWrapperProps, 'withTabPadding'>) {
  return (
    <SafeScreenWrapper withTabPadding={true} {...props}>
      {children}
    </SafeScreenWrapper>
  );
}

/**
 * Variação para telas de autenticação (sem tabs)
 */
export function AuthScreenWrapper({ children, ...props }: Omit<SafeScreenWrapperProps, 'withTabPadding'>) {
  return (
    <SafeScreenWrapper 
      withTabPadding={false} 
      edges={['top', 'left', 'right', 'bottom']}
      {...props}
    >
      {children}
    </SafeScreenWrapper>
  );
}

/**
 * Variação para telas modais
 */
export function ModalScreenWrapper({ children, ...props }: Omit<SafeScreenWrapperProps, 'withTabPadding' | 'edges'>) {
  return (
    <SafeScreenWrapper 
      withTabPadding={false}
      edges={['top', 'left', 'right', 'bottom']}
      backgroundColor={CORES.fundoCard}
      {...props}
    >
      {children}
    </SafeScreenWrapper>
  );
}

// ==============================================================================
// 📋 EXEMPLO DE USO NAS TELAS
// ==============================================================================

/**
 * EXEMPLO EM HomeScreen.tsx:
 * 
 * import { TabScreenWrapper } from '../components/common/SafeScreenWrapper';
 * 
 * export default function HomeScreen() {
 *   return (
 *     <TabScreenWrapper withPadding>
 *       <ScrollView>
 *         // Seu conteúdo aqui
 *       </ScrollView>
 *     </TabScreenWrapper>
 *   );
 * }
 * 
 * EXEMPLO EM LoginScreen.tsx:
 * 
 * import { AuthScreenWrapper } from '../components/common/SafeScreenWrapper';
 * 
 * export default function LoginScreen() {
 *   return (
 *     <AuthScreenWrapper>
 *       // Conteúdo da tela de login
 *     </AuthScreenWrapper>
 *   );
 * }
 */

// ==============================================================================
// 🔧 HOOKS AUXILIARES
// ==============================================================================

/**
 * Hook para obter dimensões seguras consistentes
 */
export function useSafeDimensions() {
  const insets = useSafeAreaInsets();
  
  return {
    safeTop: insets.top,
    safeBottom: insets.bottom,
    safeLeft: insets.left,
    safeRight: insets.right,
    tabHeight: Platform.OS === 'ios' ? 85 : 65,
    statusBarHeight: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 0,
  };
}

/**
 * Hook para estilos responsivos baseados na plataforma
 */
export function usePlatformStyles() {
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  
  return {
    // Sombras
    shadow: isIOS ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : {
      elevation: 4,
    },
    
    // Bordas
    borderRadius: isIOS ? 12 : 8,
    
    // Tipografia
    fontWeight: isIOS ? '600' : 'bold',
    
    // Espaçamentos
    padding: isIOS ? 16 : 14,
    margin: isIOS ? 12 : 10,
  };
}