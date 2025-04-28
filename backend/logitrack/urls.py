# logitrack/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .swagger import schema_view
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Definir os esquemas de entrada para os endpoints JWT
token_request_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['email', 'password'],
    properties={
        'email': openapi.Schema(type=openapi.TYPE_STRING, description='Email do usuário'),
        'password': openapi.Schema(type=openapi.TYPE_STRING, description='Senha do usuário'),
    }
)

token_refresh_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['refresh'],
    properties={
        'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Token de refresh'),
    }
)

# Decorar as views JWT
decorated_token_view = swagger_auto_schema(
    method='post',
    operation_description="Obtém um par de tokens JWT (access e refresh) através de credenciais",
    request_body=token_request_schema,
    responses={
        200: openapi.Response(
            description="Sucesso",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'access': openapi.Schema(type=openapi.TYPE_STRING),
                    'refresh': openapi.Schema(type=openapi.TYPE_STRING),
                }
            )
        ),
        401: "Credenciais inválidas"
    },
    tags=['Autenticação']
)(TokenObtainPairView.as_view())

decorated_refresh_view = swagger_auto_schema(
    method='post',
    operation_description="Obtém um novo access_token usando um refresh_token válido",
    request_body=token_refresh_schema,
    responses={
        200: openapi.Response(
            description="Sucesso",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'access': openapi.Schema(type=openapi.TYPE_STRING),
                }
            )
        ),
        401: "Refresh token inválido ou expirado"
    },
    tags=['Autenticação']
)(TokenRefreshView.as_view())

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # URLs de autenticação JWT
    path('api/auth/token/', decorated_token_view, name='token_obtain_pair'),
    path('api/auth/token/refresh/', decorated_refresh_view, name='token_refresh'),
    
    # Incluir as URLs da app accounts
    path('api/auth/', include('accounts.urls')),
    
    # Swagger URLs
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
]

# Configuração para servir arquivos de mídia em ambiente de desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)