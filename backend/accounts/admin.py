# Arquivo: backend/accounts/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Configuração do admin para o modelo CustomUser.
    
    Personaliza a interface de administração para exibir
    campos específicos do nosso modelo de usuário.
    """
    
    # Campos exibidos na lista de usuários
    list_display = (
        'email',
        'full_name',
        'role',
        'is_active',
        'is_staff',
        'date_joined',
        'foto_preview'
    )
    
    # Campos que podem ser usados para filtrar
    list_filter = (
        'role',
        'is_active',
        'is_staff',
        'is_superuser',
        'date_joined',
        'cnh_categoria'
    )
    
    # Campos de busca
    search_fields = ('email', 'first_name', 'last_name', 'cpf')
    
    # Ordenação padrão
    ordering = ('-date_joined',)
    
    # Campos somente leitura
    readonly_fields = ('date_joined', 'last_login', 'foto_preview')
    
    # Configuração dos fieldsets (seções) no formulário de edição
    fieldsets = (
        ('Informações de Login', {
            'fields': ('email', 'password')
        }),
        ('Informações Pessoais', {
            'fields': ('first_name', 'last_name', 'cpf', 'phone', 'foto_perfil', 'foto_preview')
        }),
        ('Função e Permissões', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('CNH (Motoristas)', {
            'fields': ('cnh_numero', 'cnh_categoria', 'cnh_validade'),
            'classes': ('collapse',)  # Seção colapsível
        }),
        ('Datas Importantes', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )
    
    # Configuração para criação de novos usuários
    add_fieldsets = (
        ('Informações Obrigatórias', {
            'classes': ('wide',),
            'fields': ('email', 'cpf', 'password1', 'password2'),
        }),
        ('Informações Pessoais', {
            'fields': ('first_name', 'last_name', 'phone', 'role'),
        }),
        ('CNH (se motorista)', {
            'fields': ('cnh_numero', 'cnh_categoria', 'cnh_validade'),
            'classes': ('collapse',)
        }),
    )
    
    def foto_preview(self, obj):
        """
        Exibe preview da foto de perfil no admin.
        
        Args:
            obj (CustomUser): Instância do usuário
            
        Returns:
            str: HTML para exibir a imagem ou texto "Sem foto"
        """
        if obj.foto_perfil:
            return format_html(
                '<img src="{}" width="50" height="50" style="border-radius: 50%;" />',
                obj.foto_perfil.url
            )
        return "Sem foto"
    
    foto_preview.short_description = 'Foto'
    
    def get_queryset(self, request):
        """
        Otimiza a query para evitar N+1 queries.
        """
        return super().get_queryset(request).select_related()