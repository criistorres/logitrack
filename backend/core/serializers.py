# ==============================================================================
# SERIALIZERS DO CORE - ORDENS DE TRANSPORTE
# ==============================================================================

# Arquivo: backend/core/serializers.py
# CRIE este arquivo na pasta core/

from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import OrdemTransporte, Arquivo, TransferenciaOT, AtualizacaoOT
from accounts.models import CustomUser
import logging

logger = logging.getLogger(__name__)

# ==============================================================================
# 🔧 SERIALIZER SIMPLES PARA USUÁRIO (SEM DEPENDÊNCIAS EXTERNAS)
# ==============================================================================

class SimpleUserSerializer(serializers.ModelSerializer):
    """
    📝 PROPÓSITO: Serializer simples para usuário sem complicações
    
    Usado nos relacionamentos de OT para evitar erros de importação circular.
    """
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'full_name', 'role', 'is_active']

# ==============================================================================
# 🚚 SERIALIZER PRINCIPAL: ORDEM DE TRANSPORTE
# ==============================================================================

class OrdemTransporteCreateSerializer(serializers.ModelSerializer):
    """
    📝 PROPÓSITO: Criar novas Ordens de Transporte
    
    🎯 USADO EM: POST /api/ots/
    
    🔍 DEBUGGING: Para acompanhar criação de OT:
    1. Coloque breakpoint no método create()
    2. Observe como motorista_criador é definido automaticamente
    3. Acompanhe geração automática do número da OT
    """
    
    class Meta:
        model = OrdemTransporte
        fields = [
            'cliente_nome', 'endereco_entrega', 'cidade_entrega',
            'observacoes', 'latitude_origem', 'longitude_origem',
            'endereco_origem'
        ]
        
        extra_kwargs = {
            'cliente_nome': {'required': True},
            'endereco_entrega': {'required': True},
            'cidade_entrega': {'required': True},
        }
    
    def create(self, validated_data):
        """
        Cria nova OT definindo automaticamente o motorista criador.
        
        🐛 DEBUGGING: Coloque breakpoint aqui para ver processo de criação
        """
        print(f"🚚 CREATE OT: Criando nova OT")
        print(f"🚚 Dados: {validated_data}")
        
        # Obter usuário da requisição
        user = self.context['request'].user
        print(f"🚚 Motorista criador: {user.email}")
        
        # Criar OT com motorista criador
        ot = OrdemTransporte.objects.create(
            motorista_criador=user,
            **validated_data
        )
        
        print(f"✅ OT criada: {ot.numero_ot} (ID: {ot.id})")
        return ot


class OrdemTransporteListSerializer(serializers.ModelSerializer):
    """
    📝 PROPÓSITO: Listar OTs (versão resumida para performance)
    
    🎯 USADO EM: GET /api/ots/
    
    Inclui informações do motorista atual e estatísticas básicas.
    """
    
    motorista_criador = SimpleUserSerializer(read_only=True)
    motorista_atual = SimpleUserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    pode_ser_editada = serializers.ReadOnlyField()
    pode_ser_transferida = serializers.ReadOnlyField()
    esta_finalizada = serializers.ReadOnlyField()
    
    class Meta:
        model = OrdemTransporte
        fields = [
            'id', 'numero_ot', 'status', 'status_display',
            'cliente_nome', 'cidade_entrega', 'observacoes',
            'data_criacao', 'data_finalizacao',
            'motorista_criador', 'motorista_atual',
            'pode_ser_editada', 'pode_ser_transferida', 'esta_finalizada'
        ]


class OrdemTransporteDetailSerializer(serializers.ModelSerializer):
    """
    📝 PROPÓSITO: Visualizar OT completa com todos os detalhes
    
    🎯 USADO EM: GET /api/ots/{id}/
    
    Inclui dados completos, arquivos, transferências e timeline.
    """
    
    motorista_criador = SimpleUserSerializer(read_only=True)
    motorista_atual = SimpleUserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Propriedades calculadas EXISTENTES
    pode_ser_editada = serializers.ReadOnlyField()
    pode_ser_transferida = serializers.ReadOnlyField()
    esta_finalizada = serializers.ReadOnlyField()
    
    # 🔧 NOVAS PROPRIEDADES para validação de finalização
    pode_ser_finalizada = serializers.ReadOnlyField()
    motivo_nao_finalizar = serializers.ReadOnlyField()
    tem_canhoto = serializers.ReadOnlyField()
    tem_foto_entrega = serializers.ReadOnlyField()
    
    # Relacionamentos
    arquivos = serializers.SerializerMethodField()
    transferencias = serializers.SerializerMethodField()
    atualizacoes_recentes = serializers.SerializerMethodField()
    
    # 🔧 NOVOS CAMPOS para estatísticas de arquivos
    arquivos_count = serializers.SerializerMethodField()
    arquivos_por_tipo = serializers.SerializerMethodField()
    
    class Meta:
        model = OrdemTransporte
        fields = [
            'id', 'numero_ot', 'status', 'status_display',
            'cliente_nome', 'endereco_entrega', 'cidade_entrega',
            'observacoes', 'observacoes_entrega',
            'data_criacao', 'data_atualizacao', 'data_finalizacao',
            'latitude_origem', 'longitude_origem', 'endereco_origem',
            'latitude_entrega', 'longitude_entrega', 'endereco_entrega_real',
            'motorista_criador', 'motorista_atual',
            'pode_ser_editada', 'pode_ser_transferida', 'esta_finalizada',
            'pode_ser_finalizada', 'motivo_nao_finalizar',  # 🔧 NOVOS
            'tem_canhoto', 'tem_foto_entrega',              # 🔧 NOVOS
            'arquivos', 'arquivos_count', 'arquivos_por_tipo',  # 🔧 NOVOS
            'transferencias', 'atualizacoes_recentes'
        ]
    
    def get_arquivos(self, obj):
        """Retorna arquivos da OT."""
        arquivos = obj.arquivos.all()[:10]  # Últimos 10 arquivos
        return ArquivoSerializer(arquivos, many=True).data
    
    def get_arquivos_count(self, obj):
        """🔧 NOVO: Retorna quantidade de arquivos por tipo."""
        return obj.arquivos.count()
    
    def get_arquivos_por_tipo(self, obj):
        """🔧 NOVO: Retorna arquivos agrupados por tipo."""
        arquivos_por_tipo = {}
        for arquivo in obj.arquivos.all():
            tipo = arquivo.get_tipo_display()
            if tipo not in arquivos_por_tipo:
                arquivos_por_tipo[tipo] = 0
            arquivos_por_tipo[tipo] += 1
        return arquivos_por_tipo
    
    def get_transferencias(self, obj):
        """Retorna transferências da OT."""
        transferencias = obj.transferencias.all()[:5]  # Últimas 5 transferências
        return TransferenciaOTSerializer(transferencias, many=True).data
    
    def get_atualizacoes_recentes(self, obj):
        """Retorna atualizações recentes da OT."""
        atualizacoes = obj.atualizacoes.all()[:10]  # Últimas 10 atualizações
        return AtualizacaoOTSerializer(atualizacoes, many=True).data


class OrdemTransporteUpdateSerializer(serializers.ModelSerializer):
    """
    📝 PROPÓSITO: Atualizar dados da OT
    
    🎯 USADO EM: PATCH /api/ots/{id}/
    
    Permite atualizar observações, localização e status com validações.
    """
    
    class Meta:
        model = OrdemTransporte
        fields = [
            'observacoes', 'observacoes_entrega',
            'latitude_entrega', 'longitude_entrega', 'endereco_entrega_real',
            'status'
        ]
    
    def validate_status(self, value):
        """
        Valida transições de status.
        
        🐛 DEBUGGING: Coloque breakpoint aqui para ver validação de status
        """
        print(f"🚚 STATUS VALIDATION: Novo status: {value}")
        
        instance = self.instance
        if instance:
            print(f"🚚 Status atual: {instance.status}")
            
            if not instance.pode_transicionar_para(value):
                print(f"❌ Transição inválida: {instance.status} → {value}")
                raise serializers.ValidationError(
                    f'Não é possível transicionar de {instance.get_status_display()} para {dict(OrdemTransporte.STATUS_CHOICES)[value]}'
                )
            
            print(f"✅ Transição válida: {instance.status} → {value}")
        
        return value
    
    def update(self, instance, validated_data):
        """
        Atualiza a OT e registra as mudanças.
        
        🐛 DEBUGGING: Coloque breakpoint aqui para ver processo de atualização
        """
        print(f"🚚 UPDATE OT: Atualizando {instance.numero_ot}")
        print(f"🚚 Dados novos: {validated_data}")
        print(f"🚚 Status atual: {instance.status}")
        
        # 🔧 CORREÇÃO: Verificar se há mudança de status REAL
        novo_status = validated_data.get('status')
        if novo_status and novo_status != instance.status:
            print(f"🚚 Mudança de status detectada: {instance.status} → {novo_status}")
            
            # Usar método do modelo para atualizar status
            validated_data_copy = validated_data.copy()
            validated_data_copy.pop('status')  # Remover para não duplicar
            
            # Atualizar outros campos primeiro
            for attr, value in validated_data_copy.items():
                setattr(instance, attr, value)
            instance.save()
            
            # Atualizar status com validação e log
            user = self.context['request'].user
            observacao = validated_data.get('observacao', '')
            instance.atualizar_status(novo_status, user, observacao)
            
        elif novo_status and novo_status == instance.status:
            # 🔧 CORREÇÃO: Se status é igual, não tentar atualizar status
            print(f"⚠️ Status já é {novo_status}, apenas atualizando outros campos")
            validated_data_copy = validated_data.copy()
            validated_data_copy.pop('status')  # Remover status duplicado
            
            # Atualizar apenas outros campos
            for attr, value in validated_data_copy.items():
                setattr(instance, attr, value)
            instance.save()
            
        else:
            # Atualização normal sem mudança de status
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
        
        print(f"✅ OT {instance.numero_ot} atualizada com sucesso")
        return instance


# ==============================================================================
# 📎 SERIALIZER DE ARQUIVO
# ==============================================================================

class ArquivoSerializer(serializers.ModelSerializer):
    """
    📝 PROPÓSITO: Upload e visualização de arquivos das OTs
    
    🎯 USADO EM: 
    - POST /api/ots/{id}/arquivos/ (upload)
    - GET dentro de OrdemTransporteDetailSerializer
    """
    
    enviado_por = SimpleUserSerializer(read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    nome_arquivo = serializers.ReadOnlyField()
    tamanho_formatado = serializers.ReadOnlyField()
    
    class Meta:
        model = Arquivo
        fields = [
            'id', 'arquivo', 'tipo', 'tipo_display',
            'descricao', 'data_envio', 'enviado_por',
            'nome_arquivo', 'tamanho_formatado'
        ]
    
    def create(self, validated_data):
        """
        Cria novo arquivo vinculado à OT.
        
        🐛 DEBUGGING: Coloque breakpoint aqui para ver upload
        """
        print(f"📎 UPLOAD: Enviando arquivo")
        print(f"📎 Tipo: {validated_data.get('tipo')}")
        print(f"📎 Descrição: {validated_data.get('descricao', 'Sem descrição')}")
        
        # Obter dados do contexto
        user = self.context['request'].user
        ot = self.context['ordem_transporte']
        
        # Criar arquivo
        arquivo = Arquivo.objects.create(
            ordem_transporte=ot,
            enviado_por=user,
            **validated_data
        )
        
        print(f"✅ Arquivo enviado: {arquivo.nome_arquivo}")
        
        # Criar registro de atualização
        AtualizacaoOT.objects.create(
            ordem_transporte=ot,
            usuario=user,
            tipo_atualizacao='ARQUIVO',
            descricao=f'Arquivo enviado: {arquivo.nome_arquivo}',
            observacao=arquivo.descricao
        )
        
        return arquivo


# ==============================================================================
# 🔄 SERIALIZER DE TRANSFERÊNCIA
# ==============================================================================

class TransferenciaOTSerializer(serializers.ModelSerializer):
    """
    📝 PROPÓSITO: Visualizar transferências da OT
    
    🎯 USADO EM: GET dentro de OrdemTransporteDetailSerializer
    """
    
    motorista_origem = SimpleUserSerializer(read_only=True)
    motorista_destino = SimpleUserSerializer(read_only=True)
    solicitado_por = SimpleUserSerializer(read_only=True)
    aprovado_por = SimpleUserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = TransferenciaOT
        fields = [
            'id', 'status', 'status_display', 'motivo',
            'observacao_aprovacao', 'data_solicitacao', 'data_resposta',
            'motorista_origem', 'motorista_destino',
            'solicitado_por', 'aprovado_por',
            'latitude', 'longitude', 'endereco'
        ]


class TransferenciaOTCreateSerializer(serializers.ModelSerializer):
    """
    📝 PROPÓSITO: Solicitar/fazer transferência de OT
    
    🎯 USADO EM: POST /api/ots/{id}/transferir/
    """
    
    motorista_destino_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = TransferenciaOT
        fields = ['motorista_destino_id', 'motivo', 'latitude', 'longitude', 'endereco']
        extra_kwargs = {
            'motivo': {'required': True},
        }
    
    def validate_motorista_destino_id(self, value):
        """
        Valida se o motorista destino existe e está ativo.
        
        🐛 DEBUGGING: Coloque breakpoint aqui para ver validação
        """
        print(f"🔄 TRANSFER VALIDATION: Motorista destino ID: {value}")
        
        try:
            motorista = CustomUser.objects.get(id=value, role='motorista', is_active=True)
            print(f"✅ Motorista encontrado: {motorista.email}")
            return value
        except CustomUser.DoesNotExist:
            print(f"❌ Motorista não encontrado ou inativo: {value}")
            raise serializers.ValidationError("Motorista não encontrado ou inativo.")
    
    def create(self, validated_data):
        """
        Cria solicitação de transferência.
        
        🐛 DEBUGGING: Coloque breakpoint aqui para ver processo de transferência
        """
        print(f"🔄 CREATE TRANSFER: Iniciando transferência")
        
        # Obter dados do contexto
        ot = self.context['ordem_transporte']
        user = self.context['request'].user
        
        # Obter motorista destino
        motorista_destino_id = validated_data.pop('motorista_destino_id')
        motorista_destino = CustomUser.objects.get(id=motorista_destino_id)
        
        print(f"🔄 OT: {ot.numero_ot}")
        print(f"🔄 De: {ot.motorista_atual.email}")
        print(f"🔄 Para: {motorista_destino.email}")
        print(f"🔄 Solicitado por: {user.email}")
        
        # Validar se OT pode ser transferida
        if not ot.pode_ser_transferida:
            print(f"❌ OT não pode ser transferida no status: {ot.status}")
            raise serializers.ValidationError("Esta OT não pode ser transferida no status atual.")
        
        # Usar método do modelo para criar transferência
        transferencia = ot.transferir_para(
            novo_motorista=motorista_destino,
            usuario_solicitante=user,
            motivo=validated_data.get('motivo', '')
        )
        
        # Adicionar localização se fornecida
        if validated_data.get('latitude'):
            transferencia.latitude = validated_data['latitude']
        if validated_data.get('longitude'):
            transferencia.longitude = validated_data['longitude']
        if validated_data.get('endereco'):
            transferencia.endereco = validated_data['endereco']
        
        transferencia.save()
        
        print(f"✅ Transferência criada: {transferencia.id} (Status: {transferencia.status})")
        return transferencia


# ==============================================================================
# 📝 SERIALIZER DE ATUALIZAÇÃO
# ==============================================================================

class AtualizacaoOTSerializer(serializers.ModelSerializer):
    """
    📝 PROPÓSITO: Visualizar timeline de atualizações da OT
    
    🎯 USADO EM: GET dentro de OrdemTransporteDetailSerializer
    """
    
    usuario = SimpleUserSerializer(read_only=True)
    tipo_atualizacao_display = serializers.CharField(source='get_tipo_atualizacao_display', read_only=True)
    
    class Meta:
        model = AtualizacaoOT
        fields = [
            'id', 'tipo_atualizacao', 'tipo_atualizacao_display',
            'descricao', 'observacao', 'data_criacao',
            'status_anterior', 'status_novo',
            'latitude', 'longitude', 'endereco',
            'usuario'
        ]


# ==============================================================================
# 🔍 SERIALIZER PARA BUSCA
# ==============================================================================

class OrdemTransporteBuscaSerializer(serializers.Serializer):
    """
    📝 PROPÓSITO: Buscar OTs por diferentes critérios
    
    🎯 USADO EM: GET /api/ots/buscar/
    """
    
    numero_ot = serializers.CharField(required=False)
    cliente_nome = serializers.CharField(required=False)
    status = serializers.ChoiceField(choices=OrdemTransporte.STATUS_CHOICES, required=False)
    motorista_id = serializers.IntegerField(required=False)
    data_inicio = serializers.DateField(required=False)
    data_fim = serializers.DateField(required=False)
    
    def validate(self, attrs):
        """
        Valida se pelo menos um critério de busca foi fornecido.
        """
        if not any(attrs.values()):
            raise serializers.ValidationError("Pelo menos um critério de busca deve ser fornecido.")
        
        return attrs


# ==============================================================================
# 🛠️ SERIALIZERS PARA AÇÕES ESPECÍFICAS
# ==============================================================================

class OrdemTransporteStatusSerializer(serializers.ModelSerializer):
    """
    📝 PROPÓSITO: Atualizar apenas o status da OT
    
    🎯 USADO EM: PATCH /api/ots/{id}/status/
    """
    
    observacao = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = OrdemTransporte
        fields = ['status', 'observacao']
    
    def validate_status(self, value):
        """Valida transição de status."""
        instance = self.instance
        if instance and not instance.pode_transicionar_para(value):
            raise serializers.ValidationError(
                f'Não é possível transicionar de {instance.get_status_display()} para {dict(OrdemTransporte.STATUS_CHOICES)[value]}'
            )
        return value
    
    def update(self, instance, validated_data):
        """Atualiza status usando método do modelo."""
        novo_status = validated_data['status']
        observacao = validated_data.get('observacao', '')
        user = self.context['request'].user
        
        instance.atualizar_status(novo_status, user, observacao)
        return instance


class OrdemTransporteFinalizarSerializer(serializers.ModelSerializer):
    """
    📝 PROPÓSITO: Finalizar OT com dados de entrega
    
    🎯 USADO EM: POST /api/ots/{id}/finalizar/
    """
    
    class Meta:
        model = OrdemTransporte
        fields = [
            'observacoes_entrega', 
            'latitude_entrega', 'longitude_entrega', 'endereco_entrega_real'
        ]
        extra_kwargs = {
            'observacoes_entrega': {'required': True},
        }
    
    def update(self, instance, validated_data):
        """Finaliza OT como entregue."""
        print(f"🚚 FINALIZANDO OT: {instance.numero_ot}")
        
        # Atualizar dados de entrega
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Atualizar status para entregue
        user = self.context['request'].user
        instance.atualizar_status('ENTREGUE', user, "OT finalizada com sucesso")
        
        print(f"✅ OT {instance.numero_ot} finalizada")
        return instance


# ==============================================================================
# 🆕 NOVOS SERIALIZERS PARA SISTEMA DE ACEITAÇÃO
# ==============================================================================

class TransferenciaAceitarSerializer(serializers.Serializer):
    """
    📝 PROPÓSITO: Aceitar transferência aguardando aceitação
    
    🎯 USADO EM: POST /api/transferencias/{id}/aceitar/
    """
    
    observacao = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        help_text='Observação sobre a aceitação (opcional)'
    )
    
    def update(self, instance, validated_data):
        """
        Aceita a transferência.
        
        🐛 DEBUGGING: Coloque breakpoint aqui
        """
        print(f"✅ ACEITAR: Transferência {instance.id}")
        
        user = self.context['request'].user
        observacao = validated_data.get('observacao', '')
        
        # Usar método do modelo
        instance.aceitar(user, observacao)
        
        return instance


class TransferenciaRecusarSerializer(serializers.Serializer):
    """
    📝 PROPÓSITO: Recusar transferência aguardando aceitação
    
    🎯 USADO EM: POST /api/transferencias/{id}/recusar/
    """
    
    observacao = serializers.CharField(
        required=True,
        max_length=500,
        help_text='Motivo da recusa (obrigatório)'
    )
    
    def update(self, instance, validated_data):
        """
        Recusa a transferência.
        
        🐛 DEBUGGING: Coloque breakpoint aqui
        """
        print(f"❌ RECUSAR: Transferência {instance.id}")
        
        user = self.context['request'].user
        observacao = validated_data['observacao']
        
        # Usar método do modelo
        instance.recusar(user, observacao)
        
        return instance


class TransferenciaCancelarSerializer(serializers.Serializer):
    """
    📝 PROPÓSITO: Cancelar transferência pendente ou aguardando aceitação
    
    🎯 USADO EM: POST /api/transferencias/{id}/cancelar/
    """
    
    observacao = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        help_text='Motivo do cancelamento (opcional)'
    )
    
    def update(self, instance, validated_data):
        """
        Cancela a transferência.
        
        🐛 DEBUGGING: Coloque breakpoint aqui
        """
        print(f"🚫 CANCELAR: Transferência {instance.id}")
        
        user = self.context['request'].user
        observacao = validated_data.get('observacao', '')
        
        # Usar método do modelo
        instance.cancelar(user, observacao)
        
        return instance


class TransferenciaAprovarSerializer(serializers.Serializer):
    """
    📝 PROPÓSITO: Aprovar transferência pendente (logística)
    
    🎯 USADO EM: POST /api/transferencias/{id}/aprovar/
    """
    
    observacao = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        help_text='Observação sobre a aprovação (opcional)'
    )
    
    def update(self, instance, validated_data):
        """
        Aprova a transferência.
        
        🐛 DEBUGGING: Coloque breakpoint aqui
        """
        print(f"✅ APROVAR LOGISTICA: Transferência {instance.id}")
        
        user = self.context['request'].user
        observacao = validated_data.get('observacao', '')
        
        # Usar método do modelo
        instance.aprovar(user, observacao)
        
        return instance


class TransferenciaRejeitarSerializer(serializers.Serializer):
    """
    📝 PROPÓSITO: Rejeitar transferência pendente (logística)
    
    🎯 USADO EM: POST /api/transferencias/{id}/rejeitar/
    """
    
    observacao = serializers.CharField(
        required=True,
        max_length=500,
        help_text='Motivo da rejeição (obrigatório)'
    )
    
    def update(self, instance, validated_data):
        """
        Rejeita a transferência.
        
        🐛 DEBUGGING: Coloque breakpoint aqui
        """
        print(f"❌ REJEITAR LOGISTICA: Transferência {instance.id}")
        
        user = self.context['request'].user
        observacao = validated_data['observacao']
        
        # Usar método do modelo
        instance.rejeitar(user, observacao)
        
        return instance

def debug_ot_serializer_flow(serializer_instance, step=""):
    """
    Função para debuggar serializers de OT em qualquer momento.
    
    Como usar:
    serializer = OrdemTransporteCreateSerializer(data=request.data)
    debug_ot_serializer_flow(serializer, "Serializer criado")
    """
    print(f"\n{'='*60}")
    print(f"🔍 DEBUG OT SERIALIZER: {step}")
    print(f"{'='*60}")
    
    # Dados iniciais
    initial_data = getattr(serializer_instance, 'initial_data', None)
    print(f"📥 Dados iniciais: {initial_data}")
    
    # Dados validados (se disponíveis)
    try:
        if hasattr(serializer_instance, '_validated_data'):
            validated_data = serializer_instance.validated_data
            print(f"✅ Dados validados: {validated_data}")
        else:
            print(f"⏳ Dados validados: [Ainda não validado]")
    except:
        print(f"⏳ Dados validados: [Ainda não validado]")
    
    # Erros
    try:
        if hasattr(serializer_instance, '_errors'):
            errors = serializer_instance.errors
            print(f"❌ Erros: {errors}")
        else:
            print(f"❌ Erros: [Nenhuma validação executada]")
    except:
        print(f"❌ Erros: [Nenhuma validação executada]")
    
    # Contexto
    context = getattr(serializer_instance, 'context', {})
    user = context.get('request', {}).user if context.get('request') else None
    print(f"👤 Usuário: {user.email if user and hasattr(user, 'email') else 'N/A'}")
    
    # Tipo do serializer
    print(f"🏷️ Tipo: {type(serializer_instance).__name__}")
    
    print(f"{'='*60}\n")