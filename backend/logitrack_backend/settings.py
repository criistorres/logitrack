# ==============================================================================
# CONFIGURAÇÃO DO SETTINGS.PY
# ==============================================================================

# Arquivo: backend/logitrack_backend/settings.py
# Substitua completamente o conteúdo do arquivo settings.py pelo código abaixo:

"""
Configurações do Django para o projeto LogiTrack.

Gerado pelo Django 4.2.x
Para mais informações sobre este arquivo, veja:
https://docs.djangoproject.com/en/4.2/topics/settings/

Para a lista completa de configurações e seus valores, veja:
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from pathlib import Path
from datetime import timedelta
from decouple import config
import os

# Diretório base do projeto
BASE_DIR = Path(__file__).resolve().parent.parent

# ==============================================================================
# CONFIGURAÇÕES DE SEGURANÇA
# ==============================================================================

# ATENÇÃO: Mantenha esta chave secreta em produção!
# Em produção, mova para o arquivo .env
SECRET_KEY = config('SECRET_KEY', default='django-insecure-sua-chave-aqui-development-only')

# ATENÇÃO: Não usar True em produção!
DEBUG = config('DEBUG', default=True, cast=bool)

# Hosts permitidos - adicionar domínio em produção
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])

# ==============================================================================
# APLICAÇÕES DJANGO
# ==============================================================================

# Aplicações Django padrão
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

# Aplicações de terceiros
THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]

# Nossas aplicações
LOCAL_APPS = [
    'accounts',  # Gerenciamento de usuários
    'core',      # Funcionalidades principais (OTs, NFs, etc.)
]

# Lista completa de aplicações instaladas
INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ==============================================================================
# MIDDLEWARE
# ==============================================================================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # CORS deve ser o primeiro
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ==============================================================================
# CONFIGURAÇÕES DE URL
# ==============================================================================

ROOT_URLCONF = 'logitrack_backend.urls'

# ==============================================================================
# CONFIGURAÇÕES DE TEMPLATES
# ==============================================================================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  # Diretório para templates customizados
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ==============================================================================
# CONFIGURAÇÕES WSGI/ASGI
# ==============================================================================

WSGI_APPLICATION = 'logitrack_backend.wsgi.application'

# ==============================================================================
# CONFIGURAÇÕES DO BANCO DE DADOS
# ==============================================================================

# Banco de dados SQLite para desenvolvimento
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Para produção com PostgreSQL (descomente e configure):
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': config('DB_NAME'),
#         'USER': config('DB_USER'),
#         'PASSWORD': config('DB_PASSWORD'),
#         'HOST': config('DB_HOST', default='localhost'),
#         'PORT': config('DB_PORT', default='5432'),
#     }
# }

# ==============================================================================
# CONFIGURAÇÕES DE VALIDAÇÃO DE SENHA
# ==============================================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ==============================================================================
# CONFIGURAÇÕES DE INTERNACIONALIZAÇÃO
# ==============================================================================

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

# ==============================================================================
# CONFIGURAÇÕES DE ARQUIVOS ESTÁTICOS E MEDIA
# ==============================================================================

# Arquivos estáticos (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Arquivos de media (uploads de usuários)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ==============================================================================
# CONFIGURAÇÕES DO DJANGO REST FRAMEWORK
# ==============================================================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',  # Para o admin
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# ==============================================================================
# CONFIGURAÇÕES JWT (JSON Web Token)
# ==============================================================================

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),      # Token de acesso válido por 1 hora
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),      # Token de refresh válido por 7 dias
    'ROTATE_REFRESH_TOKENS': True,                    # Gerar novo refresh token a cada uso
    'BLACKLIST_AFTER_ROTATION': True,                 # Blacklist do token antigo após rotação
    'UPDATE_LAST_LOGIN': True,                        # Atualizar último login

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',

    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(hours=1),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=7),
}

# ==============================================================================
# CONFIGURAÇÕES CORS (Cross-Origin Resource Sharing)
# ==============================================================================

# Permitir requisições do frontend durante desenvolvimento
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",    # React.js (frontend web)
    "http://127.0.0.1:3000",   # React.js alternativo
    "http://localhost:8081",   # React Native (Expo)
    "http://127.0.0.1:8081",   # React Native alternativo
]

# Para desenvolvimento - permite qualquer origem (REMOVER EM PRODUÇÃO!)
CORS_ALLOW_ALL_ORIGINS = DEBUG

# Headers permitidos
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# ==============================================================================
# CONFIGURAÇÕES DE USUÁRIO PERSONALIZADO
# ==============================================================================

# Usar nosso modelo de usuário personalizado
AUTH_USER_MODEL = 'accounts.CustomUser'

# ==============================================================================
# CONFIGURAÇÕES DE LOGGING
# ==============================================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'logitrack_backend': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# ==============================================================================
# CONFIGURAÇÕES ADICIONAIS DO DJANGO
# ==============================================================================

# Tipo de campo de chave primária padrão
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configurações de email (para redefinição de senha)
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # Para desenvolvimento
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'    # Para produção

# Configurações de sessão
SESSION_COOKIE_AGE = 3600  # 1 hora
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# Configurações de segurança (para produção)
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_REDIRECT_EXEMPT = []
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True