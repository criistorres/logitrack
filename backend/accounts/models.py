# accounts/models.py

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from .managers import CustomUserManager

class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Modelo de usuário que estende o AbstractBaseUser para personalização
    """
    email = models.EmailField('Email', unique=True)
    first_name = models.CharField('Nome', max_length=30, blank=True)
    last_name = models.CharField('Sobrenome', max_length=30, blank=True)
    is_active = models.BooleanField('Ativo', default=False)
    is_staff = models.BooleanField('Staff', default=False)
    date_joined = models.DateTimeField('Data de registro', default=timezone.now)
    
    ROLE_CHOICES = [
        ('motorista', 'Motorista'),
        ('logistica', 'Logística'),
        ('admin', 'Administrador'),
    ]
    role = models.CharField('Função', max_length=30, choices=ROLE_CHOICES)
    phone = models.CharField('Telefone', max_length=15, blank=True)
    cpf = models.CharField('CPF', max_length=11, unique=True)
    
    # Campos adicionais para motoristas
    cnh_numero = models.CharField('Número CNH', max_length=20, blank=True)
    cnh_categoria = models.CharField('Categoria CNH', max_length=5, blank=True)
    cnh_validade = models.DateField('Validade CNH', null=True, blank=True)
    
    # Foto do perfil
    foto_perfil = models.ImageField('Foto de Perfil', upload_to='usuarios/perfil/', null=True, blank=True)
    
    # Gerenciador personalizado
    objects = CustomUserManager()
    
    # Campo usado para login
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['cpf']
    
    # Métodos auxiliares
    def is_motorista(self):
        return self.role == 'motorista'
    
    def is_logistica(self):
        return self.role == 'logistica'
    
    def is_admin(self):
        return self.role == 'admin'
    
    def __str__(self):
        return self.email