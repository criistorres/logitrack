# accounts/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

from .serializers import (
    CustomUserSerializer, 
    UserRegistrationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ChangePasswordSerializer
)
from .models import CustomUser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import serializers

# Definir explicitamente os parâmetros para UserRegistrationView
registration_parameters = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['email', 'cpf', 'password', 'password_confirm', 'first_name', 'last_name', 'role'],
    properties={
        'email': openapi.Schema(type=openapi.TYPE_STRING, description='Email do usuário'),
        'cpf': openapi.Schema(type=openapi.TYPE_STRING, description='CPF do usuário (somente números)'),
        'password': openapi.Schema(type=openapi.TYPE_STRING, description='Senha'),
        'password_confirm': openapi.Schema(type=openapi.TYPE_STRING, description='Confirmação da senha'),
        'first_name': openapi.Schema(type=openapi.TYPE_STRING, description='Nome'),
        'last_name': openapi.Schema(type=openapi.TYPE_STRING, description='Sobrenome'),
        'role': openapi.Schema(type=openapi.TYPE_STRING, description='Função (motorista, logistica, admin)', enum=['motorista', 'logistica', 'admin']),
        'phone': openapi.Schema(type=openapi.TYPE_STRING, description='Telefone'),
        'cnh_numero': openapi.Schema(type=openapi.TYPE_STRING, description='Número CNH (obrigatório para motorista)'),
        'cnh_categoria': openapi.Schema(type=openapi.TYPE_STRING, description='Categoria CNH (obrigatório para motorista)'),
        'cnh_validade': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='Validade CNH (YYYY-MM-DD) (obrigatório para motorista)'),
    }
)

# Definir explicitamente os parâmetros para LogoutView
logout_parameters = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['refresh'],
    properties={
        'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Token de refresh para invalidar'),
    }
)

# Definir os parâmetros para PasswordResetRequestView
password_reset_request_parameters = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['email'],
    properties={
        'email': openapi.Schema(type=openapi.TYPE_STRING, description='Email do usuário'),
    }
)

# Definir os parâmetros para PasswordResetConfirmView
password_reset_confirm_parameters = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['uid', 'token', 'new_password', 'confirm_password'],
    properties={
        'uid': openapi.Schema(type=openapi.TYPE_STRING, description='UID codificado do usuário'),
        'token': openapi.Schema(type=openapi.TYPE_STRING, description='Token de redefinição de senha'),
        'new_password': openapi.Schema(type=openapi.TYPE_STRING, description='Nova senha'),
        'confirm_password': openapi.Schema(type=openapi.TYPE_STRING, description='Confirmação da nova senha'),
    }
)

# Definir os parâmetros para ChangePasswordView
change_password_parameters = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['old_password', 'new_password', 'confirm_password'],
    properties={
        'old_password': openapi.Schema(type=openapi.TYPE_STRING, description='Senha atual'),
        'new_password': openapi.Schema(type=openapi.TYPE_STRING, description='Nova senha'),
        'confirm_password': openapi.Schema(type=openapi.TYPE_STRING, description='Confirmação da nova senha'),
    }
)

class UserDetailView(APIView):
    """
    View para obter ou atualizar os detalhes do usuário autenticado
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Obter dados do usuário",
        operation_description="Retorna os dados do usuário autenticado",
        responses={
            200: CustomUserSerializer,
            401: "Não autenticado"
        },
        tags=['Usuários']
    )
    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)
        
    # Definir explicitamente os parâmetros para o patch
    user_update_parameters = openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'first_name': openapi.Schema(type=openapi.TYPE_STRING, description='Nome'),
            'last_name': openapi.Schema(type=openapi.TYPE_STRING, description='Sobrenome'),
            'phone': openapi.Schema(type=openapi.TYPE_STRING, description='Telefone'),
            'cnh_numero': openapi.Schema(type=openapi.TYPE_STRING, description='Número CNH'),
            'cnh_categoria': openapi.Schema(type=openapi.TYPE_STRING, description='Categoria CNH'),
            'cnh_validade': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='Validade CNH (YYYY-MM-DD)'),
            'foto_perfil': openapi.Schema(type=openapi.TYPE_STRING, format='binary', description='Foto de perfil'),
        }
    )
    
    @swagger_auto_schema(
        operation_summary="Atualizar dados do usuário",
        operation_description="Atualiza os dados do usuário autenticado",
        request_body=user_update_parameters,
        responses={
            200: CustomUserSerializer,
            400: "Dados inválidos",
            401: "Não autenticado"
        },
        tags=['Usuários']
    )
    def patch(self, request):
        serializer = CustomUserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRegistrationView(generics.CreateAPIView):
    """
    View para registro de novos usuários
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Registrar novo usuário",
        operation_description="Cria um novo usuário no sistema e retorna tokens de autenticação",
        request_body=registration_parameters,  # Usar os parâmetros explícitos
        responses={
            201: openapi.Response(
                description="Usuário criado com sucesso",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'user': openapi.Schema(type=openapi.TYPE_OBJECT, description="Dados do usuário"),
                        'token': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'refresh': openapi.Schema(type=openapi.TYPE_STRING, description="Token de refresh"),
                                'access': openapi.Schema(type=openapi.TYPE_STRING, description="Token de acesso")
                            }
                        )
                    }
                )
            ),
            400: "Dados inválidos"
        },
        tags=['Autenticação']
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Gerar tokens JWT
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "user": CustomUserSerializer(user).data,
                "token": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    View para logout do usuário
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Logout",
        operation_description="Invalida o refresh token do usuário, realizando o logout",
        request_body=logout_parameters,  # Usar os parâmetros explícitos
        responses={
            200: "Logout realizado com sucesso",
            400: "Erro ao realizar logout",
            401: "Não autenticado"
        },
        tags=['Autenticação']
    )
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logout realizado com sucesso."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": "Erro ao realizar logout.", "error": str(e)}, 
                           status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """
    View para solicitar redefinição de senha
    """
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Solicitar redefinição de senha",
        operation_description="Inicia o processo de redefinição de senha enviando instruções por email",
        request_body=password_reset_request_parameters,  # Usar os parâmetros explícitos
        responses={
            200: "Instruções enviadas por email",
            400: "Dados inválidos"
        },
        tags=['Gerenciamento de Senha']
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = CustomUser.objects.get(email=email)
                
                # Gerar token e uid
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
                # Construir URL de reset (em produção, usar domínio real)
                current_site = get_current_site(request)
                reset_url = f"{current_site.domain}/reset-password/{uid}/{token}/"
                
                # Enviar email
                subject = 'Redefinição de senha LogiTrack'
                message = f'Use o link a seguir para redefinir sua senha: {reset_url}'
                
                # Em produção, usar um template HTML e enviar email adequadamente
                # send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
                
                # Por enquanto, apenas retornar o link para teste
                return Response({
                    "detail": "Instruções de redefinição de senha enviadas para o email.",
                    "reset_url": reset_url  # Apenas para teste, remover em produção
                })
                
            except CustomUser.DoesNotExist:
                # Por razões de segurança, não informamos se o email existe ou não
                return Response({
                    "detail": "Se o email estiver em nosso sistema, enviaremos instruções para redefinição de senha."
                })
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    View para confirmar redefinição de senha
    """
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Confirmar redefinição de senha",
        operation_description="Redefine a senha do usuário utilizando o token recebido por email",
        request_body=password_reset_confirm_parameters,  # Usar os parâmetros explícitos
        responses={
            200: "Senha redefinida com sucesso",
            400: "Token inválido ou senhas não coincidem"
        },
        tags=['Gerenciamento de Senha']
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            uid = serializer.validated_data['uid']
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            try:
                # Decodificar uid para obter o ID do usuário
                user_id = force_str(urlsafe_base64_decode(uid))
                user = CustomUser.objects.get(pk=user_id)
                
                # Verificar se o token é válido
                if default_token_generator.check_token(user, token):
                    user.set_password(new_password)
                    user.save()
                    return Response({"detail": "Senha redefinida com sucesso."})
                else:
                    return Response({"detail": "Token inválido."}, status=status.HTTP_400_BAD_REQUEST)
                    
            except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
                return Response({"detail": "Link inválido."}, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    View para alteração de senha do usuário logado
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Alterar senha",
        operation_description="Altera a senha do usuário autenticado",
        request_body=change_password_parameters,  # Usar os parâmetros explícitos
        responses={
            200: "Senha alterada com sucesso",
            400: "Senha atual incorreta ou nova senha inválida",
            401: "Não autenticado"
        },
        tags=['Gerenciamento de Senha']
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            # Verificar se a senha antiga está correta
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": ["Senha atual incorreta."]}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            # Alterar a senha
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({"detail": "Senha alterada com sucesso."})
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)