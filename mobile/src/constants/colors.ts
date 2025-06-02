// ==============================================================================
// 🎨 SISTEMA DE CORES LOGITRACK - TEMA TRANSPORTE/LOGÍSTICA
// ==============================================================================

export const LOGITRACK_COLORS = {
    // ==============================================================================
    // 🔵 AZUIS - Confiança, Profissionalismo, Estradas
    // ==============================================================================
    primary: {
      50: '#eff6ff',   // Azul muito claro
      100: '#dbeafe',  // Azul claro
      200: '#bfdbfe',  // Azul suave
      300: '#93c5fd',  // Azul médio claro
      400: '#60a5fa',  // Azul médio
      500: '#3b82f6',  // Azul principal ✨ MARCA PRINCIPAL
      600: '#2563eb',  // Azul forte
      700: '#1d4ed8',  // Azul escuro
      800: '#1e40af',  // Azul muito escuro
      900: '#1e3a8a',  // Azul máximo
    },
  
    // ==============================================================================
    // 🟠 LARANJAS - Movimento, Energia, Ação
    // ==============================================================================
    accent: {
      50: '#fff7ed',   // Laranja muito claro
      100: '#ffedd5',  // Laranja claro
      200: '#fed7aa',  // Laranja suave
      300: '#fdba74',  // Laranja médio claro
      400: '#fb923c',  // Laranja médio
      500: '#f97316',  // Laranja principal ✨ CTA BOTÕES
      600: '#ea580c',  // Laranja forte
      700: '#c2410c',  // Laranja escuro
      800: '#9a3412',  // Laranja muito escuro
      900: '#7c2d12',  // Laranja máximo
    },
  
    // ==============================================================================
    // 🟢 VERDES - Sucesso, Entregue, Confirmação
    // ==============================================================================
    success: {
      50: '#f0fdf4',   // Verde muito claro
      100: '#dcfce7',  // Verde claro
      200: '#bbf7d0',  // Verde suave
      300: '#86efac',  // Verde médio claro
      400: '#4ade80',  // Verde médio
      500: '#22c55e',  // Verde principal ✨ SUCESSO
      600: '#16a34a',  // Verde forte
      700: '#15803d',  // Verde escuro
      800: '#166534',  // Verde muito escuro
      900: '#14532d',  // Verde máximo
    },
  
    // ==============================================================================
    // 🔴 VERMELHOS - Alertas, Problemas, Cancelar
    // ==============================================================================
    danger: {
      50: '#fef2f2',   // Vermelho muito claro
      100: '#fee2e2',  // Vermelho claro
      200: '#fecaca',  // Vermelho suave
      300: '#fca5a5',  // Vermelho médio claro
      400: '#f87171',  // Vermelho médio
      500: '#ef4444',  // Vermelho principal ✨ ALERTAS
      600: '#dc2626',  // Vermelho forte
      700: '#b91c1c',  // Vermelho escuro
      800: '#991b1b',  // Vermelho muito escuro
      900: '#7f1d1d',  // Vermelho máximo
    },
  
    // ==============================================================================
    // 🟡 AMARELOS - Avisos, Pendente, Atenção
    // ==============================================================================
    warning: {
      50: '#fefce8',   // Amarelo muito claro
      100: '#fef3c7',  // Amarelo claro
      200: '#fde68a',  // Amarelo suave
      300: '#fcd34d',  // Amarelo médio claro
      400: '#fbbf24',  // Amarelo médio
      500: '#f59e0b',  // Amarelo principal ✨ AVISOS
      600: '#d97706',  // Amarelo forte
      700: '#b45309',  // Amarelo escuro
      800: '#92400e',  // Amarelo muito escuro
      900: '#78350f',  // Amarelo máximo
    },
  
    // ==============================================================================
    // ⚫ NEUTROS - Backgrounds, Textos, Bordas
    // ==============================================================================
    neutral: {
      50: '#f9fafb',   // Quase branco
      100: '#f3f4f6',  // Cinza muito claro ✨ BACKGROUND GERAL
      200: '#e5e7eb',  // Cinza claro
      300: '#d1d5db',  // Cinza suave
      400: '#9ca3af',  // Cinza médio claro
      500: '#6b7280',  // Cinza médio ✨ TEXTO SECUNDÁRIO
      600: '#4b5563',  // Cinza forte
      700: '#374151',  // Cinza escuro ✨ TEXTO PRINCIPAL
      800: '#1f2937',  // Cinza muito escuro
      900: '#111827',  // Quase preto ✨ HEADERS
    },
  
    // ==============================================================================
    // 🎯 CORES ESPECIAIS LOGITRACK
    // ==============================================================================
    brand: {
      // Gradientes principais
      gradient: {
        primary: ['#3b82f6', '#1d4ed8'],      // Azul degradê
        accent: ['#f97316', '#ea580c'],       // Laranja degradê
        success: ['#22c55e', '#16a34a'],      // Verde degradê
        neutral: ['#6b7280', '#374151'],      // Cinza degradê
      },
      
      // Cores específicas do app
      truck: '#3b82f6',        // Cor dos caminhões
      road: '#374151',         // Cor das estradas
      package: '#f97316',      // Cor dos pacotes
      route: '#22c55e',        // Cor das rotas
      warning: '#f59e0b',      // Cor dos avisos
      urgent: '#ef4444',       // Cor urgente
    },
  
    // ==============================================================================
    // 📱 APLICAÇÕES ESPECÍFICAS
    // ==============================================================================
    app: {
      // Backgrounds
      background: '#ef4444',          // Background geral
      surface: '#ffffff',             // Cards e superfícies
      surfaceHover: '#f3f4f6',       // Hover em cards
      
      // Textos
      textPrimary: '#111827',         // Texto principal
      textSecondary: '#6b7280',       // Texto secundário
      textMuted: '#9ca3af',          // Texto discreto
      textOnPrimary: '#ffffff',       // Texto em background azul
      textOnAccent: '#ffffff',        // Texto em background laranja
      
      // Bordas
      border: '#e5e7eb',             // Bordas normais
      borderFocus: '#3b82f6',        // Bordas em foco
      borderError: '#ef4444',        // Bordas de erro
      
      // Status das OTs
      otStatus: {
        iniciada: '#f59e0b',         // Amarelo - Iniciada
        emCarregamento: '#3b82f6',   // Azul - Em carregamento
        emTransito: '#8b5cf6',       // Roxo - Em trânsito
        entregue: '#22c55e',         // Verde - Entregue
        cancelada: '#ef4444',        // Vermelho - Cancelada
      },
      
      // Shadow/Sombras
      shadow: {
        sm: 'rgba(0, 0, 0, 0.05)',
        md: 'rgba(0, 0, 0, 0.10)',
        lg: 'rgba(0, 0, 0, 0.15)',
      }
    }
  };
  
  // ==============================================================================
  // 🎨 TEMA TAILWIND PERSONALIZADO
  // ==============================================================================
  
  export const TAILWIND_THEME = {
    colors: {
      // Mapeamento para Tailwind CSS
      'primary': LOGITRACK_COLORS.primary,
      'accent': LOGITRACK_COLORS.accent,
      'success': LOGITRACK_COLORS.success,
      'danger': LOGITRACK_COLORS.danger,
      'warning': LOGITRACK_COLORS.warning,
      'neutral': LOGITRACK_COLORS.neutral,
      
      // Aliases para facilitar uso
      'brand-blue': LOGITRACK_COLORS.primary[500],
      'brand-orange': LOGITRACK_COLORS.accent[500],
      'brand-green': LOGITRACK_COLORS.success[500],
      'brand-red': LOGITRACK_COLORS.danger[500],
      'brand-yellow': LOGITRACK_COLORS.warning[500],
      'brand-gray': LOGITRACK_COLORS.neutral[500],
    }
  };
  
  // ==============================================================================
  // 🚀 EXEMPLOS DE USO
  // ==============================================================================
  
  /*
  // 📱 No React Native com Tailwind:
  
  // Botão principal
  <TouchableOpacity className="bg-primary-500 active:bg-primary-600">
    
  // Botão de ação  
  <TouchableOpacity className="bg-accent-500 active:bg-accent-600">
  
  // Card
  <View className="bg-neutral-50 border border-neutral-200">
  
  // Texto principal
  <Text className="text-neutral-900">
  
  // Texto secundário  
  <Text className="text-neutral-500">
  
  // Status entregue
  <View className="bg-success-500">
  
  // Status cancelada
  <View className="bg-danger-500">
  
  // Gradiente (implementar com LinearGradient)
  // cores: [LOGITRACK_COLORS.brand.gradient.primary[0], LOGITRACK_COLORS.brand.gradient.primary[1]]
  */
  
  // ==============================================================================
  // 💡 FILOSOFIA DA PALETA
  // ==============================================================================
  
  /*
  🎯 SIGNIFICADOS DAS CORES NO CONTEXTO LOGÍSTICO:
  
  🔵 AZUL (Primary):
  - Representa confiança e profissionalismo
  - Cor das estradas e céu
  - Transmite segurança no transporte
  - Ideal para: botões principais, headers, navegação
  
  🟠 LARANJA (Accent):  
  - Representa movimento e energia
  - Cor de sinalização e ação
  - Urgência controlada
  - Ideal para: CTAs, notificações, ações importantes
  
  🟢 VERDE (Success):
  - Representa conclusão e sucesso
  - Entrega realizada
  - Status positivos
  - Ideal para: confirmações, OTs entregues, sucessos
  
  🔴 VERMELHO (Danger):
  - Representa problemas e alertas
  - Situações que precisam atenção
  - Cancelamentos
  - Ideal para: erros, cancelamentos, urgências
  
  🟡 AMARELO (Warning):
  - Representa atenção e cuidado
  - Situações pendentes
  - Avisos importantes
  - Ideal para: pendências, avisos, em análise
  
  ⚫ NEUTRO (Gray):
  - Base profissional
  - Textos e backgrounds
  - Equilíbrio visual
  - Ideal para: textos, bordas, backgrounds
  */