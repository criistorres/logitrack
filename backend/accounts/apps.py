# Arquivo: backend/accounts/apps.py

from django.apps import AppConfig


class AccountsConfig(AppConfig):
    """
    Configuração da aplicação accounts.
    
    Esta aplicação gerencia usuários customizados, autenticação
    e permissões do sistema LogiTrack.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    verbose_name = 'Gerenciamento de Usuários'
    
    def ready(self):
        """
        Método executado quando a aplicação está pronta.
        Usado para registrar signals ou outras configurações iniciais.
        """
        pass  # Adicionar signals aqui no futuro, se necessário