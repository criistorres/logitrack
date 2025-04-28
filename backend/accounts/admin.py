# accounts/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from .forms import CustomUserCreationForm, CustomUserChangeForm

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ('email', 'cpf', 'first_name', 'last_name', 'role', 'is_active')
    list_filter = ('role', 'is_active', 'is_staff')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informações Pessoais', {'fields': ('first_name', 'last_name', 'cpf', 'phone', 'foto_perfil')}),
        ('Função', {'fields': ('role',)}),
        ('Informações CNH', {'fields': ('cnh_numero', 'cnh_categoria', 'cnh_validade')}),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas Importantes', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'cpf', 'password1', 'password2', 'role', 'is_active')}
        ),
    )
    search_fields = ('email', 'first_name', 'last_name', 'cpf')
    ordering = ('email',)

admin.site.register(CustomUser, CustomUserAdmin)