// src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware de Autenticação para Next.js
 * Protege rotas que requerem autenticação
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Buscar token de autenticação nos cookies
  const token = request.cookies.get('logitrack_token')?.value;
  
  console.log('🛡️ Middleware:', {
    pathname,
    hasToken: !!token,
    token: token ? `${token.substring(0, 10)}...` : null
  });
  
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/login',
    '/register', 
    '/reset-password',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/vercel.svg',
    '/next.svg',
    '/file.svg',
    '/globe.svg',
    '/window.svg'
  ];
  
  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname === '/'
  );
  
  // Se é rota pública, permitir acesso
  if (isPublicRoute) {
    // Se está logado e tentando acessar rota de auth, redirecionar para dashboard
    if (token && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
      console.log('🔄 Middleware: Usuário logado tentando acessar rota pública, redirecionando para dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    return NextResponse.next();
  }
  
  // Para rotas protegidas, verificar autenticação
  if (!token) {
    console.log('🚫 Middleware: Acesso negado - token não encontrado, redirecionando para login');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Se tudo OK, permitir acesso
  console.log('✅ Middleware: Acesso autorizado');
  return NextResponse.next();
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Aplicar middleware a todas as rotas exceto:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};