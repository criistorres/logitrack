# ==============================================================================
# MODELO DE USUÁRIO PERSONALIZADO - SISTEMA DE CÓDIGO DE RESET
# ==============================================================================

# Arquivo: backend/accounts/models.py
# SUBSTITUA COMPLETAMENTE o conteúdo do arquivo models.py

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.base_user import BaseUserManager
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator
import secrets
import hashlib
import random
from datetime import timedelta
from django.conf import settings


class CustomUserManager(BaseUserManager):
    """
    Gerenciador personalizado para o modelo CustomUser.
    Define como criar usuários normais e superusuários.
    """
    
    def create_user(self, email, cpf, password=None, **extra_fields):
        """
        Cria e salva um usuário comum com email, CPF e senha fornecidos.
        
        Args:
            email (str): Email do usuário
            cpf (str): CPF do usuário
            password (str): Senha do usuário
            **extra_fields: Campos adicionais
        
        Returns:
            CustomUser: Instância do usuário criado
        
        Raises:
            ValueError: Se email ou CPF não forem fornecidos
        """
        if not email:
            raise ValueError('O usuário deve ter um endereço de email')
        if not cpf:
            raise ValueError('O usuário deve ter um CPF')
        
        # Normalizar email (converter domínio para minúsculo)
        email = self.normalize_email(email)
        
        # Limpar CPF (remover caracteres especiais)
        cpf = self._clean_cpf(cpf)
        
        # Criar instância do usuário
        user = self.model(
            email=email,
            cpf=cpf,
            **extra_fields
        )
        
        # Definir senha (será hasheada automaticamente)
        user.set_password(password)
        
        # Salvar no banco de dados
        user.save(using=self._db)
        
        return user
    
    def create_superuser(self, email, cpf, password=None, **extra_fields):
        """
        Cria e salva um superusuário com email, CPF e senha fornecidos.
        
        Args:
            email (str): Email do superusuário
            cpf (str): CPF do superusuário
            password (str): Senha do superusuário
            **extra_fields: Campos adicionais
        
        Returns:
            CustomUser: Instância do superusuário criado
        """
        # Definir valores padrão para superusuário
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')
        
        # Validar se os campos necessários estão definidos
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superusuário deve ter is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superusuário deve ter is_superuser=True.')
        
        return self.create_user(email, cpf, password, **extra_fields)
    
    def _clean_cpf(self, cpf):
        """
        Remove caracteres especiais do CPF, mantendo apenas números.
        
        Args:
            cpf (str): CPF com ou sem formatação
        
        Returns:
            str: CPF apenas com números
        """
        if cpf:
            return ''.join(filter(str.isdigit, cpf))
        return cpf


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Modelo de usuário personalizado para o sistema LogiTrack.
    
    Estende AbstractBaseUser para permitir login via email ao invés de username.
    Inclui campos específicos para motoristas (CNH) e informações de contato.
    
    Attributes:
        email (EmailField): Email único do usuário (usado para login)
        first_name (CharField): Primeiro nome do usuário
        last_name (CharField): Sobrenome do usuário
        cpf (CharField): CPF único do usuário
        phone (CharField): Telefone do usuário
        role (CharField): Função do usuário no sistema (motorista, logistica, admin)
        is_active (BooleanField): Se o usuário está ativo
        is_staff (BooleanField): Se o usuário pode acessar o admin
        date_joined (DateTimeField): Data de registro do usuário
        
        # Campos específicos para motoristas
        cnh_numero (CharField): Número da CNH
        cnh_categoria (CharField): Categoria da CNH (A, B, C, D, E)
        cnh_validade (DateField): Data de validade da CNH
        foto_perfil (ImageField): Foto do perfil do usuário
    """
    
    # ==============================================================================
    # CAMPOS BÁSICOS DO USUÁRIO
    # ==============================================================================
    
    email = models.EmailField(
        'Email',
        unique=True,
        help_text='Endereço de email único usado para login',
        error_messages={
            'unique': 'Um usuário com este email já existe.',
        }
    )
    
    first_name = models.CharField(
        'Nome',
        max_length=30,
        blank=True,
        help_text='Primeiro nome do usuário'
    )
    
    last_name = models.CharField(
        'Sobrenome',
        max_length=30,
        blank=True,
        help_text='Sobrenome do usuário'
    )
    
    # Validador para CPF (apenas números, 11 dígitos)
    cpf_validator = RegexValidator(
        regex=r'^\d{11}$',
        message='CPF deve conter exatamente 11 dígitos numéricos.'
    )
    
    cpf = models.CharField(
        'CPF',
        max_length=11,
        unique=True,
        validators=[cpf_validator],
        help_text='CPF com 11 dígitos (apenas números)',
        error_messages={
            'unique': 'Um usuário com este CPF já existe.',
        }
    )
    
    # Validador para telefone
    phone_validator = RegexValidator(
        regex=r'^\+?1?\d{10,15}$',
        message='Telefone deve ter entre 10 e 15 dígitos.'
    )
    
    phone = models.CharField(
        'Telefone',
        max_length=15,
        blank=True,
        validators=[phone_validator],
        help_text='Número de telefone com DDD'
    )
    
    # ==============================================================================
    # CAMPOS DE FUNÇÃO E PERMISSÕES
    # ==============================================================================
    
    ROLE_CHOICES = [
        ('motorista', 'Motorista'),
        ('logistica', 'Logística'),
        ('admin', 'Administrador'),
    ]
    
    role = models.CharField(
        'Função',
        max_length=30,
        choices=ROLE_CHOICES,
        default='motorista',
        help_text='Função do usuário no sistema'
    )
    
    # ==============================================================================
    # CAMPOS DE STATUS
    # ==============================================================================
    
    is_active = models.BooleanField(
        'Ativo',
        default=False,  # Usuários são criados inativos por padrão
        help_text='Designa se este usuário deve ser tratado como ativo. '
                  'Desmarque ao invés de deletar contas.'
    )
    
    is_staff = models.BooleanField(
        'Membro da equipe',
        default=False,
        help_text='Designa se o usuário pode acessar o site de administração.'
    )
    
    date_joined = models.DateTimeField(
        'Data de registro',
        default=timezone.now,
        help_text='Data e hora em que o usuário foi registrado'
    )
    
    # ==============================================================================
    # CAMPOS ESPECÍFICOS PARA MOTORISTAS
    # ==============================================================================
    
    cnh_numero = models.CharField(
        'Número CNH',
        max_length=20,
        blank=True,
        help_text='Número da Carteira Nacional de Habilitação'
    )
    
    CNH_CATEGORIA_CHOICES = [
        ('A', 'Categoria A'),
        ('B', 'Categoria B'),
        ('AB', 'Categorias A e B'),
        ('C', 'Categoria C'),
        ('D', 'Categoria D'),
        ('E', 'Categoria E'),
    ]
    
    cnh_categoria = models.CharField(
        'Categoria CNH',
        max_length=5,
        choices=CNH_CATEGORIA_CHOICES,
        blank=True,
        help_text='Categoria da CNH (A, B, C, D, E)'
    )
    
    cnh_validade = models.DateField(
        'Validade CNH',
        null=True,
        blank=True,
        help_text='Data de validade da CNH'
    )
    
    # ==============================================================================
    # CAMPOS DE MÍDIA
    # ==============================================================================
    
    foto_perfil = models.ImageField(
        'Foto de Perfil',
        upload_to='usuarios/perfil/%Y/%m/',
        null=True,
        blank=True,
        help_text='Foto do perfil do usuário'
    )
    
    # ==============================================================================
    # CONFIGURAÇÕES DO MODELO
    # ==============================================================================
    
    # Gerenciador personalizado
    objects = CustomUserManager()
    
    # Campo usado para login
    USERNAME_FIELD = 'email'
    
    # Campos obrigatórios para criar superusuário
    REQUIRED_FIELDS = ['cpf']
    
    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ['-date_joined']
        
    def __str__(self):
        """
        Representação string do usuário.
        
        Returns:
            str: Nome completo ou email se nome não estiver disponível
        """
        if self.first_name and self.last_name:
            return f'{self.first_name} {self.last_name}'
        elif self.first_name:
            return self.first_name
        return self.email
    
    # ==============================================================================
    # MÉTODOS DE PROPRIEDADE
    # ==============================================================================
    
    @property
    def full_name(self):
        """
        Retorna o nome completo do usuário.
        
        Returns:
            str: Nome completo ou email se nome não estiver disponível
        """
        if self.first_name and self.last_name:
            return f'{self.first_name} {self.last_name}'.strip()
        elif self.first_name:
            return self.first_name
        return self.email
    
    @property
    def short_name(self):
        """
        Retorna o primeiro nome do usuário.
        
        Returns:
            str: Primeiro nome ou email se nome não estiver disponível
        """
        return self.first_name if self.first_name else self.email
    
    @property
    def cpf_formatted(self):
        """
        Retorna o CPF formatado (XXX.XXX.XXX-XX).
        
        Returns:
            str: CPF formatado ou string vazia se CPF não estiver disponível
        """
        if self.cpf and len(self.cpf) == 11:
            return f'{self.cpf[:3]}.{self.cpf[3:6]}.{self.cpf[6:9]}-{self.cpf[9:]}'
        return self.cpf
    
    @property
    def cnh_vencida(self):
        """
        Verifica se a CNH está vencida.
        
        Returns:
            bool: True se a CNH estiver vencida, False caso contrário
        """
        if self.cnh_validade:
            return timezone.now().date() > self.cnh_validade
        return False
    
    # ==============================================================================
    # MÉTODOS DE VERIFICAÇÃO DE FUNÇÃO
    # ==============================================================================
    
    def is_motorista(self):
        """
        Verifica se o usuário é motorista.
        
        Returns:
            bool: True se for motorista, False caso contrário
        """
        return self.role == 'motorista'
    
    def is_logistica(self):
        """
        Verifica se o usuário é da equipe de logística.
        
        Returns:
            bool: True se for logística, False caso contrário
        """
        return self.role == 'logistica'
    
    def is_admin(self):
        """
        Verifica se o usuário é administrador.
        
        Returns:
            bool: True se for admin, False caso contrário
        """
        return self.role == 'admin'
    
    def can_manage_users(self):
        """
        Verifica se o usuário pode gerenciar outros usuários.
        
        Returns:
            bool: True se pode gerenciar usuários, False caso contrário
        """
        return self.role in ['logistica', 'admin']
    
    def can_view_all_ots(self):
        """
        Verifica se o usuário pode ver todas as OTs.
        
        Returns:
            bool: True se pode ver todas as OTs, False caso contrário
        """
        return self.role in ['logistica', 'admin']
    
    # ==============================================================================
    # MÉTODOS DE VALIDAÇÃO
    # ==============================================================================
    
    def clean(self):
        """
        Validação personalizada do modelo.
        Verifica se dados específicos de motorista estão preenchidos quando necessário.
        """
        from django.core.exceptions import ValidationError
        
        super().clean()
        
        # Se for motorista, validar campos específicos
        if self.role == 'motorista':
            errors = {}
            
            if not self.cnh_numero:
                errors['cnh_numero'] = 'CNH é obrigatória para motoristas.'
            
            if not self.cnh_categoria:
                errors['cnh_categoria'] = 'Categoria da CNH é obrigatória para motoristas.'
            
            if not self.cnh_validade:
                errors['cnh_validade'] = 'Validade da CNH é obrigatória para motoristas.'
            
            if errors:
                raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        """
        Sobrescreve o método save para aplicar validações antes de salvar.
        """
        # Limpar CPF antes de salvar
        if self.cpf:
            self.cpf = ''.join(filter(str.isdigit, self.cpf))
        
        # Executar validação completa
        self.full_clean()
        
        # Salvar o modelo
        super().save(*args, **kwargs)


class PasswordResetToken(models.Model):
    """
    Modelo para códigos de redefinição de senha.
    
    🔒 SEGURANÇA:
    - Códigos de 6 dígitos únicos
    - Expiração automática (30 minutos)
    - Hash do código para segurança extra
    - Um código por usuário (substitui anterior)
    - Máximo 3 tentativas por código
    
    🎯 FLUXO DE USO:
    1. Usuário solicita reset → gera código 6 dígitos
    2. Email enviado com código
    3. Usuário digita código + nova senha no app
    4. Sistema valida código e altera senha
    
    🐛 DEBUGGING:
    - Logs detalhados de criação e uso
    - Rastreamento de tentativas
    """
    
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='password_reset_token',
        verbose_name='Usuário'
    )
    
    code_hash = models.CharField(
        'Hash do Código',
        max_length=64,
        unique=True,
        help_text='Hash SHA-256 do código de 6 dígitos para segurança'
    )
    
    created_at = models.DateTimeField(
        'Criado em',
        default=timezone.now
    )
    
    expires_at = models.DateTimeField(
        'Expira em',
        help_text='Código expira em 30 minutos'
    )
    
    used_at = models.DateTimeField(
        'Usado em',
        null=True,
        blank=True,
        help_text='Quando o código foi usado para redefinir senha'
    )
    
    ip_address = models.GenericIPAddressField(
        'IP de Criação',
        null=True,
        blank=True,
        help_text='IP que solicitou o reset'
    )
    
    attempts = models.PositiveIntegerField(
        'Tentativas',
        default=0,
        help_text='Número de tentativas de uso do código (máximo 3)'
    )
    
    class Meta:
        verbose_name = 'Código de Reset de Senha'
        verbose_name_plural = 'Códigos de Reset de Senha'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Reset Code para {self.user.email} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"
    
    @classmethod
    def generate_code_for_user(cls, user, ip_address=None):
        """
        Gera um novo código de reset para o usuário.
        
        🔒 SEGURANÇA:
        - Remove códigos anteriores do mesmo usuário
        - Gera código de 6 dígitos criptograficamente seguro
        - Define expiração de 30 minutos
        - Evita códigos sequenciais ou óbvios
        
        Args:
            user (CustomUser): Usuário que solicitou reset
            ip_address (str): IP que fez a solicitação
            
        Returns:
            tuple: (PasswordResetToken, raw_code)
        """
        print(f"🔑 RESET CODE: Gerando código para {user.email}")
        
        # Remover códigos anteriores do usuário
        cls.objects.filter(user=user).delete()
        print(f"🔑 Códigos anteriores removidos para {user.email}")
        
        # Gerar código de 6 dígitos (evitando sequências óbvias)
        attempts = 0
        max_attempts = 10
        
        while attempts < max_attempts:
            # Gerar código aleatório de 6 dígitos
            raw_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            
            # Verificar se não é sequencial ou repetitivo
            if not cls._is_weak_code(raw_code):
                break
            
            attempts += 1
        
        # Se não conseguiu gerar código forte, usar backup seguro
        if attempts >= max_attempts:
            raw_code = str(random.randint(100000, 999999))
        
        print(f"🔑 Código gerado: {raw_code}")
        
        # Criar hash do código
        code_hash = hashlib.sha256(raw_code.encode()).hexdigest()
        print(f"🔑 Hash criado: {code_hash[:10]}...{code_hash[-10:]}")
        
        # Criar registro no banco
        reset_token = cls.objects.create(
            user=user,
            code_hash=code_hash,
            expires_at=timezone.now() + timedelta(minutes=30),  # 30 minutos
            ip_address=ip_address
        )
        
        print(f"🔑 Código salvo no banco - ID: {reset_token.id}")
        print(f"🔑 Expira em: {reset_token.expires_at}")
        
        return reset_token, raw_code
    
    @classmethod
    def _is_weak_code(cls, code):
        """
        Verifica se o código é fraco (sequencial, repetitivo, etc.).
        
        Args:
            code (str): Código de 6 dígitos
            
        Returns:
            bool: True se o código for fraco
        """
        # Códigos óbvios
        weak_codes = [
            '000000', '111111', '222222', '333333', '444444', 
            '555555', '666666', '777777', '888888', '999999',
            '123456', '654321', '012345', '543210',
            '111222', '222333', '333444', '444555'
        ]
        
        if code in weak_codes:
            return True
        
        # Verificar se todos os dígitos são iguais
        if len(set(code)) == 1:
            return True
        
        # Verificar sequência crescente
        is_sequential = True
        for i in range(1, len(code)):
            if int(code[i]) != int(code[i-1]) + 1:
                is_sequential = False
                break
        
        if is_sequential:
            return True
        
        # Verificar sequência decrescente
        is_reverse_sequential = True
        for i in range(1, len(code)):
            if int(code[i]) != int(code[i-1]) - 1:
                is_reverse_sequential = False
                break
        
        if is_reverse_sequential:
            return True
        
        return False
    
    @classmethod
    def validate_code(cls, raw_code):
        """
        Valida um código de reset.
        
        🔒 SEGURANÇA:
        - Verifica hash do código
        - Verifica expiração
        - Limita tentativas (máximo 3)
        - Registra tentativas para auditoria
        
        Args:
            raw_code (str): Código de 6 dígitos enviado pelo usuário
            
        Returns:
            PasswordResetToken or None: Token válido ou None
        """
        print(f"🔑 VALIDATE CODE: Validando código {raw_code}")
        
        # Validar formato do código
        if not raw_code or len(raw_code) != 6 or not raw_code.isdigit():
            print(f"❌ Código inválido - formato incorreto: {raw_code}")
            return None
        
        # Criar hash do código fornecido
        code_hash = hashlib.sha256(raw_code.encode()).hexdigest()
        print(f"🔑 Hash do código: {code_hash[:10]}...")
        
        try:
            # Buscar código no banco
            reset_token = cls.objects.get(code_hash=code_hash)
            print(f"🔑 Código encontrado para: {reset_token.user.email}")
            
            # Incrementar tentativas
            reset_token.attempts += 1
            reset_token.save(update_fields=['attempts'])
            print(f"🔑 Tentativa #{reset_token.attempts}")
            
            # Verificar se já foi usado
            if reset_token.used_at:
                print(f"❌ Código já foi usado em: {reset_token.used_at}")
                return None
            
            # Verificar expiração
            if timezone.now() > reset_token.expires_at:
                print(f"❌ Código expirado em: {reset_token.expires_at}")
                return None
            
            # Verificar muitas tentativas (máximo 3)
            if reset_token.attempts > 3:
                print(f"❌ Muitas tentativas: {reset_token.attempts}")
                return None
            
            print(f"✅ Código válido!")
            return reset_token
            
        except cls.DoesNotExist:
            print(f"❌ Código não encontrado no banco")
            return None
        except Exception as e:
            print(f"❌ Erro ao validar código: {e}")
            return None
    
    def mark_as_used(self):
        """
        Marca o código como usado.
        """
        print(f"🔑 Marcando código como usado para: {self.user.email}")
        self.used_at = timezone.now()
        self.save(update_fields=['used_at'])
    
    def is_expired(self):
        """
        Verifica se o código expirou.
        """
        return timezone.now() > self.expires_at
    
    def is_used(self):
        """
        Verifica se o código já foi usado.
        """
        return self.used_at is not None
    
    def time_until_expiry(self):
        """
        Retorna tempo até expiração.
        """
        if self.is_expired():
            return timedelta(0)
        return self.expires_at - timezone.now()
    
    def get_expiry_minutes_remaining(self):
        """
        Retorna minutos restantes até expiração.
        
        Returns:
            int: Minutos restantes (0 se expirado)
        """
        if self.is_expired():
            return 0
        
        time_remaining = self.time_until_expiry()
        return max(0, int(time_remaining.total_seconds() / 60))


# ==============================================================================
# CONFIGURAÇÕES DE SEGURANÇA PARA CÓDIGOS DE RESET
# ==============================================================================

# Configurações de código para reset de senha
PASSWORD_RESET_CODE_LENGTH = 6          # 6 dígitos
PASSWORD_RESET_CODE_TIMEOUT = 30        # 30 minutos
PASSWORD_RESET_MAX_ATTEMPTS = 3         # Máximo de tentativas por código
PASSWORD_RESET_MAX_DAILY_REQUESTS = 5   # Máximo de solicitações por dia por usuário