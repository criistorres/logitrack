# accounts/managers.py

from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    """
    Gerenciador de modelo customizado para o modelo de usuário personalizado
    com email como identificador único em vez de username.
    """
    def create_user(self, email, cpf, password=None, **extra_fields):
        """
        Cria e salva um usuário com o email e password fornecidos.
        """
        if not email:
            raise ValueError(_('O Email deve ser definido'))
        email = self.normalize_email(email)
        user = self.model(email=email, cpf=cpf, **extra_fields)
        if password:
            user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, cpf, password=None, **extra_fields):
        """
        Cria e salva um superusuário com o email e password fornecidos.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, cpf, password, **extra_fields)