# ==============================================================================
# URLs DE AUTENTICAÇÃO
# ==============================================================================

# Arquivo: backend/accounts/urls.py
# Crie este arquivo novo na pasta accounts/

from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,  # Para refresh de tokens JWT
)

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    PasswordResetView,
    PasswordResetConfirmView,
    UserListView,
    UserDetailView,
    UserActivationView,
    debug_user_info,
    debug_permissions_test,
    debug_endpoints,
    test_password_reset_token,
    debug_password_reset_tokens,
)

# ==============================================================================
# 📋 MAPEAMENTO DE URLs PARA VIEWS
# ==============================================================================

"""
🎯 ESTRUTURA DOS ENDPOINTS:

Todas as URLs começam com /api/auth/ (definido no urls.py principal)

AUTENTICAÇÃO:
- POST   /api/auth/register/           → RegisterView
- POST   /api/auth/login/              → LoginView  
- POST   /api/auth/logout/             → LogoutView
- POST   /api/auth/token/refresh/      → TokenRefreshView (do SimpleJWT)

PERFIL:
- GET    /api/auth/user/               → UserProfileView (ver perfil)
- PUT    /api/auth/user/               → UserProfileView (editar perfil)
- PATCH  /api/auth/user/               → UserProfileView (editar parcial)

GERENCIAMENTO DE USUÁRIOS:
- GET    /api/auth/users/              → UserListView (listar usuários - logística/admin)
- GET    /api/auth/users/{id}/         → UserDetailView (detalhes usuário - owner/logística/admin)
- PATCH  /api/auth/users/{id}/activate/    → UserActivationView (ativar - logística/admin)
- PATCH  /api/auth/users/{id}/deactivate/  → UserActivationView (desativar - logística/admin)

RESET DE SENHA:
- POST   /api/auth/password/reset/     → PasswordResetView (envio de email)
- POST   /api/auth/password/confirm/   → PasswordResetConfirmView (confirmar nova senha)
- GET    /api/auth/password/test-token/{token}/ → test_password_reset_token (testar token)

DEBUGGING:
- GET    /api/auth/debug/              → debug_user_info
- GET    /api/auth/debug/permissions/  → debug_permissions_test (logística/admin)
- GET    /api/auth/debug/reset-tokens/ → debug_password_reset_tokens (admin)
- GET    /api/auth/endpoints/          → debug_endpoints
"""

app_name = 'accounts'  # Namespace para as URLs

urlpatterns = [
    # ==============================================================================
    # 🔐 ENDPOINTS DE AUTENTICAÇÃO
    # ==============================================================================
    
    path(
        'register/',
        RegisterView.as_view(),
        name='register'
    ),
    
    path(
        'login/',
        LoginView.as_view(),
        name='login'
    ),
    
    path(
        'logout/',
        LogoutView.as_view(),
        name='logout'
    ),
    
    # ==============================================================================
    # 🎫 ENDPOINTS DE TOKEN JWT
    # ==============================================================================
    
    path(
        'token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),
    
    # ==============================================================================
    # 👤 ENDPOINTS DE PERFIL
    # ==============================================================================
    
    path(
        'user/',
        UserProfileView.as_view(),
        name='user_profile'
    ),
    
    # ==============================================================================
    # 🔄 ENDPOINTS DE RESET DE SENHA
    # ==============================================================================
    
    path(
        'password/reset/',
        PasswordResetView.as_view(),
        name='password_reset'
    ),
    
    path(
        'password/confirm/',
        PasswordResetConfirmView.as_view(),
        name='password_reset_confirm'
    ),
    
    # ==============================================================================
    # 👥 ENDPOINTS DE GERENCIAMENTO DE USUÁRIOS (LOGÍSTICA/ADMIN)
    # ==============================================================================
    
    path(
        'users/',
        UserListView.as_view(),
        name='user_list'
    ),
    
    path(
        'users/<int:pk>/',
        UserDetailView.as_view(),
        name='user_detail'
    ),
    
    path(
        'users/<int:pk>/activate/',
        UserActivationView.as_view(),
        {'action': 'activate'},
        name='user_activate'
    ),
    
    path(
        'users/<int:pk>/deactivate/',
        UserActivationView.as_view(),
        {'action': 'deactivate'},
        name='user_deactivate'
    ),

    # ==============================================================================
    # 🛠️ ENDPOINTS DE DEBUGGING (REMOVER EM PRODUÇÃO)
    # ==============================================================================
    
    path(
        'debug/',
        debug_user_info,
        name='debug_user_info'
    ),
    
    path(
        'debug/permissions/',
        debug_permissions_test,
        name='debug_permissions'
    ),
    
    path(
        'debug/reset-tokens/',
        debug_password_reset_tokens,
        name='debug_reset_tokens'
    ),
    
    path(
        'endpoints/',
        debug_endpoints,
        name='debug_endpoints'
    ),
]