# ==============================================================================
# CONFIGURAÇÃO PRINCIPAL DE URLs
# ==============================================================================

# Arquivo: backend/logitrack_backend/urls.py
# SUBSTITUA COMPLETAMENTE o conteúdo do arquivo urls.py

"""
URL configuration for logitrack_backend project.

🎯 ESTRUTURA DE URLs:

- /admin/                    → Interface de administração Django
- /api/auth/                 → Endpoints de autenticação
- /media/                    → Arquivos de mídia (uploads)

Quando em produção, adicionar:
- /api/ots/                  → Endpoints de Ordens de Transporte
- /api/reports/              → Endpoints de relatórios
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

# ==============================================================================
# 🏠 VIEW RAIZ - INFORMAÇÕES DA API
# ==============================================================================

def api_root(request):
    """
    View simples para a raiz da API.
    Mostra informações básicas e links úteis.
    """
    return JsonResponse({
        'message': 'LogiTrack API - Sistema de Gerenciamento de Transporte',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'auth': '/api/auth/',
            'docs': '/api/auth/endpoints/',
        },
        'debug_endpoints': {
            'user_info': '/api/auth/debug/',
            'all_endpoints': '/api/auth/endpoints/',
        } if settings.DEBUG else None
    })

# ==============================================================================
# 🗺️ MAPEAMENTO DE URLs
# ==============================================================================

urlpatterns = [
    # Raiz da API
    path('', api_root, name='api_root'),
    
    # Interface de administração Django
    path('admin/', admin.site.urls),
    
    # URLs de autenticação
    path('api/auth/', include('accounts.urls')),
    
    # Futuras URLs (implementar nas próximas etapas)
    # path('api/ots/', include('core.urls')),  # Ordens de Transporte
    # path('api/reports/', include('reports.urls')),  # Relatórios
]

# ==============================================================================
# 📁 CONFIGURAÇÃO DE ARQUIVOS ESTÁTICOS E MEDIA
# ==============================================================================

# Servir arquivos de mídia em desenvolvimento
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
    
    # Servir arquivos estáticos em desenvolvimento
    urlpatterns += static(
        settings.STATIC_URL,
        document_root=settings.STATIC_ROOT
    )

# ==============================================================================
# 🛠️ CONFIGURAÇÃO DE DEBUG (APENAS EM DESENVOLVIMENTO)
# ==============================================================================

if settings.DEBUG:
    # Aqui você pode adicionar URLs específicas para debug
    # Por exemplo, django-debug-toolbar se estiver usando
    pass