# accounts/forms.py

from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    """
    Formulário para criação de novos usuários no admin.
    """
    class Meta:
        model = CustomUser
        fields = ('email', 'cpf', 'role')

class CustomUserChangeForm(UserChangeForm):
    """
    Formulário para atualização de usuários no admin.
    """
    class Meta:
        model = CustomUser
        fields = ('email', 'cpf', 'role')