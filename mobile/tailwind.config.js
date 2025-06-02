// ==============================================================================
// 🎨 TAILWIND CONFIG LOGITRACK - PALETA PERSONALIZADA
// ==============================================================================

// Arquivo: mobile/tailwind.config.js
// SUBSTITUA o conteúdo atual por esta configuração personalizada

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // ==============================================================================
      // 🎨 PALETA DE CORES LOGITRACK
      // ==============================================================================
      colors: {
        // 🔵 AZUIS - Confiança, Profissionalismo (Cor Principal)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // ✨ COR PRINCIPAL DA MARCA
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6', // Alias para usar apenas 'primary'
        },

        // 🟠 LARANJAS - Movimento, Energia, Ação (Cor de Destaque)
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',  // ✨ COR DE AÇÃO/CTA
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          DEFAULT: '#f97316',
        },

        // 🟢 VERDES - Sucesso, Entregue, Confirmação
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // ✨ COR DE SUCESSO
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          DEFAULT: '#22c55e',
        },

        // 🔴 VERMELHOS - Alertas, Problemas, Cancelar
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',  // ✨ COR DE ERRO/ALERTA
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          DEFAULT: '#ef4444',
        },

        // 🟡 AMARELOS - Avisos, Pendente, Atenção
        warning: {
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // ✨ COR DE AVISO
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#f59e0b',
        },

        // ⚫ NEUTROS - Backgrounds, Textos, Bordas
        neutral: {
          50: '#f9fafb',   // Background geral
          100: '#f3f4f6',  // Surfaces suaves
          200: '#e5e7eb',  // Bordas claras
          300: '#d1d5db',  // Divisores
          400: '#9ca3af',  // Placeholders
          500: '#6b7280',  // Texto secundário
          600: '#4b5563',  // Texto normal
          700: '#374151',  // Texto principal
          800: '#1f2937',  // Texto escuro
          900: '#111827',  // Texto máximo
          DEFAULT: '#6b7280',
        },

        // ==============================================================================
        // 🎯 CORES ESPECÍFICAS LOGITRACK
        // ==============================================================================

        // Status das OTs
        'ot-iniciada': '#f59e0b',      // Amarelo
        'ot-carregamento': '#3b82f6',  // Azul
        'ot-transito': '#8b5cf6',      // Roxo
        'ot-entregue': '#22c55e',      // Verde
        'ot-cancelada': '#ef4444',     // Vermelho

        // Elementos da marca
        'brand-truck': '#3b82f6',      // Cor dos caminhões
        'brand-road': '#374151',       // Cor das estradas
        'brand-package': '#f97316',    // Cor dos pacotes
        'brand-route': '#22c55e',      // Cor das rotas

        // Backgrounds especiais
        'app-background': '#f9fafb',   // Background geral do app
        'surface': '#ffffff',          // Superfícies (cards)
        'surface-hover': '#f3f4f6',    // Hover em superfícies
      },

      // ==============================================================================
      // 📐 ESPAÇAMENTOS PERSONALIZADOS
      // ==============================================================================
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '128': '32rem',   // 512px
      },

      // ==============================================================================
      // 📝 TIPOGRAFIA PERSONALIZADA
      // ==============================================================================
      fontFamily: {
        'logitrack': ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
      },

      // ==============================================================================
      // 🌟 SOMBRAS PERSONALIZADAS
      // ==============================================================================
      boxShadow: {
        'logitrack-sm': '0 1px 2px 0 rgba(59, 130, 246, 0.05)',
        'logitrack-md': '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
        'logitrack-lg': '0 10px 15px -3px rgba(59, 130, 246, 0.1)',
        'logitrack-xl': '0 20px 25px -5px rgba(59, 130, 246, 0.1)',
        
        // Sombras coloridas para elementos específicos
        'primary': '0 4px 14px 0 rgba(59, 130, 246, 0.3)',
        'accent': '0 4px 14px 0 rgba(249, 115, 22, 0.3)',
        'success': '0 4px 14px 0 rgba(34, 197, 94, 0.3)',
        'danger': '0 4px 14px 0 rgba(239, 68, 68, 0.3)',
        'warning': '0 4px 14px 0 rgba(245, 158, 11, 0.3)',
      },

      // ==============================================================================
      // 🔘 BORDER RADIUS PERSONALIZADOS
      // ==============================================================================
      borderRadius: {
        'logitrack': '0.75rem',        // 12px - padrão LogiTrack
        'logitrack-lg': '1rem',        // 16px
        'logitrack-xl': '1.5rem',      // 24px
        'logitrack-2xl': '2rem',       // 32px
      },

      // ==============================================================================
      // 🎭 GRADIENTES PERSONALIZADOS
      // ==============================================================================
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        'gradient-accent': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        'gradient-success': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'gradient-logitrack': 'linear-gradient(135deg, #3b82f6 0%, #f97316 100%)',
        'gradient-surface': 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
      },

      // ==============================================================================
      // ⚡ ANIMAÇÕES PERSONALIZADAS
      // ==============================================================================
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' },
        },
      },
    },
  },
  plugins: [],
}

// ==============================================================================
// 🎯 EXEMPLOS DE USO DAS CORES PERSONALIZADAS
// ==============================================================================

/*
📱 EXEMPLOS DE CLASSES TAILWIND COM AS NOVAS CORES:

// Cores principais
className="bg-primary-500 text-white"           // Botão principal azul
className="bg-accent-500 text-white"            // Botão de ação laranja
className="bg-success-500 text-white"           // Botão de sucesso verde
className="bg-danger-500 text-white"            // Botão de erro vermelho
className="bg-warning-500 text-white"           // Botão de aviso amarelo

// Texto com cores da marca
className="text-primary-600"                    // Texto azul
className="text-neutral-700"                    // Texto principal
className="text-neutral-500"                    // Texto secundário

// Backgrounds e superfícies
className="bg-neutral-50"                       // Background geral
className="bg-surface"                          // Cards brancos
className="bg-surface-hover"                    // Hover em cards

// Status das OTs
className="bg-ot-iniciada"                      // Status iniciada (amarelo)
className="bg-ot-entregue"                      // Status entregue (verde)
className="bg-ot-cancelada"                     // Status cancelada (vermelho)

// Bordas
className="border-primary-200"                  // Borda azul clara
className="border-neutral-200"                  // Borda neutra

// Sombras personalizadas
className="shadow-primary"                      // Sombra azul
className="shadow-logitrack-lg"                 // Sombra LogiTrack

// Gradientes
className="bg-gradient-primary"                 // Gradiente azul
className="bg-gradient-logitrack"               // Gradiente marca (azul→laranja)

// Animações
className="animate-fade-in"                     // Fade in suave
className="animate-slide-up"                    // Slide para cima
className="animate-scale-in"                    // Scale in
*/