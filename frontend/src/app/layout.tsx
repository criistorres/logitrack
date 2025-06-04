// src/app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LogiTrack - Sistema de Gerenciamento de Transporte',
  description: 'Plataforma profissional para gerenciamento de operações de transporte e logística',
  keywords: 'logística, transporte, gerenciamento, rastreamento, otimização',
  authors: [{ name: 'LogiTrack Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

/**
 * Layout Principal da Aplicação LogiTrack
 * 
 * 🎯 Responsabilidades:
 * - Configurar providers globais (AuthProvider)
 * - Aplicar estilos globais
 * - Configurar metadados SEO
 * - Estrutura HTML base
 */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Meta tags adicionais para PWA futuro */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LogiTrack" />
        
        {/* Preconnect para performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        {/* 
          🔐 AuthProvider: 
          - Gerencia estado global de autenticação
          - Fornece hooks useAuth() para toda aplicação
          - Controla redirecionamentos automáticos
        */}
        <AuthProvider>
          {children}
        </AuthProvider>
        
        {/* Scripts de desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                console.log('🚀 LogiTrack Frontend carregado em modo desenvolvimento');
                console.log('🔗 API Base URL: ${process.env.NODE_ENV === 'development' ? 'http://192.168.0.12:8000/api' : 'produção'}');
              `,
            }}
          />
        )}
      </body>
    </html>
  )
}