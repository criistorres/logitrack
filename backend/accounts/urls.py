# ==============================================================================
# URLs DE AUTENTICAÇÃO - SISTEMA DE CÓDIGO
# ==============================================================================

# Arquivo: backend/accounts/urls.py
# ADICIONE as novas URLs para sistema de código
# MANTENHA todas as URLs existentes

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
    PasswordResetCodeCheckView,  # 🆕 NOVA VIEW
    UserListView,
    UserDetailView,
    UserActivationView,
    debug_user_info,
    debug_permissions_test,
    debug_endpoints,
    debug_password_reset_codes,  # 🆕 NOVA VIEW
    debug_generate_test_code,     # 🆕 NOVA VIEW
)

# ==============================================================================
# 📋 MAPEAMENTO DE URLs ATUALIZADO
# ==============================================================================

"""
🎯 ESTRUTURA ATUALIZADA DOS ENDPOINTS:

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
- GET    /api/auth/users/              → UserListView (listar usuários)
- GET    /api/auth/users/{id}/         → UserDetailView (detalhes usuário)
- PATCH  /api/auth/users/{id}/activate/    → UserActivationView (ativar)
- PATCH  /api/auth/users/{id}/deactivate/  → UserActivationView (desativar)

🔄 RESET DE SENHA - SISTEMA DE CÓDIGO:
- POST   /api/auth/password/reset/     → PasswordResetView (envio de código)
- POST   /api/auth/password/confirm/   → PasswordResetConfirmView (confirmar com código)
- POST   /api/auth/password/check-code/ → PasswordResetCodeCheckView (verificar código)
- GET    /api/auth/password/check-code/{code}/ → PasswordResetCodeCheckView (verificar código via GET)

🛠️ DEBUGGING - SISTEMA DE CÓDIGO:
- GET    /api/auth/debug/              → debug_user_info
- GET    /api/auth/debug/permissions/  → debug_permissions_test
- GET    /api/auth/debug/reset-codes/  → debug_password_reset_codes (🆕 NOVO)
- POST   /api/auth/debug/generate-code/ → debug_generate_test_code (🆕 NOVO)
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
    # 🔄 ENDPOINTS DE RESET DE SENHA - SISTEMA DE CÓDIGO
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
    
    # 🆕 NOVO: Verificar código sem consumir
    path(
        'password/check-code/',
        PasswordResetCodeCheckView.as_view(),
        name='password_check_code'
    ),
    
    # 🆕 NOVO: Verificar código via GET
    path(
        'password/check-code/<str:code>/',
        PasswordResetCodeCheckView.as_view(),
        name='password_check_code_get'
    ),
    
    # ==============================================================================
    # 👥 ENDPOINTS DE GERENCIAMENTO DE USUÁRIOS
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
    # 🛠️ ENDPOINTS DE DEBUGGING
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
    
    # 🆕 NOVO: Debug de códigos de reset
    path(
        'debug/reset-codes/',
        debug_password_reset_codes,
        name='debug_reset_codes'
    ),
    
    # 🆕 NOVO: Gerar código de teste
    path(
        'debug/generate-code/',
        debug_generate_test_code,
        name='debug_generate_code'
    ),
    
    path(
        'endpoints/',
        debug_endpoints,
        name='debug_endpoints'
    ),
]

# ==============================================================================
# 📝 DOCUMENTAÇÃO DOS NOVOS ENDPOINTS
# ==============================================================================

"""
🎯 NOVOS ENDPOINTS ADICIONADOS:

1. **POST /api/auth/password/check-code/**
   - Verifica se código está válido (sem consumir)
   - Body: {"code": "123456"}
   - Retorna: validity, tempo restante, tentativas usadas

2. **GET /api/auth/password/check-code/{code}/**
   - Mesma funcionalidade via GET
   - Ex: GET /api/auth/password/check-code/123456/

3. **GET /api/auth/debug/reset-codes/** (Admin only)
   - Lista todos os códigos de reset ativos
   - Útil para debugging
   - Mostra: usuário, código, expiração, tentativas

4. **POST /api/auth/debug/generate-code/** (Admin only)  
   - Gera código de teste para usuário específico
   - Body: {"email": "user@test.com"}
   - Retorna o código gerado (apenas em debug)

🔧 COMO TESTAR:

1. **Fluxo completo:**
   POST /api/auth/password/reset/ {"email": "user@test.com"}
   → Email enviado com código
   POST /api/auth/password/confirm/ {"code": "123456", "new_password": "nova123", "confirm_password": "nova123"}

2. **Verificar código:**
   POST /api/auth/password/check-code/ {"code": "123456"}
   → Retorna se código é válido

3. **Debug (admin):**
   GET /api/auth/debug/reset-codes/
   → Lista todos os códigos ativos

🚨 IMPORTANTE:
- Os endpoints antigos continuam funcionando
- O sistema é retrocompatível
- Códigos expiram em 30 minutos
- Máximo 3 tentativas por código
"""