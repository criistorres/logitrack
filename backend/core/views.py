# ==============================================================================
# VIEWS DA API - ORDENS DE TRANSPORTE
# ==============================================================================

# Arquivo: backend/core/views.py
# SUBSTITUA COMPLETAMENTE o conteúdo do arquivo views.py

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
import logging

from .models import OrdemTransporte, Arquivo, TransferenciaOT, AtualizacaoOT
from .serializers import (
    OrdemTransporteCreateSerializer,
    OrdemTransporteListSerializer,
    OrdemTransporteDetailSerializer,
    OrdemTransporteUpdateSerializer,
    OrdemTransporteStatusSerializer,
    OrdemTransporteFinalizarSerializer,
    ArquivoSerializer,
    TransferenciaOTCreateSerializer,
    TransferenciaOTSerializer,
    TransferenciaAceitarSerializer,
    TransferenciaRecusarSerializer,
    TransferenciaCancelarSerializer,
    TransferenciaAprovarSerializer,
    TransferenciaRejeitarSerializer,
    debug_ot_serializer_flow
)
from .permissions import (
    CanCreateOT,
    IsOwnerOrLogisticaOrAdmin,
    CanTransferOT,
    CanUpdateOTStatus,
    CanViewAllOTs,
    CanApproveTransfer,
    OTPermissionMixin,
    get_user_ots_queryset,
    debug_ot_permissions
)

logger = logging.getLogger(__name__)

# ==============================================================================
# 🚚 VIEWS PRINCIPAIS - CRUD DE ORDENS DE TRANSPORTE
# ==============================================================================

class OrdemTransporteListCreateView(generics.ListCreateAPIView, OTPermissionMixin):
    """
    🎯 PROPÓSITO: Listar e criar Ordens de Transporte
    
    GET /api/ots/ - Lista OTs do usuário (motorista) ou todas (logística/admin)
    POST /api/ots/ - Cria nova OT (apenas motoristas)
    
    🔍 DEBUGGING:
    1. Coloque breakpoint em get_queryset() para ver filtragem
    2. Coloque breakpoint em create() para ver criação
    3. Teste com diferentes tipos de usuário
    """
    
    def get_permissions(self):
        """
        Define permissões baseadas no método HTTP.
        """
        if self.request.method == 'POST':
            permission_classes = [CanCreateOT]
        else:
            permission_classes = [CanViewAllOTs]
        
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """
        Define serializer baseado no método HTTP.
        """
        if self.request.method == 'POST':
            return OrdemTransporteCreateSerializer
        return OrdemTransporteListSerializer
    
    def get_queryset(self):
        """
        Retorna OTs que o usuário pode visualizar.
        
        🐛 DEBUGGING: Coloque breakpoint aqui para ver filtragem
        """
        print(f"🚚 LIST OTs: Listando OTs para {self.request.user.email}")
        print(f"🚚 Role: {self.request.user.role}")
        
        # Usar helper de permissões para filtrar
        queryset = get_user_ots_queryset(self.request.user)
        
        # Filtros opcionais via query params
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            print(f"🚚 Filtro status aplicado: {status_filter}")
        
        motorista_filter = self.request.query_params.get('motorista')
        if motorista_filter and self.request.user.role in ['logistica', 'admin']:
            queryset = queryset.filter(motorista_atual_id=motorista_filter)
            print(f"🚚 Filtro motorista aplicado: {motorista_filter}")
        
        # Ordenar por data de criação (mais recentes primeiro)
        queryset = queryset.order_by('-data_criacao')
        
        # Otimizar queries
        queryset = queryset.select_related('motorista_criador', 'motorista_atual')
        
        print(f"🚚 Total de OTs retornadas: {queryset.count()}")
        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        Cria nova Ordem de Transporte.
        
        🐛 DEBUGGING: Coloque breakpoint aqui para ver processo completo
        """
        print(f"🚚 CREATE OT: Usuário {request.user.email} criando nova OT")
        print(f"🚚 Dados recebidos: {request.data}")
        
        # Criar serializer
        serializer = self.get_serializer(data=request.data)
        debug_ot_serializer_flow(serializer, "Serializer de criação criado")
        
        # Validar dados
        if serializer.is_valid():
            print(f"✅ Dados válidos, criando OT...")
            debug_ot_serializer_flow(serializer, "Após validação bem-sucedida")
            
            # Salvar OT
            ot = serializer.save()
            
            print(f"✅ OT criada com sucesso: {ot.numero_ot}")
            
            # Retornar dados completos da OT criada
            response_serializer = OrdemTransporteDetailSerializer(ot)
            
            return Response({
                'success': True,
                'message': f'Ordem de Transporte {ot.numero_ot} criada com sucesso',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            print(f"❌ Dados inválidos: {serializer.errors}")
            debug_ot_serializer_flow(serializer, "Após validação com erros")
            
            return Response({
                'success': False,
                'message': 'Dados inválidos para criação da OT',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def list(self, request, *args, **kwargs):
        """
        Lista OTs com metadados adicionais.
        """
        print(f"🚚 LIST: Listando OTs para {request.user.email}")
        
        response = super().list(request, *args, **kwargs)
        
        # Adicionar metadados à resposta
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'por_status': {
                'iniciada': queryset.filter(status='INICIADA').count(),
                'em_carregamento': queryset.filter(status='EM_CARREGAMENTO').count(),
                'em_transito': queryset.filter(status='EM_TRANSITO').count(),
                'entregue': queryset.filter(status='ENTREGUE').count(),
                'entregue_parcial': queryset.filter(status='ENTREGUE_PARCIAL').count(),
                'cancelada': queryset.filter(status='CANCELADA').count(),
            }
        }
        
        return Response({
            'success': True,
            'message': 'Lista de OTs recuperada',
            'data': response.data,
            'stats': stats
        })


class OrdemTransporteDetailView(generics.RetrieveUpdateAPIView, OTPermissionMixin):
    """
    🎯 PROPÓSITO: Ver e editar detalhes de uma OT específica
    
    GET /api/ots/{id}/ - Visualizar OT completa
    PUT/PATCH /api/ots/{id}/ - Editar OT
    
    🔍 DEBUGGING:
    1. Coloque breakpoint em get_object() para ver recuperação
    2. Coloque breakpoint em update() para ver edições
    3. Teste permissões com diferentes usuários
    """
    
    queryset = OrdemTransporte.objects.all()
    permission_classes = [IsOwnerOrLogisticaOrAdmin]
    
    def get_serializer_class(self):
        """
        Define serializer baseado no método HTTP.
        """
        if self.request.method in ['PUT', 'PATCH']:
            return OrdemTransporteUpdateSerializer
        return OrdemTransporteDetailSerializer
    
    def get_object(self):
        """
        Recupera OT com otimizações de query.
        
        🐛 DEBUGGING: Coloque breakpoint aqui
        """
        obj = get_object_or_404(
            OrdemTransporte.objects.select_related(
                'motorista_criador', 'motorista_atual'
            ).prefetch_related(
                'arquivos__enviado_por',
                'transferencias__motorista_origem',
                'transferencias__motorista_destino',
                'transferencias__solicitado_por',
                'transferencias__aprovado_por',
                'atualizacoes__usuario'
            ),
            pk=self.kwargs['pk']
        )
        
        print(f"🚚 GET OT: Recuperando OT {obj.numero_ot}")
        print(f"🚚 Solicitante: {self.request.user.email}")
        
        # Debug de permissões
        debug_ot_permissions(self.request.user, obj, "Visualização de detalhes")
        
        # Verificar permissões do objeto
        self.check_object_permissions(self.request, obj)
        
        return obj
    
    def retrieve(self, request, *args, **kwargs):
        """
        Recupera dados completos da OT.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'message': f'Detalhes da OT {instance.numero_ot} recuperados',
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        """
        Atualiza dados da OT.
        
        🐛 DEBUGGING: Coloque breakpoint aqui para ver edições
        """
        instance = self.get_object()
        
        print(f"🚚 UPDATE OT: Atualizando {instance.numero_ot}")
        print(f"🚚 Usuário: {request.user.email}")
        print(f"🚚 Dados: {request.data}")
        
        # Verificar se OT pode ser editada
        if not instance.pode_ser_editada:
            print(f"❌ OT não pode ser editada (status: {instance.status})")
            return Response({
                'success': False,
                'message': 'Esta OT não pode mais ser editada',
                'data': {'status': instance.status, 'finalizada': instance.esta_finalizada}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Debug de permissões
        debug_ot_permissions(request.user, instance, "Edição de OT")
        
        # Executar update
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            print(f"✅ Dados válidos, atualizando...")
            debug_ot_serializer_flow(serializer, "Antes do update")
            
            updated_instance = serializer.save()
            
            print(f"✅ OT {updated_instance.numero_ot} atualizada com sucesso")
            
            # Retornar dados completos atualizados
            response_serializer = OrdemTransporteDetailSerializer(updated_instance)
            
            return Response({
                'success': True,
                'message': f'OT {updated_instance.numero_ot} atualizada com sucesso',
                'data': response_serializer.data
            })
        else:
            print(f"❌ Dados inválidos: {serializer.errors}")
            debug_ot_serializer_flow(serializer, "Erros de validação")
            
            return Response({
                'success': False,
                'message': 'Dados inválidos para atualização',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


# ==============================================================================
# 🔄 VIEWS DE AÇÕES ESPECÍFICAS
# ==============================================================================

class TransferirOTView(APIView, OTPermissionMixin):
    """
    🎯 PROPÓSITO: Transferir OT para outro motorista
    
    POST /api/ots/{id}/transferir/
    
    🔍 DEBUGGING:
    1. Coloque breakpoint no post() para ver processo completo
    2. Teste transferência direta vs solicitação
    3. Observe diferença entre motorista atual vs outro motorista
    """
    
    permission_classes = [CanTransferOT]
    
    def get_object(self):
        """Recupera a OT a ser transferida."""
        obj = get_object_or_404(OrdemTransporte, pk=self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)
        return obj
    
    def post(self, request, pk):
        """
        Transfere ou solicita transferência de OT.
        
        Body esperado:
        {
            "motorista_destino_id": 123,
            "motivo": "Motivo da transferência",
            "latitude": -23.5505,
            "longitude": -46.6333,
            "endereco": "Endereço atual"
        }
        
        🐛 DEBUGGING: Coloque breakpoint aqui
        """
        print(f"🔄 TRANSFER OT: Iniciando transferência")
        print(f"🔄 OT ID: {pk}")
        print(f"🔄 Usuário: {request.user.email}")
        print(f"🔄 Dados: {request.data}")
        
        # Recuperar OT
        ot = self.get_object()
        
        print(f"🔄 OT: {ot.numero_ot}")
        print(f"🔄 Motorista atual: {ot.motorista_atual.email}")
        print(f"🔄 Status: {ot.status}")
        
        # Debug de permissões
        debug_ot_permissions(request.user, ot, "Transferência de OT")
        
        # Criar serializer com contexto
        serializer = TransferenciaOTCreateSerializer(
            data=request.data,
            context={
                'request': request,
                'ordem_transporte': ot
            }
        )
        
        debug_ot_serializer_flow(serializer, "Serializer de transferência criado")
        
        if serializer.is_valid():
            print(f"✅ Dados válidos, processando transferência...")
            debug_ot_serializer_flow(serializer, "Após validação bem-sucedida")
            
            # Salvar transferência
            transferencia = serializer.save()
            
            print(f"✅ Transferência criada: ID {transferencia.id}")
            print(f"🔄 Status da transferência: {transferencia.status}")
            
            # Preparar resposta baseada no tipo de transferência
            if transferencia.status == 'APROVADA':
                message = f'OT {ot.numero_ot} transferida com sucesso para {transferencia.motorista_destino.full_name}'
            else:
                message = f'Solicitação de transferência da OT {ot.numero_ot} enviada para aprovação'
            
            # Retornar dados da transferência
            response_serializer = TransferenciaOTSerializer(transferencia)
            
            return Response({
                'success': True,
                'message': message,
                'data': response_serializer.data,
                'ot_atualizada': OrdemTransporteDetailSerializer(ot).data
            }, status=status.HTTP_201_CREATED)
        else:
            print(f"❌ Dados inválidos: {serializer.errors}")
            debug_ot_serializer_flow(serializer, "Erros de validação")
            
            return Response({
                'success': False,
                'message': 'Dados inválidos para transferência',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

class TransferenciaOTDetailView(generics.RetrieveAPIView, OTPermissionMixin):
    """
    🎯 PROPÓSITO: Visualizar detalhes de uma transferência específica
    
    GET /api/ots/transferencias/{id}/
    
    🔍 DEBUGGING: Para verificar processo de recuperação de transferência:
    1. Coloque breakpoint em get_object() para ver permissões
    2. Teste com diferentes usuários (motorista origem, destino, logística)
    3. Verifique se retorna dados completos da transferência
    
    📋 CASOS DE USO:
    - Motorista verifica status de transferência que solicitou
    - Motorista verifica transferência que recebeu
    - Logística acompanha todas as transferências
    - App mobile mostra detalhes da transferência
    """
    
    serializer_class = TransferenciaOTSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """
        Recupera a transferência com validação de permissões.
        
        🔒 REGRAS DE PERMISSÃO:
        - Motorista origem: pode ver transferências que ele solicitou
        - Motorista destino: pode ver transferências para ele
        - Logística/Admin: pode ver todas as transferências
        
        🐛 DEBUGGING: Coloque breakpoint aqui para ver processo
        """
        print(f"🔍 GET TRANSFERENCIA: ID {self.kwargs['pk']}")
        print(f"🔍 Usuário: {self.request.user.email} ({self.request.user.role})")
        
        # Recuperar transferência
        transferencia = get_object_or_404(TransferenciaOT, pk=self.kwargs['pk'])
        
        print(f"🔍 Transferência encontrada:")
        print(f"   - OT: {transferencia.ordem_transporte.numero_ot}")
        print(f"   - De: {transferencia.motorista_origem.email}")
        print(f"   - Para: {transferencia.motorista_destino.email}")
        print(f"   - Status: {transferencia.status}")
        print(f"   - Solicitada por: {transferencia.solicitado_por.email}")
        
        user = self.request.user
        
        # Verificar permissões baseadas no role do usuário
        if user.role in ['logistica', 'admin']:
            print(f"✅ Permissão concedida: {user.role} pode ver todas as transferências")
            return transferencia
        
        # Motoristas só podem ver transferências relacionadas a eles
        if user.role == 'motorista':
            # Pode ver se é motorista origem, destino, ou solicitante
            if (user == transferencia.motorista_origem or 
                user == transferencia.motorista_destino or 
                user == transferencia.solicitado_por):
                print(f"✅ Permissão concedida: motorista está relacionado à transferência")
                return transferencia
            else:
                print(f"❌ Permissão negada: motorista não está relacionado à transferência")
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Você não tem permissão para ver esta transferência")
        
        # Fallback: negar acesso
        print(f"❌ Permissão negada: role não reconhecido ou sem permissão")
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("Você não tem permissão para ver esta transferência")
    
    def retrieve(self, request, *args, **kwargs):
        """
        Customiza a resposta GET para incluir dados adicionais.
        
        🔍 DEBUGGING: Coloque breakpoint aqui para ver resposta completa
        """
        print(f"🔍 RETRIEVE: Buscando detalhes da transferência")
        
        # Recuperar transferência
        transferencia = self.get_object()
        
        # Serializar dados
        serializer = self.get_serializer(transferencia)
        
        # Adicionar dados extras úteis para o frontend
        dados_extras = {
            'pode_aceitar': (
                request.user == transferencia.motorista_destino and 
                transferencia.status == 'AGUARDANDO_ACEITACAO'
            ),
            'pode_recusar': (
                request.user == transferencia.motorista_destino and 
                transferencia.status == 'AGUARDANDO_ACEITACAO'
            ),
            'pode_cancelar': (
                (request.user == transferencia.solicitado_por and 
                 transferencia.status in ['PENDENTE', 'AGUARDANDO_ACEITACAO']) or
                request.user.role in ['logistica', 'admin']
            ),
            'pode_aprovar': (
                request.user.role in ['logistica', 'admin'] and 
                transferencia.status == 'PENDENTE'
            ),
            'tempo_desde_solicitacao': (
                timezone.now() - transferencia.data_solicitacao
            ).total_seconds() / 3600,  # em horas
        }
        
        print(f"✅ Transferência recuperada com sucesso")
        print(f"   - Pode aceitar: {dados_extras['pode_aceitar']}")
        print(f"   - Pode recusar: {dados_extras['pode_recusar']}")
        print(f"   - Pode cancelar: {dados_extras['pode_cancelar']}")
        
        return Response({
            'success': True,
            'message': f'Detalhes da transferência da OT {transferencia.ordem_transporte.numero_ot}',
            'data': serializer.data,
            'meta': dados_extras
        })

class AtualizarStatusOTView(APIView, OTPermissionMixin):
    """
    🎯 PROPÓSITO: Atualizar apenas o status da OT
    
    PATCH /api/ots/{id}/status/
    
    🔍 DEBUGGING: Para ver mudanças de status com validação
    """
    
    permission_classes = [CanUpdateOTStatus]
    
    def get_object(self):
        """Recupera a OT."""
        obj = get_object_or_404(OrdemTransporte, pk=self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)
        return obj
    
    def patch(self, request, pk):
        """
        Atualiza status da OT.
        
        Body esperado:
        {
            "status": "EM_TRANSITO",
            "observacao": "Saindo do CD"
        }
        """
        print(f"🚚 UPDATE STATUS: Atualizando status da OT {pk}")
        print(f"🚚 Usuário: {request.user.email}")
        print(f"🚚 Dados: {request.data}")
        
        # Recuperar OT
        ot = self.get_object()
        
        print(f"🚚 OT: {ot.numero_ot}")
        print(f"🚚 Status atual: {ot.status}")
        
        # Debug de permissões
        debug_ot_permissions(request.user, ot, "Atualização de status")
        
        # Criar serializer
        serializer = OrdemTransporteStatusSerializer(
            ot,
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            print(f"✅ Dados válidos, atualizando status...")
            
            updated_ot = serializer.save()
            
            print(f"✅ Status atualizado: {updated_ot.status}")
            
            return Response({
                'success': True,
                'message': f'Status da OT {updated_ot.numero_ot} atualizado para {updated_ot.get_status_display()}',
                'data': OrdemTransporteDetailSerializer(updated_ot).data
            })
        else:
            print(f"❌ Dados inválidos: {serializer.errors}")
            
            return Response({
                'success': False,
                'message': 'Dados inválidos para atualização de status',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


class FinalizarOTView(APIView, OTPermissionMixin):
    """
    🎯 PROPÓSITO: Finalizar OT como entregue
    
    POST /api/ots/{id}/finalizar/
    
    🔍 DEBUGGING: Para ver processo de finalização
    """
    
    permission_classes = [CanUpdateOTStatus]
    
    def get_object(self):
        """Recupera a OT."""
        obj = get_object_or_404(OrdemTransporte, pk=self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)
        return obj
    
    def post(self, request, pk):
        """
        Finaliza OT como entregue.
        
        🔧 NOVA VALIDAÇÃO: Verifica se há arquivos anexados
        
        Body esperado:
        {
            "observacoes_entrega": "Entregue ao Sr. João na portaria",
            "latitude_entrega": -23.5505,
            "longitude_entrega": -46.6333,
            "endereco_entrega_real": "Rua das Flores, 123"
        }
        """
        print(f"🏁 FINALIZAR OT: Finalizando OT {pk}")
        print(f"🏁 Usuário: {request.user.email}")
        print(f"🏁 Dados: {request.data}")
        
        # Recuperar OT
        ot = self.get_object()
        
        print(f"🏁 OT: {ot.numero_ot}")
        print(f"🏁 Status atual: {ot.status}")
        print(f"📎 Arquivos anexados: {ot.arquivos.count()}")
        
        # 🔧 NOVA VALIDAÇÃO: Verificar arquivos ANTES de qualquer processamento
        if ot.arquivos.count() == 0:
            print(f"❌ Tentativa de finalizar OT sem documentos")
            return Response({
                'success': False,
                'message': 'Não é possível finalizar a OT sem documentos anexados',
                'errors': {
                    'arquivos': [
                        'É obrigatório anexar pelo menos um documento antes de finalizar a entrega.',
                        'Tipos aceitos: canhoto assinado, foto da entrega, comprovante de entrega, etc.',
                        f'Use o endpoint POST /api/ots/{pk}/arquivos/ para anexar documentos.'
                    ]
                },
                'data': {
                    'arquivos_count': 0,
                    'tipos_aceitos': ['CANHOTO', 'FOTO_ENTREGA', 'COMPROVANTE', 'OUTRO'],
                    'endpoint_upload': f'/api/ots/{pk}/arquivos/'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar se OT pode ser finalizada
        if not ot.pode_transicionar_para('ENTREGUE'):
            print(f"❌ OT não pode ser finalizada no status atual: {ot.status}")
            return Response({
                'success': False,
                'message': f'OT não pode ser finalizada no status {ot.get_status_display()}',
                'data': {'status_atual': ot.status}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Debug de permissões
        debug_ot_permissions(request.user, ot, "Finalização de OT")
        
        # Criar serializer
        serializer = OrdemTransporteFinalizarSerializer(
            ot,
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            print(f"✅ Dados válidos, finalizando OT...")
            
            finalized_ot = serializer.save()
            
            print(f"✅ OT {finalized_ot.numero_ot} finalizada com sucesso")
            
            return Response({
                'success': True,
                'message': f'OT {finalized_ot.numero_ot} finalizada com sucesso',
                'data': OrdemTransporteDetailSerializer(finalized_ot).data
            })
        else:
            print(f"❌ Dados inválidos: {serializer.errors}")
            
            return Response({
                'success': False,
                'message': 'Dados inválidos para finalização',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


# ==============================================================================
# 🆕 VIEWS PARA SISTEMA DE ACEITAÇÃO DE TRANSFERÊNCIAS
# ==============================================================================

class AceitarTransferenciaView(APIView, OTPermissionMixin):
    """
    🎯 PROPÓSITO: Aceitar transferência aguardando aceitação
    
    POST /api/transferencias/{id}/aceitar/
    
    🔍 DEBUGGING: Para ver processo de aceitação
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Recupera a transferência."""
        obj = get_object_or_404(TransferenciaOT, pk=self.kwargs['pk'])
        
        # Verificar se usuário é o motorista destino
        if self.request.user != obj.motorista_destino:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Apenas o motorista destino pode aceitar a transferência")
        
        return obj
    
    def post(self, request, pk):
        """
        Aceita transferência aguardando aceitação.
        
        Body esperado:
        {
            "observacao": "Observação sobre a aceitação (opcional)"
        }
        """
        print(f"✅ ACEITAR TRANSFERENCIA: ID {pk}")
        print(f"✅ Usuário: {request.user.email}")
        print(f"✅ Dados: {request.data}")
        
        # Recuperar transferência
        transferencia = self.get_object()
        
        print(f"✅ Transferência: OT {transferencia.ordem_transporte.numero_ot}")
        print(f"✅ De: {transferencia.motorista_origem.email}")
        print(f"✅ Para: {transferencia.motorista_destino.email}")
        print(f"✅ Status: {transferencia.status}")
        
        # Criar serializer
        serializer = TransferenciaAceitarSerializer(
            transferencia,
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            print(f"✅ Dados válidos, aceitando transferência...")
            
            updated_transferencia = serializer.save()
            
            print(f"✅ Transferência aceita com sucesso!")
            
            return Response({
                'success': True,
                'message': f'Transferência aceita! Você agora é responsável pela OT {updated_transferencia.ordem_transporte.numero_ot}',
                'data': TransferenciaOTSerializer(updated_transferencia).data,
                'ot_atualizada': OrdemTransporteDetailSerializer(updated_transferencia.ordem_transporte).data
            })
        else:
            print(f"❌ Dados inválidos: {serializer.errors}")
            
            return Response({
                'success': False,
                'message': 'Dados inválidos para aceitação',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


class RecusarTransferenciaView(APIView, OTPermissionMixin):
    """
    🎯 PROPÓSITO: Recusar transferência aguardando aceitação
    
    POST /api/transferencias/{id}/recusar/
    
    🔍 DEBUGGING: Para ver processo de recusa
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Recupera a transferência."""
        obj = get_object_or_404(TransferenciaOT, pk=self.kwargs['pk'])
        
        # Verificar se usuário é o motorista destino
        if self.request.user != obj.motorista_destino:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Apenas o motorista destino pode recusar a transferência")
        
        return obj
    
    def post(self, request, pk):
        """
        Recusa transferência aguardando aceitação.
        
        Body esperado:
        {
            "observacao": "Motivo da recusa (obrigatório)"
        }
        """
        print(f"❌ RECUSAR TRANSFERENCIA: ID {pk}")
        print(f"❌ Usuário: {request.user.email}")
        print(f"❌ Dados: {request.data}")
        
        # Recuperar transferência
        transferencia = self.get_object()
        
        print(f"❌ Transferência: OT {transferencia.ordem_transporte.numero_ot}")
        print(f"❌ De: {transferencia.motorista_origem.email}")
        print(f"❌ Para: {transferencia.motorista_destino.email}")
        print(f"❌ Status: {transferencia.status}")
        
        # Criar serializer
        serializer = TransferenciaRecusarSerializer(
            transferencia,
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            print(f"✅ Dados válidos, recusando transferência...")
            
            updated_transferencia = serializer.save()
            
            print(f"❌ Transferência recusada!")
            
            return Response({
                'success': True,
                'message': f'Transferência recusada. A OT {updated_transferencia.ordem_transporte.numero_ot} continua com {updated_transferencia.motorista_origem.full_name}',
                'data': TransferenciaOTSerializer(updated_transferencia).data
            })
        else:
            print(f"❌ Dados inválidos: {serializer.errors}")
            
            return Response({
                'success': False,
                'message': 'Dados inválidos para recusa',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


class CancelarTransferenciaView(APIView, OTPermissionMixin):
    """
    🎯 PROPÓSITO: Cancelar transferência pendente ou aguardando aceitação
    
    POST /api/transferencias/{id}/cancelar/
    
    🔍 DEBUGGING: Para ver processo de cancelamento
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Recupera a transferência."""
        obj = get_object_or_404(TransferenciaOT, pk=self.kwargs['pk'])
        
        # Verificar permissões (implementado no método cancelar do model)
        return obj
    
    def post(self, request, pk):
        """
        Cancela transferência.
        
        Body esperado:
        {
            "observacao": "Motivo do cancelamento (opcional)"
        }
        """
        print(f"🚫 CANCELAR TRANSFERENCIA: ID {pk}")
        print(f"🚫 Usuário: {request.user.email}")
        print(f"🚫 Dados: {request.data}")
        
        # Recuperar transferência
        transferencia = self.get_object()
        
        print(f"🚫 Transferência: OT {transferencia.ordem_transporte.numero_ot}")
        print(f"🚫 Status: {transferencia.status}")
        
        # Criar serializer
        serializer = TransferenciaCancelarSerializer(
            transferencia,
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            print(f"✅ Dados válidos, cancelando transferência...")
            
            updated_transferencia = serializer.save()
            
            print(f"🚫 Transferência cancelada!")
            
            return Response({
                'success': True,
                'message': f'Transferência cancelada',
                'data': TransferenciaOTSerializer(updated_transferencia).data
            })
        else:
            print(f"❌ Dados inválidos: {serializer.errors}")
            
            return Response({
                'success': False,
                'message': 'Erro ao cancelar transferência',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


class MinhasTransferenciasView(generics.ListAPIView):
    """
    🎯 PROPÓSITO: Listar transferências pendentes para o motorista logado
    
    GET /api/transferencias/minhas/
    
    🔍 DEBUGGING: Para ver transferências que aguardam ação do motorista
    """
    
    serializer_class = TransferenciaOTSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Retorna transferências que aguardam ação do motorista logado.
        """
        user = self.request.user
        
        print(f"📋 MINHAS TRANSFERENCIAS: Para {user.email}")
        
        # Filtrar transferências relevantes para o usuário
        queryset = TransferenciaOT.objects.filter(
            models.Q(motorista_destino=user, status='AGUARDANDO_ACEITACAO') |  # Para aceitar/recusar
            models.Q(solicitado_por=user, status__in=['PENDENTE', 'AGUARDANDO_ACEITACAO']) |  # Que ele solicitou
            models.Q(motorista_origem=user, status__in=['PENDENTE', 'AGUARDANDO_ACEITACAO'])  # De OTs dele
        ).distinct()
        
        # Otimizar queries
        queryset = queryset.select_related(
            'ordem_transporte', 'motorista_origem', 'motorista_destino',
            'solicitado_por', 'aprovado_por'
        ).order_by('-data_solicitacao')
        
        print(f"📋 Total encontradas: {queryset.count()}")
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """
        Lista transferências com categorização.
        """
        print(f"📋 LIST TRANSFERENCIAS: Para {request.user.email}")
        
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Categorizar transferências
        para_aceitar = [t for t in serializer.data if t['status'] == 'AGUARDANDO_ACEITACAO' and t['motorista_destino']['id'] == request.user.id]
        aguardando_aprovacao = [t for t in serializer.data if t['status'] == 'PENDENTE']
        minhas_aguardando_resposta = [t for t in serializer.data if t['status'] == 'AGUARDANDO_ACEITACAO' and t['motorista_origem']['id'] == request.user.id]
        
        return Response({
            'success': True,
            'message': 'Transferências recuperadas',
            'data': {
                'para_aceitar': para_aceitar,
                'aguardando_aprovacao': aguardando_aprovacao,
                'minhas_aguardando_resposta': minhas_aguardando_resposta,
                'todas': serializer.data
            },
            'stats': {
                'total': len(serializer.data),
                'para_aceitar': len(para_aceitar),
                'aguardando_aprovacao': len(aguardando_aprovacao),
                'minhas_aguardando_resposta': len(minhas_aguardando_resposta)
            }
        })

class UploadArquivoOTView(APIView, OTPermissionMixin):
    """
    🎯 PROPÓSITO: Upload de arquivos para OT
    
    POST /api/ots/{id}/arquivos/
    
    🔍 DEBUGGING: Para ver processo de upload
    """
    
    permission_classes = [IsOwnerOrLogisticaOrAdmin]
    
    def get_object(self):
        """Recupera a OT."""
        obj = get_object_or_404(OrdemTransporte, pk=self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)
        return obj
    
    def post(self, request, pk):
        """
        Faz upload de arquivo para a OT.
        
        Form data esperado:
        - arquivo: File
        - tipo: CANHOTO|FOTO_ENTREGA|FOTO_OCORRENCIA|COMPROVANTE|OUTRO
        - descricao: String (opcional)
        """
        print(f"📎 UPLOAD: Upload de arquivo para OT {pk}")
        print(f"📎 Usuário: {request.user.email}")
        print(f"📎 Arquivos: {request.FILES}")
        print(f"📎 Dados: {request.data}")
        
        # Recuperar OT
        ot = self.get_object()
        
        print(f"📎 OT: {ot.numero_ot}")
        
        # Debug de permissões
        debug_ot_permissions(request.user, ot, "Upload de arquivo")
        
        # Criar serializer com contexto
        serializer = ArquivoSerializer(
            data=request.data,
            context={
                'request': request,
                'ordem_transporte': ot
            }
        )
        
        if serializer.is_valid():
            print(f"✅ Dados válidos, salvando arquivo...")
            
            arquivo = serializer.save()
            
            print(f"✅ Arquivo salvo: {arquivo.nome_arquivo}")
            
            return Response({
                'success': True,
                'message': f'Arquivo {arquivo.nome_arquivo} enviado com sucesso',
                'data': ArquivoSerializer(arquivo).data
            }, status=status.HTTP_201_CREATED)
        else:
            print(f"❌ Dados inválidos: {serializer.errors}")
            
            return Response({
                'success': False,
                'message': 'Dados inválidos para upload',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


# ==============================================================================
# 🔍 VIEWS DE BUSCA E FILTROS
# ==============================================================================

class BuscarOTView(APIView):
    """
    🎯 PROPÓSITO: Buscar OTs por diferentes critérios
    
    GET /api/ots/buscar/?numero_ot=OT20250426001
    GET /api/ots/buscar/?cliente_nome=Empresa
    GET /api/ots/buscar/?status=EM_TRANSITO
    """
    
    permission_classes = [CanViewAllOTs]
    
    def get(self, request):
        """
        Busca OTs por critérios.
        
        Query params:
        - numero_ot: Número da OT
        - cliente_nome: Nome do cliente (busca parcial)
        - status: Status da OT
        - motorista_id: ID do motorista
        - data_inicio: Data inicial (YYYY-MM-DD)
        - data_fim: Data final (YYYY-MM-DD)
        """
        print(f"🔍 BUSCAR OT: Buscando OTs")
        print(f"🔍 Usuário: {request.user.email}")
        print(f"🔍 Parâmetros: {request.query_params}")
        
        # Começar com OTs que o usuário pode ver
        queryset = get_user_ots_queryset(request.user)
        
        # Aplicar filtros
        numero_ot = request.query_params.get('numero_ot')
        if numero_ot:
            queryset = queryset.filter(numero_ot__icontains=numero_ot)
            print(f"🔍 Filtro numero_ot: {numero_ot}")
        
        cliente_nome = request.query_params.get('cliente_nome')
        if cliente_nome:
            queryset = queryset.filter(cliente_nome__icontains=cliente_nome)
            print(f"🔍 Filtro cliente_nome: {cliente_nome}")
        
        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            print(f"🔍 Filtro status: {status_param}")
        
        motorista_id = request.query_params.get('motorista_id')
        if motorista_id and request.user.role in ['logistica', 'admin']:
            queryset = queryset.filter(motorista_atual_id=motorista_id)
            print(f"🔍 Filtro motorista_id: {motorista_id}")
        
        data_inicio = request.query_params.get('data_inicio')
        if data_inicio:
            queryset = queryset.filter(data_criacao__date__gte=data_inicio)
            print(f"🔍 Filtro data_inicio: {data_inicio}")
        
        data_fim = request.query_params.get('data_fim')
        if data_fim:
            queryset = queryset.filter(data_criacao__date__lte=data_fim)
            print(f"🔍 Filtro data_fim: {data_fim}")
        
        # Verificar se há filtros
        if not any([numero_ot, cliente_nome, status_param, motorista_id, data_inicio, data_fim]):
            return Response({
                'success': False,
                'message': 'Pelo menos um critério de busca deve ser fornecido',
                'available_filters': [
                    'numero_ot', 'cliente_nome', 'status', 
                    'motorista_id', 'data_inicio', 'data_fim'
                ]
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Otimizar queries e ordenar
        queryset = queryset.select_related('motorista_criador', 'motorista_atual')
        queryset = queryset.order_by('-data_criacao')
        
        # Limitar resultados
        queryset = queryset[:50]  # Máximo 50 resultados
        
        print(f"🔍 Resultados encontrados: {len(queryset)}")
        
        # Serializar resultados
        serializer = OrdemTransporteListSerializer(queryset, many=True)
        
        return Response({
            'success': True,
            'message': f'{len(queryset)} OTs encontradas',
            'data': serializer.data,
            'total': len(queryset)
        })

class PodeCreateOTView(APIView):
    """
    🎯 PROPÓSITO: Verificar se motorista pode criar nova OT
    
    GET /api/ots/pode-criar/ - Verifica se motorista tem OT ativa
    
    📋 REGRA DE NEGÓCIO:
    - Motorista só pode ter 1 OT ativa (não finalizada) por vez
    - Status finais: ENTREGUE, ENTREGUE_PARCIAL, CANCELADA
    - Status ativos: INICIADA, EM_CARREGAMENTO, EM_TRANSITO
    
    🔍 RESPOSTA:
    {
        "pode_criar": false,
        "motivo": "Você já possui uma OT ativa",
        "ot_ativa": {
            "id": 123,
            "numero_ot": "OT20250609001",
            "status": "EM_TRANSITO",
            "cliente_nome": "Cliente ABC"
        }
    }
    """
    
    permission_classes = [permissions.IsAuthenticated, CanCreateOT]
    
    def get(self, request):
        """
        Verifica se motorista pode criar nova OT.
        """
        print(f"🚫 PODE CRIAR OT: Verificação para {request.user.email}")
        
        # Buscar OTs ativas do motorista
        ots_ativas = OrdemTransporte.objects.filter(
            motorista_atual=request.user,
            status__in=['INICIADA', 'EM_CARREGAMENTO', 'EM_TRANSITO'],
            ativa=True
        ).select_related('motorista_atual', 'motorista_criador')
        
        print(f"🚫 OTs ativas encontradas: {ots_ativas.count()}")
        
        if ots_ativas.exists():
            # Tem OT ativa - não pode criar
            ot_ativa = ots_ativas.first()
            
            print(f"❌ Motorista já tem OT ativa: {ot_ativa.numero_ot}")
            
            return Response({
                'pode_criar': False,
                'motivo': 'Você já possui uma Ordem de Transporte ativa. Finalize-a antes de criar uma nova.',
                'ot_ativa': {
                    'id': ot_ativa.id,
                    'numero_ot': ot_ativa.numero_ot,
                    'status': ot_ativa.status,
                    'status_display': ot_ativa.get_status_display(),
                    'cliente_nome': ot_ativa.cliente_nome,
                    'data_criacao': ot_ativa.data_criacao,
                }
            }, status=status.HTTP_200_OK)
        else:
            # Pode criar nova OT
            print(f"✅ Motorista pode criar nova OT")
            
            return Response({
                'pode_criar': True,
                'motivo': 'Nenhuma OT ativa encontrada. Você pode criar uma nova.',
                'ot_ativa': None
            }, status=status.HTTP_200_OK)


# ==============================================================================
# 📊 VIEWS DE RELATÓRIOS E ESTATÍSTICAS
# ==============================================================================

@api_view(['GET'])
@permission_classes([CanViewAllOTs])
def estatisticas_ots(request):
    """
    🎯 PROPÓSITO: Estatísticas das OTs para dashboard
    
    GET /api/ots/stats/
    """
    print(f"📊 STATS: Gerando estatísticas para {request.user.email}")
    
    # Usar queryset filtrado por usuário
    queryset = get_user_ots_queryset(request.user)
    
    # Estatísticas gerais
    total = queryset.count()
    ativas = queryset.filter(status__in=['INICIADA', 'EM_CARREGAMENTO', 'EM_TRANSITO']).count()
    finalizadas = queryset.filter(status__in=['ENTREGUE', 'ENTREGUE_PARCIAL']).count()
    canceladas = queryset.filter(status='CANCELADA').count()
    
    # Estatísticas por status
    por_status = {}
    for status_code, status_name in OrdemTransporte.STATUS_CHOICES:
        por_status[status_code] = {
            'nome': status_name,
            'quantidade': queryset.filter(status=status_code).count()
        }
    
    # Estatísticas por período (últimos 30 dias)
    from datetime import timedelta
    data_limite = timezone.now() - timedelta(days=30)
    recentes = queryset.filter(data_criacao__gte=data_limite)
    
    # OTs por motorista (apenas para logística/admin)
    por_motorista = []
    if request.user.role in ['logistica', 'admin']:
        from django.db.models import Count
        motoristas_stats = queryset.values(
            'motorista_atual__first_name',
            'motorista_atual__last_name',
            'motorista_atual__email'
        ).annotate(
            total_ots=Count('id')
        ).order_by('-total_ots')[:10]
        
        por_motorista = list(motoristas_stats)
    
    stats = {
        'resumo': {
            'total': total,
            'ativas': ativas,
            'finalizadas': finalizadas,
            'canceladas': canceladas,
        },
        'por_status': por_status,
        'ultimos_30_dias': {
            'total': recentes.count(),
            'criadas': recentes.count(),
            'finalizadas': recentes.filter(
                status__in=['ENTREGUE', 'ENTREGUE_PARCIAL']
            ).count(),
        },
        'por_motorista': por_motorista,
        'generated_at': timezone.now().isoformat(),
        'user_role': request.user.role,
    }
    
    print(f"📊 Estatísticas geradas: {stats['resumo']}")
    
    return Response({
        'success': True,
        'message': 'Estatísticas geradas com sucesso',
        'data': stats
    })


# ==============================================================================
# 🛠️ VIEWS DE DEBUGGING
# ==============================================================================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def debug_ot_info(request, pk=None):
    """
    🎯 ENDPOINT PARA DEBUGGING: Ver informações detalhadas de uma OT
    
    GET /api/ots/debug/{id}/
    """
    print("🔍 DEBUG OT: Informações de debugging")
    
    if pk:
        try:
            ot = OrdemTransporte.objects.get(pk=pk)
            print(f"🔍 OT encontrada: {ot.numero_ot}")
            
            # Debug de permissões
            debug_ot_permissions(request.user, ot, "Debug endpoint")
            
            debug_info = {
                'ot': {
                    'id': ot.id,
                    'numero_ot': ot.numero_ot,
                    'status': ot.status,
                    'motorista_criador': ot.motorista_criador.email,
                    'motorista_atual': ot.motorista_atual.email,
                    'pode_ser_editada': ot.pode_ser_editada,
                    'pode_ser_transferida': ot.pode_ser_transferida,
                    'esta_finalizada': ot.esta_finalizada,
                },
                'permissoes': {
                    'pode_visualizar': request.user.role in ['logistica', 'admin'] or ot.motorista_atual == request.user or ot.motorista_criador == request.user,
                    'pode_editar': ot.pode_ser_editada and (request.user.role in ['logistica', 'admin'] or ot.motorista_atual == request.user),
                    'pode_transferir': ot.pode_ser_transferida,
                },
                'user_info': {
                    'email': request.user.email,
                    'role': request.user.role,
                    'is_active': request.user.is_active,
                }
            }
            
            return Response({
                'success': True,
                'debug_info': debug_info
            })
            
        except OrdemTransporte.DoesNotExist:
            return Response({
                'success': False,
                'message': 'OT não encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
    else:
        # Info geral do usuário
        queryset = get_user_ots_queryset(request.user)
        
        return Response({
            'success': True,
            'debug_info': {
                'user': {
                    'email': request.user.email,
                    'role': request.user.role,
                    'is_active': request.user.is_active,
                },
                'ots_visiveis': queryset.count(),
                'total_ots_sistema': OrdemTransporte.objects.count(),
            }
        })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def debug_endpoints_ot(request):
    """
    🎯 ENDPOINT PARA DEBUGGING: Lista todos os endpoints de OT
    
    GET /api/ots/endpoints/
    """
    endpoints = {
        'crud': {
            'list_create': {
                'url': 'GET|POST /api/ots/',
                'description': 'Listar e criar OTs',
                'permissions': 'CanViewAllOTs | CanCreateOT'
            },
            'detail': {
                'url': 'GET|PUT|PATCH /api/ots/{id}/',
                'description': 'Ver e editar OT específica',
                'permissions': 'IsOwnerOrLogisticaOrAdmin'
            },
        },
        'acoes': {
            'transferir': {
                'url': 'POST /api/ots/{id}/transferir/',
                'description': 'Transferir OT para outro motorista',
                'permissions': 'CanTransferOT'
            },
            'status': {
                'url': 'PATCH /api/ots/{id}/status/',
                'description': 'Atualizar status da OT',
                'permissions': 'CanUpdateOTStatus'
            },
            'finalizar': {
                'url': 'POST /api/ots/{id}/finalizar/',
                'description': 'Finalizar OT como entregue',
                'permissions': 'CanUpdateOTStatus'
            },
            'upload': {
                'url': 'POST /api/ots/{id}/arquivos/',
                'description': 'Upload de arquivos para OT',
                'permissions': 'IsOwnerOrLogisticaOrAdmin'
            },
        },
        'busca': {
            'buscar': {
                'url': 'GET /api/ots/buscar/',
                'description': 'Buscar OTs por critérios',
                'permissions': 'CanViewAllOTs'
            },
            'stats': {
                'url': 'GET /api/ots/stats/',
                'description': 'Estatísticas das OTs',
                'permissions': 'CanViewAllOTs'
            },
        },
        'debug': {
            'debug_ot': {
                'url': 'GET /api/ots/debug/{id}/',
                'description': 'Debug de OT específica',
                'permissions': 'IsAuthenticated'
            },
            'debug_endpoints': {
                'url': 'GET /api/ots/endpoints/',
                'description': 'Lista de todos os endpoints',
                'permissions': 'AllowAny'
            },
        }
    }
    
    return Response(endpoints)