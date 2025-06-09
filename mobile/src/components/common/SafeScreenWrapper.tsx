// mobile/src/components/common/SafeScreenWrapper.tsx
// COMPONENTE BASE PARA TODAS AS TELAS - VERSÃO TAILWIND CSS

import React from 'react';
import { View, Platform, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
  className?: string;
}

// ==============================================================================
// 🛡️ COMPONENTE WRAPPER UNIVERSAL COM TAILWIND
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
 * ✅ Usa Tailwind CSS para estilos
 * 
 * 🎯 Uso:
 * <SafeScreenWrapper withTabPadding>
 *   <YourScreenContent />
 * </SafeScreenWrapper>
 */
export default function SafeScreenWrapper({
  children,
  backgroundColor = 'bg-gray-50',
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor,
  withPadding = false,
  withTabPadding = true,
  edges = ['top', 'left', 'right'],
  className = '',
}: SafeScreenWrapperProps) {
  
  const insets = useSafeAreaInsets();
  
  // ==============================================================================
  // 📐 CÁLCULOS DE ESPAÇAMENTO RESPONSIVOS
  // ==============================================================================
  
  // Altura da tab bar (baseada no App.tsx funcionando)
  const TAB_HEIGHT = Platform.OS === 'ios' ? 85 : 65;
  
  // Classes Tailwind para padding
  const paddingClasses = withPadding ? 'px-4' : '';
  const tabPaddingStyle = withTabPadding ? { paddingBottom: TAB_HEIGHT } : {};
  
  // ==============================================================================
  // 🎨 CONFIGURAÇÃO DA STATUS BAR
  // ==============================================================================
  
  const statusBarBg = statusBarBackgroundColor || '#F9FAFB';
  
  return (
    <>
      {/* ===== STATUS BAR CONFIGURAÇÃO ===== */}
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={Platform.OS === 'android' ? statusBarBg : undefined}
        translucent={false}
      />
      
      {/* ===== SAFE AREA VIEW COM TAILWIND ===== */}
      <SafeAreaView
        className={`flex-1 ${backgroundColor}`}
        edges={edges}
      >
        {/* ===== CONTAINER PRINCIPAL ===== */}
        <View
          className={`flex-1 ${backgroundColor} ${paddingClasses} ${className}`}
          style={tabPaddingStyle}
        >
          {children}
        </View>
      </SafeAreaView>
    </>
  );
}

// ==============================================================================
// 🎯 VARIAÇÕES PRÉ-CONFIGURADAS COM TAILWIND
// ==============================================================================

/**
 * Variação para telas com tabs (padrão)
 */
export function TabScreenWrapper({ 
  children, 
  className = '',
  ...props 
}: Omit<SafeScreenWrapperProps, 'withTabPadding'>) {
  return (
    <SafeScreenWrapper 
      withTabPadding={true} 
      className={className}
      {...props}
    >
      {children}
    </SafeScreenWrapper>
  );
}

/**
 * Variação para telas de autenticação (sem tabs)
 */
export function AuthScreenWrapper({ 
  children, 
  className = '',
  ...props 
}: Omit<SafeScreenWrapperProps, 'withTabPadding'>) {
  return (
    <SafeScreenWrapper 
      withTabPadding={false} 
      edges={['top', 'left', 'right', 'bottom']}
      backgroundColor="bg-white"
      className={className}
      {...props}
    >
      {children}
    </SafeScreenWrapper>
  );
}

/**
 * Variação para telas modais
 */
export function ModalScreenWrapper({ 
  children, 
  className = '',
  ...props 
}: Omit<SafeScreenWrapperProps, 'withTabPadding' | 'edges'>) {
  return (
    <SafeScreenWrapper 
      withTabPadding={false}
      edges={['top', 'left', 'right', 'bottom']}
      backgroundColor="bg-white"
      className={className}
      {...props}
    >
      {children}
    </SafeScreenWrapper>
  );
}

// ==============================================================================
// 🔧 HOOKS AUXILIARES PARA DIMENSÕES
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
 * Hook para classes Tailwind baseadas na plataforma
 */
export function usePlatformClasses() {
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  
  return {
    // Sombras
    shadow: isIOS ? 'shadow-lg' : 'elevation-4',
    
    // Bordas
    borderRadius: isIOS ? 'rounded-xl' : 'rounded-lg',
    
    // Espaçamentos
    padding: isIOS ? 'p-4' : 'p-3',
    margin: isIOS ? 'm-3' : 'm-2',
    
    // Classes específicas de plataforma
    platform: {
      ios: isIOS,
      android: isAndroid,
    }
  };
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
 *     <TabScreenWrapper withPadding className="bg-gray-50">
 *       <ScrollView className="flex-1">
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
 *     <AuthScreenWrapper className="bg-primary-50">
 *       // Conteúdo da tela de login
 *     </AuthScreenWrapper>
 *   );
 * }
 */

// ==============================================================================
// ✅ CLASSES TAILWIND DISPONÍVEIS
// ==============================================================================

/**
 * 🎨 CLASSES TAILWIND PERSONALIZADAS LOGITRAK:
 * 
 * CORES PRINCIPAIS:
 * - bg-primary-500, text-primary-500 (Azul LogiTrack)
 * - bg-accent-500, text-accent-500 (Laranja)
 * - bg-success-500, text-success-500 (Verde)
 * - bg-danger-500, text-danger-500 (Vermelho)
 * - bg-warning-500, text-warning-500 (Amarelo)
 * 
 * BACKGROUNDS:
 * - bg-app-background (Fundo geral #f9fafb)
 * - bg-surface (Cards brancos)
 * - bg-surface-hover (Hover em cards)
 * 
 * STATUS OTS:
 * - bg-ot-iniciada (Amarelo)
 * - bg-ot-carregamento (Azul)
 * - bg-ot-transito (Roxo)
 * - bg-ot-entregue (Verde)
 * - bg-ot-cancelada (Vermelho)
 * 
 * SOMBRAS E ELEVAÇÕES:
 * - shadow-primary (Sombra azul)
 * - shadow-logitrack-lg (Sombra personalizada)
 * 
 * 🎯 RESULTADO: Todas as telas terão estilos consistentes
 * e nunca mais problemas com tab bar sobrepondo conteúdo!
 */