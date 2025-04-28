# logitrack/swagger.py

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from drf_yasg.app_settings import swagger_settings

schema_view = get_schema_view(
    openapi.Info(
        title="LogiTrack API",
        default_version='v1',
        description="""
        API do sistema LogiTrack - Gerenciamento de Transporte e Logística
        
        ## Autenticação
        A API utiliza autenticação JWT (JSON Web Token). Para usar a maioria dos endpoints, você precisa:
        
        1. Obter um token de acesso (login ou registro)
        2. Incluir o token nas requisições através do cabeçalho `Authorization: Bearer <token>`
        
        ## Fluxo de autenticação:
        1. Faça login em `/api/auth/token/` ou `/api/auth/login/`
        2. Use o token recebido para acessar os endpoints protegidos
        3. Quando o token expirar, use o refresh token para obter um novo em `/api/auth/token/refresh/`
        """,
        terms_of_service="https://www.logitrack.com.br/terms/",
        contact=openapi.Contact(email="contato@logitrack.com.br"),
        license=openapi.License(name="Proprietary License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
    # patterns=[r'^api/.*$'],  # Apenas documentar URLs que começam com 'api/'
)