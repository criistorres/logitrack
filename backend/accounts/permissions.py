# ==============================================================================
# PERMISSÕES CUSTOMIZADAS PARA O SISTEMA LOGITRACK
# ==============================================================================

# Arquivo: backend/accounts/permissions.py
# Crie este arquivo na pasta accounts/

from rest_framework import permissions


class IsLogisticaOrAdmin(permissions.BasePermission):
    """
    Permissão customizada: Apenas usuários de logística ou administradores.
    
    🎯 USADO PARA:
    - Ativar/desativar usuários
    - Gerenciar outros usuários
    - Aprovar transferências
    - Visualizar todos os dados
    
    🐛 DEBUGGING:
    - Coloque breakpoint no método has_permission()
    - Teste com diferentes tipos de usuário
    """
    
    message = "Apenas usuários de logística ou administradores podem realizar esta ação."
    
    def has_permission(self, request, view):
        """
        Verifica se usuário tem permissão para acessar a view.
        
        🐛 DEBUGGING: Coloque breakpoint aqui para ver verificação de permissões
        """
        print(f"🔐 PERMISSION CHECK: IsLogisticaOrAdmin")
        print(f"🔐 Usuário: {request.user}")
        print(f"🔐 Autenticado: {request.user.is_authenticated}")
        
        # Deve estar autenticado
        if not request.user.is_authenticated:
            print(f"❌ Usuário não autenticado")
            return False
        
        # Verificar role
        user_role = request.user.role
        print(f"🔐 Role do usuário: {user_role}")
        
        is_allowed = user_role in ['logistica', 'admin']
        print(f"🔐 Permissão concedida: {is_allowed}")
        
        return is_allowed
    
    def has_object_permission(self, request, view, obj):
        """
        Verifica permissões específicas do objeto.
        
        🐛 DEBUGGING: Para operações em objetos específicos
        """
        print(f"🔐 OBJECT PERMISSION CHECK: {obj}")
        
        # Mesma lógica que has_permission para este caso
        return self.has_permission(request, view)


class IsOwnerOrLogisticaOrAdmin(permissions.BasePermission):
    """
    Permissão customizada: Dono do objeto, logística ou admin.
    
    🎯 USADO PARA:
    - Editar próprio perfil
    - Ver próprias OTs
    - Editar próprios dados
    
    🐛 DEBUGGING: Teste com usuário dono vs usuário diferente
    """
    
    message = "Você só pode acessar seus próprios dados ou ser da equipe de logística/admin."
    
    def has_permission(self, request, view):
        """
        Permissão básica: usuário deve estar autenticado.
        """
        print(f"🔐 PERMISSION CHECK: IsOwnerOrLogisticaOrAdmin")
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Verifica se usuário é dono do objeto ou tem privilégios.
        
        🐛 DEBUGGING: Coloque breakpoint aqui
        """
        print(f"🔐 OBJECT PERMISSION CHECK:")
        print(f"  - Usuário logado: {request.user.email}")
        print(f"  - Objeto: {obj}")
        print(f"  - Role: {request.user.role}")
        
        # Se é logística ou admin, pode tudo
        if request.user.role in ['logistica', 'admin']:
            print(f"✅ Acesso por privilégio (logística/admin)")
            return True
        
        # Se é o próprio usuário
        if hasattr(obj, 'id') and obj.id == request.user.id:
            print(f"✅ Acesso por ownership (próprio usuário)")
            return True
        
        # Se objeto tem user field (ex: OT tem motorista)
        if hasattr(obj, 'user') and obj.user == request.user:
            print(f"✅ Acesso por ownership (campo user)")
            return True
        
        # Se objeto tem motorista_retirada field
        if hasattr(obj, 'motorista_retirada') and obj.motorista_retirada == request.user:
            print(f"✅ Acesso por ownership (motorista_retirada)")
            return True
        
        # Se objeto tem motorista_entrega field
        if hasattr(obj, 'motorista_entrega') and obj.motorista_entrega == request.user:
            print(f"✅ Acesso por ownership (motorista_entrega)")
            return True
        
        print(f"❌ Acesso negado")
        return False


class IsAdminOnly(permissions.BasePermission):
    """
    Permissão customizada: Apenas administradores.
    
    🎯 USADO PARA:
    - Deletar usuários
    - Configurações do sistema
    - Logs de auditoria
    - Relatórios avançados
    """
    
    message = "Apenas administradores podem realizar esta ação."
    
    def has_permission(self, request, view):
        """
        Verifica se usuário é administrador.
        """
        print(f"🔐 PERMISSION CHECK: IsAdminOnly")
        print(f"🔐 Usuário: {request.user.email if request.user.is_authenticated else 'Anônimo'}")
        
        if not request.user.is_authenticated:
            print(f"❌ Usuário não autenticado")
            return False
        
        is_admin = request.user.role == 'admin'
        print(f"🔐 É admin: {is_admin}")
        
        return is_admin


class IsSelfOrLogisticaOrAdmin(permissions.BasePermission):
    """
    Permissão customizada: Próprio usuário, logística ou admin.
    
    🎯 USADO PARA:
    - Editar próprio perfil
    - Ver próprios dados
    - Operações de self-service
    """
    
    message = "Você só pode realizar esta ação em sua própria conta ou ser da equipe de logística/admin."
    
    def has_permission(self, request, view):
        """
        Permissão básica: usuário deve estar autenticado.
        """
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Verifica se é o próprio usuário ou tem privilégios.
        """
        print(f"🔐 SELF PERMISSION CHECK:")
        print(f"  - Usuário logado: {request.user.email}")
        print(f"  - Objeto usuário: {obj.email}")
        print(f"  - Role: {request.user.role}")
        
        # Se é logística ou admin, pode tudo
        if request.user.role in ['logistica', 'admin']:
            print(f"✅ Acesso por privilégio")
            return True
        
        # Se é o próprio usuário
        if obj == request.user:
            print(f"✅ Acesso próprio usuário")
            return True
        
        print(f"❌ Acesso negado")
        return False


# ==============================================================================
# FUNÇÕES HELPER PARA VERIFICAR PERMISSÕES
# ==============================================================================

def user_can_manage_users(user):
    """
    Função helper: Verifica se usuário pode gerenciar outros usuários.
    
    Args:
        user: Instância do CustomUser
        
    Returns:
        bool: True se pode gerenciar usuários
    """
    if not user.is_authenticated:
        return False
    
    return user.role in ['logistica', 'admin']


def user_can_view_all_data(user):
    """
    Função helper: Verifica se usuário pode ver todos os dados.
    
    Args:
        user: Instância do CustomUser
        
    Returns:
        bool: True se pode ver todos os dados
    """
    if not user.is_authenticated:
        return False
    
    return user.role in ['logistica', 'admin']


def user_can_approve_transfers(user):
    """
    Função helper: Verifica se usuário pode aprovar transferências.
    
    Args:
        user: Instância do CustomUser
        
    Returns:
        bool: True se pode aprovar transferências
    """
    if not user.is_authenticated:
        return False
    
    return user.role in ['logistica', 'admin']


# ==============================================================================
# DEBUGGING HELPERS
# ==============================================================================

def debug_user_permissions(user, action=""):
    """
    Função para debuggar permissões de um usuário.
    
    Args:
        user: Instância do CustomUser
        action: String descrevendo a ação sendo testada
    """
    print(f"\n🔐 === DEBUG PERMISSÕES ({action}) ===")
    print(f"Usuário: {user.email if user.is_authenticated else 'Anônimo'}")
    print(f"Autenticado: {user.is_authenticated}")
    
    if user.is_authenticated:
        print(f"Role: {user.role}")
        print(f"Ativo: {user.is_active}")
        print(f"Pode gerenciar usuários: {user_can_manage_users(user)}")
        print(f"Pode ver todos os dados: {user_can_view_all_data(user)}")
        print(f"Pode aprovar transferências: {user_can_approve_transfers(user)}")
        print(f"É motorista: {user.is_motorista()}")
        print(f"É logística: {user.is_logistica()}")
        print(f"É admin: {user.is_admin()}")
    
    print(f"🔐 ==============================\n")


# ==============================================================================
# EXEMPLO DE USO NAS VIEWS
# ==============================================================================

"""
🎯 COMO USAR ESSAS PERMISSÕES NAS VIEWS:

# Para view que só logística/admin pode acessar:
class ActivateUserView(APIView):
    permission_classes = [IsLogisticaOrAdmin]

# Para view que dono ou logística/admin pode acessar:
class UserProfileView(RetrieveUpdateAPIView):
    permission_classes = [IsOwnerOrLogisticaOrAdmin]

# Para view que só admin pode acessar:
class DeleteUserView(DestroyAPIView):
    permission_classes = [IsAdminOnly]

# Para verificar permissões manualmente:
if user_can_manage_users(request.user):
    # fazer alguma coisa
    pass

# Para debuggar:
debug_user_permissions(request.user, "Tentativa de ativação")
"""