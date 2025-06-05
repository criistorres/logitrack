# ==============================================================================
# PERMISSÕES PARA ORDENS DE TRANSPORTE
# ==============================================================================

# Arquivo: backend/core/permissions.py
# CRIE este arquivo na pasta core/

from rest_framework import permissions
from .models import OrdemTransporte


class IsOwnerOrLogisticaOrAdmin(permissions.BasePermission):
    """
    Permissão: Dono da OT, logística ou admin.
    
    🎯 USADO PARA:
    - Ver detalhes da OT
    - Editar OT (se for dono)
    - Upload de arquivos
    
    🔐 REGRAS:
    - Motorista: apenas suas próprias OTs
    - Logística/Admin: todas as OTs
    """
    
    message = "Você só pode acessar suas próprias OTs ou ser da equipe de logística/admin."
    
    def has_permission(self, request, view):
        """
        Permissão básica: usuário deve estar autenticado.
        """
        print(f"🔐 OT PERMISSION: Verificando permissão básica")
        print(f"🔐 Usuário: {request.user.email if request.user.is_authenticated else 'Anônimo'}")
        
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Verifica se usuário pode acessar a OT específica.
        
        🐛 DEBUGGING: Coloque breakpoint aqui para ver verificação
        """
        print(f"🔐 OT OBJECT PERMISSION:")
        print(f"  - Usuário: {request.user.email}")
        print(f"  - OT: {obj.numero_ot}")
        print(f"  - Motorista atual: {obj.motorista_atual.email}")
        print(f"  - Role do usuário: {request.user.role}")
        
        # Se é logística ou admin, pode tudo
        if request.user.role in ['logistica', 'admin']:
            print(f"✅ Acesso liberado - Logística/Admin")
            return True
        
        # Se é o motorista atual da OT
        if obj.motorista_atual == request.user:
            print(f"✅ Acesso liberado - Motorista atual")
            return True
        
        # Se é o motorista que criou a OT
        if obj.motorista_criador == request.user:
            print(f"✅ Acesso liberado - Motorista criador")
            return True
        
        print(f"❌ Acesso negado")
        return False


class CanCreateOT(permissions.BasePermission):
    """
    Permissão: Apenas motoristas podem criar OTs.
    
    🎯 USADO PARA:
    - POST /api/ots/ (criar OT)
    
    🔐 REGRAS:
    - Apenas usuários com role 'motorista'
    - Usuário deve estar ativo
    """
    
    message = "Apenas motoristas podem criar Ordens de Transporte."
    
    def has_permission(self, request, view):
        """
        Verifica se usuário pode criar OTs.
        """
        print(f"🔐 CREATE OT PERMISSION:")
        print(f"  - Usuário: {request.user.email if request.user.is_authenticated else 'Anônimo'}")
        print(f"  - Role: {request.user.role if request.user.is_authenticated else 'N/A'}")
        print(f"  - Ativo: {request.user.is_active if request.user.is_authenticated else 'N/A'}")
        
        if not request.user.is_authenticated:
            print(f"❌ Usuário não autenticado")
            return False
        
        if request.user.role != 'motorista':
            print(f"❌ Usuário não é motorista: {request.user.role}")
            return False
        
        if not request.user.is_active:
            print(f"❌ Usuário inativo")
            return False
        
        print(f"✅ Pode criar OT")
        return True


class CanTransferOT(permissions.BasePermission):
    """
    Permissão: Transferir OTs.
    
    🎯 USADO PARA:
    - POST /api/ots/{id}/transferir/
    
    🔐 REGRAS:
    - Motorista atual: pode transferir diretamente
    - Outros motoristas: podem solicitar transferência
    - Logística/Admin: podem aprovar transferências
    """
    
    message = "Você não tem permissão para transferir esta OT."
    
    def has_permission(self, request, view):
        """
        Permissão básica: usuário autenticado.
        """
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Verifica permissões específicas para transferência.
        
        🐛 DEBUGGING: Coloque breakpoint aqui
        """
        print(f"🔐 TRANSFER PERMISSION:")
        print(f"  - Usuário: {request.user.email}")
        print(f"  - OT: {obj.numero_ot}")
        print(f"  - Motorista atual: {obj.motorista_atual.email}")
        print(f"  - OT pode ser transferida: {obj.pode_ser_transferida}")
        
        # Verificar se OT pode ser transferida
        if not obj.pode_ser_transferida:
            print(f"❌ OT não pode ser transferida no status: {obj.status}")
            return False
        
        # Logística e admin podem sempre transferir
        if request.user.role in ['logistica', 'admin']:
            print(f"✅ Pode transferir - Logística/Admin")
            return True
        
        # Motoristas podem transferir/solicitar
        if request.user.role == 'motorista':
            print(f"✅ Pode transferir/solicitar - Motorista")
            return True
        
        print(f"❌ Sem permissão para transferir")
        return False


class CanApproveTransfer(permissions.BasePermission):
    """
    Permissão: Aprovar transferências.
    
    🎯 USADO PARA:
    - POST /api/transferencias/{id}/aprovar/
    - POST /api/transferencias/{id}/rejeitar/
    
    🔐 REGRAS:
    - Apenas logística e admin
    """
    
    message = "Apenas a equipe de logística pode aprovar transferências."
    
    def has_permission(self, request, view):
        """
        Verifica se usuário pode aprovar transferências.
        """
        print(f"🔐 APPROVE TRANSFER PERMISSION:")
        print(f"  - Usuário: {request.user.email if request.user.is_authenticated else 'Anônimo'}")
        print(f"  - Role: {request.user.role if request.user.is_authenticated else 'N/A'}")
        
        if not request.user.is_authenticated:
            print(f"❌ Usuário não autenticado")
            return False
        
        if request.user.role not in ['logistica', 'admin']:
            print(f"❌ Usuário não é logística/admin: {request.user.role}")
            return False
        
        print(f"✅ Pode aprovar transferências")
        return True


class CanUpdateOTStatus(permissions.BasePermission):
    """
    Permissão: Atualizar status da OT.
    
    🎯 USADO PARA:
    - PATCH /api/ots/{id}/status/
    - POST /api/ots/{id}/finalizar/
    
    🔐 REGRAS:
    - Motorista atual da OT
    - Logística/Admin
    """
    
    message = "Você não pode atualizar o status desta OT."
    
    def has_permission(self, request, view):
        """
        Permissão básica: usuário autenticado.
        """
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Verifica se pode atualizar status da OT.
        """
        print(f"🔐 UPDATE STATUS PERMISSION:")
        print(f"  - Usuário: {request.user.email}")
        print(f"  - OT: {obj.numero_ot}")
        print(f"  - Motorista atual: {obj.motorista_atual.email}")
        print(f"  - OT pode ser editada: {obj.pode_ser_editada}")
        
        # Verificar se OT pode ser editada
        if not obj.pode_ser_editada:
            print(f"❌ OT finalizada, não pode ser editada")
            return False
        
        # Logística e admin podem sempre
        if request.user.role in ['logistica', 'admin']:
            print(f"✅ Pode atualizar - Logística/Admin")
            return True
        
        # Motorista atual pode atualizar
        if obj.motorista_atual == request.user:
            print(f"✅ Pode atualizar - Motorista atual")
            return True
        
        print(f"❌ Sem permissão para atualizar status")
        return False


class CanViewAllOTs(permissions.BasePermission):
    """
    Permissão: Ver todas as OTs.
    
    🎯 USADO PARA:
    - GET /api/ots/ (lista completa)
    - Relatórios e dashboards
    
    🔐 REGRAS:
    - Logística e admin: veem todas
    - Motoristas: apenas suas próprias (implementado na view)
    """
    
    message = "Você só pode ver suas próprias OTs."
    
    def has_permission(self, request, view):
        """
        Verifica se usuário pode ver lista de OTs.
        
        🔍 NOTA: A filtragem real acontece na view, não aqui.
        Esta permission apenas verifica se usuário está autenticado.
        """
        print(f"🔐 VIEW ALL OTS PERMISSION:")
        print(f"  - Usuário: {request.user.email if request.user.is_authenticated else 'Anônimo'}")
        print(f"  - Role: {request.user.role if request.user.is_authenticated else 'N/A'}")
        
        if not request.user.is_authenticated:
            print(f"❌ Usuário não autenticado")
            return False
        
        print(f"✅ Pode listar OTs (filtradas na view)")
        return True


# ==============================================================================
# 🛠️ FUNÇÕES HELPER PARA VERIFICAR PERMISSÕES
# ==============================================================================

def user_can_edit_ot(user, ot):
    """
    Verifica se usuário pode editar uma OT específica.
    
    Args:
        user: Instância do CustomUser
        ot: Instância da OrdemTransporte
        
    Returns:
        bool: True se pode editar
    """
    if not user.is_authenticated:
        return False
    
    # OT finalizada não pode ser editada
    if not ot.pode_ser_editada:
        return False
    
    # Logística e admin podem editar qualquer OT
    if user.role in ['logistica', 'admin']:
        return True
    
    # Motorista atual pode editar
    if ot.motorista_atual == user:
        return True
    
    return False


def user_can_transfer_ot(user, ot):
    """
    Verifica se usuário pode transferir uma OT específica.
    
    Args:
        user: Instância do CustomUser
        ot: Instância da OrdemTransporte
        
    Returns:
        bool: True se pode transferir
    """
    if not user.is_authenticated:
        return False
    
    # OT deve poder ser transferida
    if not ot.pode_ser_transferida:
        return False
    
    # Logística e admin podem transferir qualquer OT
    if user.role in ['logistica', 'admin']:
        return True
    
    # Motoristas podem transferir/solicitar
    if user.role == 'motorista':
        return True
    
    return False


def user_can_view_ot(user, ot):
    """
    Verifica se usuário pode visualizar uma OT específica.
    
    Args:
        user: Instância do CustomUser
        ot: Instância da OrdemTransporte
        
    Returns:
        bool: True se pode visualizar
    """
    if not user.is_authenticated:
        return False
    
    # Logística e admin podem ver qualquer OT
    if user.role in ['logistica', 'admin']:
        return True
    
    # Motorista atual pode ver
    if ot.motorista_atual == user:
        return True
    
    # Motorista criador pode ver
    if ot.motorista_criador == user:
        return True
    
    return False


def get_user_ots_queryset(user):
    """
    Retorna queryset de OTs que o usuário pode visualizar.
    
    Args:
        user: Instância do CustomUser
        
    Returns:
        QuerySet: OTs que o usuário pode ver
    """
    from django.db.models import Q
    
    if not user.is_authenticated:
        return OrdemTransporte.objects.none()
    
    # Logística e admin veem todas
    if user.role in ['logistica', 'admin']:
        return OrdemTransporte.objects.all()
    
    # Motoristas veem apenas suas OTs (atual ou criadas)
    return OrdemTransporte.objects.filter(
        Q(motorista_atual=user) | Q(motorista_criador=user)
    ).distinct()


# ==============================================================================
# 🛠️ DEBUGGING HELPERS
# ==============================================================================

def debug_ot_permissions(user, ot, action=""):
    """
    Função para debuggar permissões de OT.
    
    Args:
        user: Instância do CustomUser
        ot: Instância da OrdemTransporte
        action: String descrevendo a ação sendo testada
    """
    print(f"\n🔐 === DEBUG OT PERMISSIONS ({action}) ===")
    print(f"Usuário: {user.email if user.is_authenticated else 'Anônimo'}")
    print(f"Role: {user.role if user.is_authenticated else 'N/A'}")
    print(f"OT: {ot.numero_ot}")
    print(f"Status OT: {ot.status} ({ot.get_status_display()})")
    print(f"Motorista atual: {ot.motorista_atual.email}")
    print(f"Motorista criador: {ot.motorista_criador.email}")
    
    if user.is_authenticated:
        print(f"\n📋 Permissões calculadas:")
        print(f"Pode visualizar: {user_can_view_ot(user, ot)}")
        print(f"Pode editar: {user_can_edit_ot(user, ot)}")
        print(f"Pode transferir: {user_can_transfer_ot(user, ot)}")
        print(f"OT pode ser editada: {ot.pode_ser_editada}")
        print(f"OT pode ser transferida: {ot.pode_ser_transferida}")
        print(f"OT está finalizada: {ot.esta_finalizada}")
    
    print(f"🔐 ==============================\n")


# ==============================================================================
# MIXINS PARA VIEWS
# ==============================================================================

class OTPermissionMixin:
    """
    Mixin para facilitar verificação de permissões em views de OT.
    """
    
    def check_ot_permission(self, ot, action):
        """
        Verifica permissão específica para uma OT.
        
        Args:
            ot: Instância da OrdemTransporte
            action: 'view', 'edit', 'transfer', 'status'
            
        Returns:
            bool: True se tem permissão
        """
        user = self.request.user
        
        if action == 'view':
            return user_can_view_ot(user, ot)
        elif action == 'edit':
            return user_can_edit_ot(user, ot)
        elif action == 'transfer':
            return user_can_transfer_ot(user, ot)
        elif action == 'status':
            return user_can_edit_ot(user, ot)  # Mesma regra que editar
        
        return False
    
    def get_user_ots(self):
        """
        Retorna OTs que o usuário pode visualizar.
        """
        return get_user_ots_queryset(self.request.user)


# ==============================================================================
# EXEMPLO DE USO NAS VIEWS
# ==============================================================================

"""
🎯 COMO USAR ESSAS PERMISSÕES NAS VIEWS:

# Para view de listagem de OTs:
class OrdemTransporteListView(APIView):
    permission_classes = [CanViewAllOTs]
    
    def get_queryset(self):
        return get_user_ots_queryset(self.request.user)

# Para view de detalhes:
class OrdemTransporteDetailView(RetrieveAPIView):
    permission_classes = [IsOwnerOrLogisticaOrAdmin]

# Para view de criação:
class OrdemTransporteCreateView(CreateAPIView):
    permission_classes = [CanCreateOT]

# Para view de transferência:
class TransferirOTView(APIView):
    permission_classes = [CanTransferOT]

# Para debugging:
debug_ot_permissions(request.user, ot, "Tentativa de edição")
"""