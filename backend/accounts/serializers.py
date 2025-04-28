# accounts/serializers.py

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo CustomUser - utilizado para exibir dados do usuário
    """
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'phone', 'cpf', 
                 'cnh_numero', 'cnh_categoria', 'cnh_validade', 'foto_perfil', 'is_active']
        read_only_fields = ['id', 'is_active']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer para registro de novos usuários
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = CustomUser
        fields = ['email', 'cpf', 'password', 'password_confirm', 'first_name', 'last_name', 
                  'role', 'phone', 'cnh_numero', 'cnh_categoria', 'cnh_validade']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': True},
        }

    def validate(self, attrs):
        # Validar se as senhas coincidem
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        
        # Validar a senha com o validador do Django
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
            
        return attrs
        
    def create(self, validated_data):
        # Remover password_confirm do dicionário
        validated_data.pop('password_confirm')
        
        # Criar o usuário
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            cpf=validated_data['cpf'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data['role'],
            phone=validated_data.get('phone', ''),
            cnh_numero=validated_data.get('cnh_numero', ''),
            cnh_categoria=validated_data.get('cnh_categoria', ''),
            cnh_validade=validated_data.get('cnh_validade', None),
            is_active=True  # Ativar o usuário por padrão (em produção pode ser False)
        )
        
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer para solicitação de redefinição de senha
    """
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer para confirmação de redefinição de senha
    """
    token = serializers.CharField(required=True)
    uid = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"new_password": "As senhas não coincidem."})
        
        try:
            validate_password(attrs['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})
            
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer para alteração de senha do usuário logado
    """
    old_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"new_password": "As senhas não coincidem."})
        
        try:
            validate_password(attrs['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})
            
        return attrs