# ==============================================================================
# MODELO DE USUÁRIO PERSONALIZADO
# ==============================================================================

# Arquivo: backend/accounts/models.py
# Substitua completamente o conteúdo do arquivo models.py pelo código abaixo:

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.base_user import BaseUserManager
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator


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