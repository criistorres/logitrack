# ==============================================================================
# VIEWS DE AUTENTICAÇÃO - GUIA COMPLETO COM EXPLICAÇÕES
# ==============================================================================

# Arquivo: backend/accounts/views.py
# SUBSTITUA COMPLETAMENTE o conteúdo do arquivo accounts/views.py


from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.http import Http404
import logging

from .models import CustomUser
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer,
    UserActivationSerializer,
    UserListSerializer,
    debug_serializer_flow  # Nossa função helper
)
from .permissions import (
    IsLogisticaOrAdmin,
    IsOwnerOrLogisticaOrAdmin,
    IsAdminOnly,
    IsSelfOrLogisticaOrAdmin,
    debug_user_permissions
)

# Configurar logger
logger = logging.getLogger(__name__)

# ==============================================================================
# 📚 EXPLICAÇÃO: COMO AS VIEWS FUNCIONAM COM SERIALIZERS
# ==============================================================================

"""
🎯 FLUXO VIEW + SERIALIZER:

1. Cliente faz requisição HTTP (POST /api/auth/register/)
2. Django roteia para nossa View
3. View.post() é chamado com request
4. View cria Serializer com os dados: serializer = UserRegistrationSerializer(data=request.data)
5. View chama serializer.is_valid() ← AQUI ENTRAM OS VALIDATES DO SERIALIZER
6. Se válido, View chama serializer.save() ← AQUI ENTRA O CREATE/UPDATE DO SERIALIZER
7. View retorna Response

🐛 ONDE COLOCAR BREAKPOINTS:
- Início de cada método da view (linha 1 do método)
- Antes de criar o serializer
- Antes de chamar is_valid()
- Antes de chamar save()
- Nos métodos do serializer (validate_*, create, update)
"""

# ==============================================================================
# 📝 VIEW DE REGISTRO - EXPLICAÇÃO PASSO A PASSO
# ==============================================================================

class RegisterView(APIView):
    """
    🎯 PROPÓSITO: Registrar novos usuários
    
    📋 FLUXO DESTA VIEW:
    1. Recebe dados JSON no request.data
    2. Cria UserRegistrationSerializer com esses dados
    3. Chama is_valid() → dispara validates do serializer
    4. Se válido, chama save() → dispara create() do serializer
    5. Gera tokens JWT
    6. Retorna resposta com dados do usuário e tokens
    
    🐛 DEBUGGING STEP-BY-STEP:
    1. Coloque breakpoint na linha: print("🎯 REGISTER VIEW: Iniciando registro")
    2. Coloque breakpoint na linha: serializer = UserRegistrationSerializer(data=request.data)
    3. Coloque breakpoint na linha: if serializer.is_valid():
    4. Faça requisição POST para /api/auth/register/
    5. Siga o fluxo passo a passo
    """
    
    permission_classes = [permissions.AllowAny]  # Qualquer um pode se registrar

    def post(self, request):
        """
        Endpoint: POST /api/auth/register/
        
        Body JSON esperado:
        {
            "email": "usuario@example.com",
            "password": "minhasenha123",
            "password_confirm": "minhasenha123",
            "first_name": "João",
            "last_name": "Silva",
            "cpf": "12345678901",
            "phone": "11999999999",
            "role": "motorista"
        }
        """
        
        # 🐛 BREAKPOINT 1: Início da view
        print("🎯 REGISTER VIEW: Iniciando registro")
        print(f"🎯 Dados recebidos: {request.data}")
        print(f"🎯 Método HTTP: {request.method}")
        print(f"🎯 Content-Type: {request.content_type}")
        
        logger.info(f"Tentativa de registro para: {request.data.get('email')}")
        
        # 🐛 BREAKPOINT 2: Criação do serializer
        print("🎯 Criando UserRegistrationSerializer...")
        serializer = UserRegistrationSerializer(data=request.data)
        
        # Debug do estado inicial do serializer
        debug_serializer_flow(serializer, "Serializer recém-criado")
        
        # 🐛 BREAKPOINT 3: Validação (AQUI ENTRA NOS MÉTODOS VALIDATE DO SERIALIZER!)
        print("🎯 Chamando serializer.is_valid()...")
        print("   ↳ Isso vai chamar os métodos validate_* do serializer")
        
        if serializer.is_valid():
            print("✅ Dados válidos! Prosseguindo...")
            debug_serializer_flow(serializer, "Após validação bem-sucedida")
            
            # 🐛 BREAKPOINT 4: Salvando (AQUI ENTRA NO CREATE DO SERIALIZER!)
            print("🎯 Chamando serializer.save()...")
            print("   ↳ Isso vai chamar o método create() do serializer")
            
            user = serializer.save()
            
            print(f"✅ Usuário criado: {user.email} (ID: {user.id})")
            
            # 🎯 Gerar tokens JWT
            print("🎯 Gerando tokens JWT...")
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            print(f"✅ Tokens gerados")
            print(f"   ↳ Access token: {str(access_token)[:20]}...")
            print(f"   ↳ Refresh token: {str(refresh)[:20]}...")
            
            # 🎯 Preparar resposta
            response_data = {
                'success': True,
                'message': 'Usuário registrado com sucesso',
                'data': {
                    'user': UserProfileSerializer(user).data,
                    'tokens': {
                        'access': str(access_token),
                        'refresh': str(refresh)
                    }
                }
            }
            
            print("✅ Registro concluído com sucesso!")
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        else:
            # 🐛 BREAKPOINT 5: Erros de validação
            print("❌ Dados inválidos!")
            print(f"❌ Erros: {serializer.errors}")
            debug_serializer_flow(serializer, "Após validação com erros")
            
            return Response({
                'success': False,
                'message': 'Dados inválidos',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


# ==============================================================================
# 🔐 VIEW DE LOGIN - EXPLICAÇÃO PASSO A PASSO
# ==============================================================================

class LoginView(APIView):
    """
    🎯 PROPÓSITO: Autenticar usuário e retornar tokens JWT
    
    🐛 DEBUGGING:
    1. Coloque breakpoint na linha: print("🎯 LOGIN VIEW: Iniciando login")
    2. Coloque breakpoint na linha: if serializer.is_valid():
    3. Observe como o serializer.validated_data['user'] é populado
    """
    
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """
        Endpoint: POST /api/auth/login/
        
        Body JSON esperado:
        {
            "email": "usuario@example.com",
            "password": "minhasenha123"
        }
        """
        
        # 🐛 BREAKPOINT 1: Início do login
        print("🎯 LOGIN VIEW: Iniciando login")
        print(f"🎯 Email tentativa: {request.data.get('email')}")
        print(f"🎯 Senha fornecida: {'*' * len(request.data.get('password', ''))}")
        
        logger.info(f"Tentativa de login: {request.data.get('email')}")
        
        # 🐛 BREAKPOINT 2: Criação do serializer
        serializer = UserLoginSerializer(
            data=request.data,
            context={'request': request}  # Contexto para o authenticate()
        )
        
        # 🐛 BREAKPOINT 3: Validação (AQUI ENTRA NO VALIDATE DO LOGIN SERIALIZER!)
        print("🎯 Validando credenciais...")
        
        if serializer.is_valid():
            # O serializer já fez authenticate() e colocou o user nos validated_data
            user = serializer.validated_data['user']
            print(f"✅ Login válido para: {user.email}")
            
            # Gerar tokens JWT
            refresh = RefreshToken.for_user(user)
            
            # Atualizar último login
            user.save(update_fields=['last_login'])
            
            return Response({
                'success': True,
                'message': 'Login realizado com sucesso',
                'data': {
                    'user': UserProfileSerializer(user).data,
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh)
                    }
                }
            }, status=status.HTTP_200_OK)
        
        else:
            print("❌ Credenciais inválidas")
            print(f"❌ Erros: {serializer.errors}")
            
            return Response({
                'success': False,
                'message': 'Credenciais inválidas',
                'errors': serializer.errors
            }, status=status.HTTP_401_UNAUTHORIZED)


# ==============================================================================
# 🚪 VIEW DE LOGOUT
# ==============================================================================

class LogoutView(APIView):
    """
    🎯 PROPÓSITO: Fazer logout adicionando refresh token à blacklist
    
    🐛 DEBUGGING: Coloque breakpoint no início para ver o processo
    """
    
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Endpoint: POST /api/auth/logout/
        Header: Authorization: Bearer <access_token>
        
        Body JSON esperado:
        {
            "refresh": "refresh_token_aqui"
        }
        """
        
        print("🎯 LOGOUT VIEW: Fazendo logout")
        print(f"🎯 Usuário: {request.user.email}")
        
        try:
            refresh_token = request.data.get('refresh')
            
            if refresh_token:
                print(f"🎯 Adicionando token à blacklist...")
                token = RefreshToken(refresh_token)
                token.blacklist()
                print(f"✅ Token adicionado à blacklist")
                
                return Response({
                    'success': True,
                    'message': 'Logout realizado com sucesso'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': 'Refresh token é obrigatório'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"❌ Erro no logout: {e}")
            return Response({
                'success': False,
                'message': 'Erro interno do servidor'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==============================================================================
# 👤 VIEW DE PERFIL DO USUÁRIO
# ==============================================================================

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    🎯 PROPÓSITO: Ver e editar perfil do usuário logado
    
    Esta view herda de generics.RetrieveUpdateAPIView, que significa:
    - GET: RetrieveAPIView → retorna dados do objeto
    - PUT/PATCH: UpdateAPIView → atualiza dados do objeto
    
    🐛 DEBUGGING:
    1. Coloque breakpoint em get_object()
    2. Coloque breakpoint em update() se quiser ver edições
    """
    
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """
        Define qual objeto será usado (o usuário logado).
        
        🐛 BREAKPOINT: Coloque aqui para ver qual usuário está logado
        """
        print(f"🎯 PROFILE VIEW: get_object() para {self.request.user.email}")
        return self.request.user

    def get(self, request, *args, **kwargs):
        """
        GET /api/auth/user/
        Retorna dados do usuário logado.
        """
        print(f"🎯 PROFILE VIEW: GET para {request.user.email}")
        
        user = self.get_object()
        serializer = self.get_serializer(user)
        
        return Response({
            'success': True,
            'message': 'Dados do usuário recuperados',
            'data': serializer.data
        })

    def update(self, request, *args, **kwargs):
        """
        PUT/PATCH /api/auth/user/
        Atualiza dados do usuário logado.
        
        🐛 BREAKPOINT: Coloque aqui para ver atualizações
        """
        print(f"🎯 PROFILE VIEW: UPDATE para {request.user.email}")
        print(f"🎯 Novos dados: {request.data}")
        
        # Chama o método update da classe pai
        response = super().update(request, *args, **kwargs)
        
        # Personalizar resposta
        if response.status_code == 200:
            return Response({
                'success': True,
                'message': 'Perfil atualizado com sucesso',
                'data': response.data
            })
        
        return response


# ==============================================================================
# 🔄 VIEWS DE RESET DE SENHA
# ==============================================================================


class PasswordResetView(APIView):
    """
    🎯 PROPÓSITO: Solicitar redefinição de senha com envio de email REAL
    
    🐛 DEBUGGING:
    1. Coloque breakpoint na linha: print("🎯 PASSWORD RESET: Solicitação de reset")
    2. Acompanhe geração de token e envio de email
    3. Observe logs detalhados no console
    """
    
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """
        POST /api/auth/password/reset/
        
        Body: {"email": "usuario@example.com"}
        
        🔒 SEGURANÇA:
        - Sempre retorna sucesso por segurança (não revela se email existe)
        - Gera tokens criptograficamente seguros
        - Limita tentativas por IP
        - Expira tokens em 24 horas
        """
        print("🎯 PASSWORD RESET: Solicitação de reset")
        print(f"🎯 Email solicitado: {request.data.get('email')}")
        
        # Obter IP da requisição para logging
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        print(f"🎯 IP da solicitação: {ip_address}")
        
        # TODO: Implementar rate limiting por IP aqui
        # Verificar se IP não está fazendo muitas solicitações
        
        serializer = PasswordResetSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            print(f"🎯 Dados válidos, processando reset...")
            
            # Tentar enviar email (o serializer faz tudo)
            try:
                email_sent = serializer.save()
                
                if email_sent:
                    print(f"✅ Email de reset enviado com sucesso")
                    message = "Se o email existir em nossa base, um link de redefinição foi enviado."
                else:
                    print(f"❌ Falha no envio do email")
                    message = "Ocorreu um erro ao enviar o email. Tente novamente em alguns minutos."
                
                # SEMPRE retorna sucesso por segurança (não revela se email existe)
                return Response({
                    'success': True,
                    'message': message,
                    'details': {
                        'email_sent': email_sent,
                        'ip_address': ip_address if settings.DEBUG else None,
                        'timestamp': timezone.now().isoformat(),
                    }
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                print(f"❌ Erro inesperado no reset: {e}")
                logger.error(f"Erro no reset de senha: {e}")
                
                return Response({
                    'success': True,  # Ainda retorna sucesso por segurança
                    'message': 'Se o email existir em nossa base, um link de redefinição será enviado.',
                    'details': {
                        'email_sent': False,
                        'error': str(e) if settings.DEBUG else None,
                    }
                }, status=status.HTTP_200_OK)
        
        print(f"❌ Dados inválidos: {serializer.errors}")
        return Response({
            'success': False,
            'message': 'Email inválido',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    🎯 PROPÓSITO: Confirmar nova senha usando token seguro
    
    🐛 DEBUGGING:
    1. Coloque breakpoint na linha: print("🎯 PASSWORD RESET CONFIRM")
    2. Observe validação de token
    3. Acompanhe mudança de senha
    """
    
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """
        POST /api/auth/password/confirm/
        
        Body: {
            "token": "token_seguro_aqui",
            "new_password": "novaSenha123",
            "confirm_password": "novaSenha123"
        }
        """
        print("🎯 PASSWORD RESET CONFIRM: Confirmando nova senha")
        print(f"🎯 Token recebido: {request.data.get('token', '')[:10]}...")
        
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            print(f"🎯 Dados válidos, alterando senha...")
            
            try:
                # Salvar nova senha (o serializer faz tudo)
                user = serializer.save()
                
                print(f"✅ Senha alterada com sucesso para: {user.email}")
                
                return Response({
                    'success': True,
                    'message': 'Senha redefinida com sucesso',
                    'data': {
                        'user_email': user.email,
                        'changed_at': timezone.now().isoformat(),
                    }
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                print(f"❌ Erro ao salvar senha: {e}")
                logger.error(f"Erro ao confirmar reset de senha: {e}")
                
                return Response({
                    'success': False,
                    'message': 'Erro interno do servidor',
                    'errors': {'internal': ['Erro ao processar solicitação']}
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        print(f"❌ Erro na validação: {serializer.errors}")
        
        # Verificar tipo de erro para resposta mais específica
        errors = serializer.errors
        if 'token' in errors:
            message = 'Token inválido, expirado ou já usado'
            status_code = status.HTTP_400_BAD_REQUEST
        elif 'new_password' in errors:
            message = 'Senha não atende aos critérios de segurança'
            status_code = status.HTTP_400_BAD_REQUEST
        else:
            message = 'Dados inválidos'
            status_code = status.HTTP_400_BAD_REQUEST
        
        return Response({
            'success': False,
            'message': message,
            'errors': errors
        }, status=status_code)


# ==============================================================================
# VIEWS AUXILIARES PARA RESET DE SENHA
# ==============================================================================

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def test_password_reset_token(request, token):
    """
    🎯 ENDPOINT PARA TESTAR TOKEN DE RESET: Verificar se token é válido
    
    GET /api/auth/password/test-token/{token}/
    
    🐛 Use este endpoint para testar se um token está válido antes de mostrar
    o formulário de nova senha no frontend
    """
    print(f"🔑 TOKEN TEST: Testando token {token[:10]}...")
    
    from .models import PasswordResetToken
    
    # Validar token
    reset_token = PasswordResetToken.validate_token(token)
    
    if reset_token:
        print(f"✅ Token válido para: {reset_token.user.email}")
        
        return Response({
            'success': True,
            'message': 'Token válido',
            'data': {
                'valid': True,
                'user_email': reset_token.user.email,
                'expires_at': reset_token.expires_at,
                'time_remaining': str(reset_token.time_until_expiry()),
                'attempts': reset_token.attempts,
            }
        })
    else:
        print(f"❌ Token inválido")
        
        return Response({
            'success': False,
            'message': 'Token inválido, expirado ou já usado',
            'data': {
                'valid': False,
            }
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminOnly])
def debug_password_reset_tokens(request):
    """
    🎯 ENDPOINT PARA DEBUGGING: Ver todos os tokens de reset (apenas admin)
    
    GET /api/auth/debug/reset-tokens/
    
    🐛 Use este endpoint para debuggar tokens de reset em desenvolvimento
    """
    print("🔍 DEBUG: Listando tokens de reset")
    
    from .models import PasswordResetToken
    
    tokens = PasswordResetToken.objects.all().order_by('-created_at')[:20]
    
    tokens_data = []
    for token in tokens:
        tokens_data.append({
            'id': token.id,
            'user_email': token.user.email,
            'created_at': token.created_at,
            'expires_at': token.expires_at,
            'used_at': token.used_at,
            'ip_address': token.ip_address,
            'attempts': token.attempts,
            'is_expired': token.is_expired(),
            'is_used': token.is_used(),
            'time_remaining': str(token.time_until_expiry()) if not token.is_expired() else '0:00:00',
        })
    
    return Response({
        'success': True,
        'message': f'Últimos {len(tokens_data)} tokens de reset',
        'data': tokens_data,
        'total_tokens': PasswordResetToken.objects.count(),
    })

# ==============================================================================
# 🛠️ VIEWS AUXILIARES PARA DEBUGGING
# ==============================================================================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def debug_user_info(request):
    """
    🎯 ENDPOINT PARA DEBUGGING: Ver informações do usuário logado
    
    GET /api/auth/debug/
    Header: Authorization: Bearer <access_token>
    
    🐛 Use este endpoint para testar se a autenticação JWT está funcionando
    """
    print("🎯 DEBUG VIEW: Informações do usuário")
    
    user = request.user
    print(f"🎯 Usuário autenticado: {user.email}")
    print(f"🎯 Role: {user.role}")
    print(f"🎯 Ativo: {user.is_active}")
    print(f"🎯 JWT Token: {request.auth}")
    
    return Response({
        'success': True,
        'debug_info': {
            'user_id': user.id,
            'email': user.email,
            'name': user.full_name,
            'role': user.role,
            'is_active': user.is_active,
            'date_joined': user.date_joined,
            'token_info': str(request.auth)[:50] + '...' if request.auth else None
        }
    })


# ==============================================================================
# 👥 VIEWS DE GERENCIAMENTO DE USUÁRIOS (LOGÍSTICA/ADMIN)
# ==============================================================================

class UserListView(generics.ListAPIView):
    """
    🎯 PROPÓSITO: Listar todos os usuários (apenas logística/admin)
    
    GET /api/auth/users/
    
    🐛 DEBUGGING:
    1. Coloque breakpoint em get_queryset()
    2. Teste com usuário motorista vs logística
    3. Observe como a permissão é verificada
    """
    
    serializer_class = UserListSerializer
    permission_classes = [IsLogisticaOrAdmin]
    
    def get_queryset(self):
        """
        Retorna lista de usuários baseada no role do usuário logado.
        
        🐛 BREAKPOINT: Coloque aqui para ver filtragem
        """
        print(f"🎯 USER LIST: Listando usuários")
        print(f"🎯 Solicitante: {self.request.user.email} ({self.request.user.role})")
        
        debug_user_permissions(self.request.user, "Listagem de usuários")
        
        # Admin vê todos, logística vê todos exceto outros admins
        queryset = CustomUser.objects.all().order_by('-date_joined')
        
        if self.request.user.role == 'logistica':
            # Logística não vê outros admins
            queryset = queryset.exclude(role='admin')
            print(f"🎯 Filtrando admins para usuário logística")
        
        print(f"🎯 Total de usuários retornados: {queryset.count()}")
        return queryset

    def list(self, request, *args, **kwargs):
        """
        Override para personalizar resposta.
        """
        print(f"🎯 USER LIST: GET solicitado por {request.user.email}")
        
        response = super().list(request, *args, **kwargs)
        
        return Response({
            'success': True,
            'message': 'Lista de usuários recuperada',
            'data': response.data,
            'total': len(response.data)
        })


class UserDetailView(generics.RetrieveAPIView):
    """
    🎯 PROPÓSITO: Ver detalhes de um usuário específico
    
    GET /api/auth/users/{id}/
    
    🐛 DEBUGGING: Teste permissões de acesso
    """
    
    serializer_class = UserProfileSerializer
    permission_classes = [IsOwnerOrLogisticaOrAdmin]
    queryset = CustomUser.objects.all()
    
    def retrieve(self, request, *args, **kwargs):
        """
        Recuperar dados de um usuário específico.
        
        🐛 BREAKPOINT: Coloque aqui para ver verificação de permissões
        """
        user_target = self.get_object()
        print(f"🎯 USER DETAIL: Visualizando usuário {user_target.email}")
        print(f"🎯 Solicitante: {request.user.email}")
        
        debug_user_permissions(request.user, f"Visualizar usuário {user_target.email}")
        
        response = super().retrieve(request, *args, **kwargs)
        
        return Response({
            'success': True,
            'message': 'Dados do usuário recuperados',
            'data': response.data
        })


class UserActivationView(APIView):
    """
    🎯 PROPÓSITO: Ativar/desativar usuários (apenas logística/admin)
    
    PATCH /api/auth/users/{id}/activate/
    PATCH /api/auth/users/{id}/deactivate/
    
    🐛 DEBUGGING:
    1. Coloque breakpoint no início do patch()
    2. Teste com diferentes roles
    3. Observe verificação de permissões
    """
    
    permission_classes = [IsLogisticaOrAdmin]
    
    def get_object(self, pk):
        """
        Recupera o usuário alvo.
        
        🐛 BREAKPOINT: Para ver qual usuário está sendo modificado
        """
        try:
            user = CustomUser.objects.get(pk=pk)
            print(f"🔐 TARGET USER: {user.email} (Status atual: {user.is_active})")
            return user
        except CustomUser.DoesNotExist:
            print(f"❌ Usuário com ID {pk} não encontrado")
            raise Http404("Usuário não encontrado")
    
    def patch(self, request, pk, action):
        """
        Ativa ou desativa um usuário.
        
        Args:
            pk: ID do usuário
            action: 'activate' ou 'deactivate'
        """
        print(f"🔐 USER ACTIVATION: Ação '{action}' solicitada")
        print(f"🔐 Solicitante: {request.user.email} ({request.user.role})")
        print(f"🔐 Usuário alvo ID: {pk}")
        
        debug_user_permissions(request.user, f"Ação {action} em usuário {pk}")
        
        # Verificar se ação é válida
        if action not in ['activate', 'deactivate']:
            return Response({
                'success': False,
                'message': 'Ação inválida. Use "activate" ou "deactivate"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Buscar usuário alvo
        target_user = self.get_object(pk)
        
        # Verificar se não é tentativa de auto-desativação
        if action == 'deactivate' and target_user == request.user:
            print(f"❌ Tentativa de auto-desativação bloqueada")
            return Response({
                'success': False,
                'message': 'Você não pode desativar sua própria conta'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar se logística está tentando mexer com admin
        if (request.user.role == 'logistica' and 
            target_user.role == 'admin'):
            print(f"❌ Logística tentando modificar admin - bloqueado")
            return Response({
                'success': False,
                'message': 'Equipe de logística não pode modificar administradores'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Definir novo status
        new_status = action == 'activate'
        
        # Verificar se há mudança necessária
        if target_user.is_active == new_status:
            status_text = "ativo" if new_status else "inativo"
            return Response({
                'success': True,
                'message': f'Usuário já está {status_text}',
                'data': UserListSerializer(target_user).data
            })
        
        # Atualizar status usando serializer
        serializer = UserActivationSerializer(
            target_user, 
            data={'is_active': new_status}, 
            partial=True
        )
        
        if serializer.is_valid():
            updated_user = serializer.save()
            
            action_text = "ativado" if new_status else "desativado"
            print(f"✅ Usuário {updated_user.email} foi {action_text}")
            
            return Response({
                'success': True,
                'message': f'Usuário {action_text} com sucesso',
                'data': UserListSerializer(updated_user).data
            })
        
        return Response({
            'success': False,
            'message': 'Erro na validação',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# ==============================================================================
# 🛠️ VIEWS AUXILIARES PARA DEBUGGING
# ==============================================================================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def debug_user_info(request):
    """
    🎯 ENDPOINT PARA DEBUGGING: Ver informações do usuário logado
    
    GET /api/auth/debug/
    Header: Authorization: Bearer <access_token>
    
    🐛 Use este endpoint para testar se a autenticação está funcionando
    """
    print("🎯 DEBUG VIEW: Informações do usuário")
    
    user = request.user
    print(f"🎯 Usuário autenticado: {user.email}")
    print(f"🎯 Role: {user.role}")
    print(f"🎯 Ativo: {user.is_active}")
    print(f"🎯 JWT Token: {request.auth}")
    
    debug_user_permissions(user, "Debug endpoint")
    
    return Response({
        'success': True,
        'debug_info': {
            'user_id': user.id,
            'email': user.email,
            'name': user.full_name,
            'role': user.role,
            'is_active': user.is_active,
            'date_joined': user.date_joined,
            'permissions': {
                'can_manage_users': user.role in ['logistica', 'admin'],
                'can_view_all_data': user.role in ['logistica', 'admin'],
                'can_approve_transfers': user.role in ['logistica', 'admin'],
                'is_motorista': user.is_motorista(),
                'is_logistica': user.is_logistica(),
                'is_admin': user.is_admin(),
            },
            'token_info': str(request.auth)[:50] + '...' if request.auth else None
        }
    })


@api_view(['GET'])
@permission_classes([IsLogisticaOrAdmin])
def debug_permissions_test(request):
    """
    🎯 ENDPOINT PARA TESTAR PERMISSÕES
    
    GET /api/auth/debug/permissions/
    
    Este endpoint só funciona para logística/admin.
    Use para testar se as permissões estão funcionando.
    """
    print("🔐 PERMISSION TEST: Endpoint restrito")
    
    debug_user_permissions(request.user, "Teste de permissões restritas")
    
    return Response({
        'success': True,
        'message': 'Você tem permissões para acessar este endpoint!',
        'user_info': {
            'email': request.user.email,
            'role': request.user.role,
            'permissions_ok': True
        }
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def test_password_reset_token(request, token):
    """
    🎯 ENDPOINT PARA TESTAR TOKEN DE RESET: Verificar se token é válido
    
    GET /api/auth/password/test-token/{token}/
    
    🐛 Use este endpoint para testar se um token está válido antes de mostrar
    o formulário de nova senha no frontend
    """
    print(f"🔑 TOKEN TEST: Testando token {token[:10]}...")
    
    from .models import PasswordResetToken
    
    # Validar token
    reset_token = PasswordResetToken.validate_token(token)
    
    if reset_token:
        print(f"✅ Token válido para: {reset_token.user.email}")
        
        return Response({
            'success': True,
            'message': 'Token válido',
            'data': {
                'valid': True,
                'user_email': reset_token.user.email,
                'expires_at': reset_token.expires_at,
                'time_remaining': str(reset_token.time_until_expiry()),
                'attempts': reset_token.attempts,
            }
        })
    else:
        print(f"❌ Token inválido")
        
        return Response({
            'success': False,
            'message': 'Token inválido, expirado ou já usado',
            'data': {
                'valid': False,
            }
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminOnly])
def debug_password_reset_tokens(request):
    """
    🎯 ENDPOINT PARA DEBUGGING: Ver todos os tokens de reset (apenas admin)
    
    GET /api/auth/debug/reset-tokens/
    
    🐛 Use este endpoint para debuggar tokens de reset em desenvolvimento
    """
    print("🔍 DEBUG: Listando tokens de reset")
    
    from .models import PasswordResetToken
    
    tokens = PasswordResetToken.objects.all().order_by('-created_at')[:20]
    
    tokens_data = []
    for token in tokens:
        tokens_data.append({
            'id': token.id,
            'user_email': token.user.email,
            'created_at': token.created_at,
            'expires_at': token.expires_at,
            'used_at': token.used_at,
            'ip_address': token.ip_address,
            'attempts': token.attempts,
            'is_expired': token.is_expired(),
            'is_used': token.is_used(),
            'time_remaining': str(token.time_until_expiry()) if not token.is_expired() else '0:00:00',
        })
    
    return Response({
        'success': True,
        'message': f'Últimos {len(tokens_data)} tokens de reset',
        'data': tokens_data,
        'total_tokens': PasswordResetToken.objects.count(),
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def debug_endpoints(request):
    """
    🎯 ENDPOINT PARA DEBUGGING: Lista todos os endpoints disponíveis
    
    GET /api/auth/endpoints/
    """
    endpoints = {
        'authentication': {
            'register': {
                'url': 'POST /api/auth/register/',
                'description': 'Registrar novo usuário',
                'auth_required': False
            },
            'login': {
                'url': 'POST /api/auth/login/',
                'description': 'Fazer login',
                'auth_required': False
            },
            'logout': {
                'url': 'POST /api/auth/logout/',
                'description': 'Fazer logout',
                'auth_required': True
            },
            'profile': {
                'url': 'GET|PUT /api/auth/user/',
                'description': 'Ver/editar perfil',
                'auth_required': True
            },
            'password_reset': {
                'url': 'POST /api/auth/password/reset/',
                'description': 'Solicitar reset de senha',
                'auth_required': False
            },
            'password_confirm': {
                'url': 'POST /api/auth/password/confirm/',
                'description': 'Confirmar nova senha',
                'auth_required': False
            }
        },
        'debugging': {
            'debug_user': {
                'url': 'GET /api/auth/debug/',
                'description': 'Ver info do usuário logado',
                'auth_required': True
            },
            'debug_endpoints': {
                'url': 'GET /api/auth/endpoints/',
                'description': 'Ver todos os endpoints',
                'auth_required': False
            }
        }
    }
    
    return Response(endpoints)


# ==============================================================================
# 📚 RESUMO: COMO DEBUGGAR VIEWS + SERIALIZERS
# ==============================================================================

"""
🎯 GUIA COMPLETO DE DEBUGGING:

1. **COLOQUE BREAKPOINTS NESTA ORDEM:**
   a) Início do método da view (ex: def post(self, request):)
   b) Criação do serializer (ex: serializer = UserRegistrationSerializer(...))
   c) Chamada do is_valid() (ex: if serializer.is_valid():)
   d) Nos métodos validate_* do serializer
   e) Chamada do save() (ex: user = serializer.save())
   f) No método create/update do serializer

2. **DADOS IMPORTANTES PARA INSPECIONAR:**
   - request.data → dados que chegaram na requisição
   - serializer.initial_data → dados iniciais do serializer
   - serializer.validated_data → dados após validação
   - serializer.errors → erros de validação
   - serializer.instance → objeto sendo editado (em updates)

3. **FLUXO TÍPICO:**
   View → Serializer(data) → is_valid() → validate_*() → save() → create()/update()

4. **TESTANDO COM CURL:**
   curl -X POST http://localhost:8000/api/auth/register/ \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"test123","password_confirm":"test123","first_name":"Test","last_name":"User","cpf":"12345678901"}'

5. **DICA DE OURO:**
   Use a função debug_serializer_flow() em qualquer ponto para ver o estado completo do serializer!
"""