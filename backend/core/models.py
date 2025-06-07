# backend/core/models.py - VERSÃO CORRIGIDA PARA GPS

# ==============================================================================
# MODELOS DO CORE - SISTEMA DE ORDENS DE TRANSPORTE SIMPLIFICADO
# ==============================================================================

from django.db import models
from django.utils import timezone
from django.core.validators import MinLengthValidator
from django.core.exceptions import ValidationError
from accounts.models import CustomUser
import uuid
from datetime import datetime

# ==============================================================================
# 🚚 MODELO PRINCIPAL: ORDEM DE TRANSPORTE (CORRIGIDO PARA GPS)
# ==============================================================================

class OrdemTransporte(models.Model):
    """
    Modelo principal para Ordens de Transporte (OT).
    
    🎯 SIMPLIFICAÇÃO: Sem notas fiscais - foco na operação de transporte
    🔧 CORREÇÃO GPS: Coordenadas ajustadas para suportar GPS real
    
    📋 FLUXO DE STATUS:
    1. INICIADA → Criada pelo motorista ao chegar no ponto de coleta
    2. EM_CARREGAMENTO → Durante o processo de carga
    3. EM_TRANSITO → Mercadoria em movimento
    4. ENTREGUE → Finalizada com sucesso
    5. ENTREGUE_PARCIAL → Parte da carga foi recusada/devolvida
    6. CANCELADA → Operação cancelada
    """
    
    # ==============================================================================
    # CHOICES - Opções de Status
    # ==============================================================================
    
    STATUS_CHOICES = [
        ('INICIADA', 'Iniciada'),
        ('EM_CARREGAMENTO', 'Em Carregamento'),
        ('EM_TRANSITO', 'Em Trânsito'),
        ('ENTREGUE', 'Entregue'),
        ('ENTREGUE_PARCIAL', 'Entregue Parcialmente'),
        ('CANCELADA', 'Cancelada'),
    ]
    
    # ==============================================================================
    # CAMPOS DE IDENTIFICAÇÃO
    # ==============================================================================
    
    numero_ot = models.CharField(
        'Número da OT',
        max_length=20,
        unique=True,
        help_text='Número único da Ordem de Transporte (gerado automaticamente)'
    )
    
    # ==============================================================================
    # RELACIONAMENTO COM MOTORISTAS
    # ==============================================================================
    
    motorista_criador = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='ots_criadas',
        verbose_name='Motorista Criador',
        help_text='Motorista que criou a OT'
    )
    
    motorista_atual = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='ots_atuais',
        verbose_name='Motorista Atual',
        help_text='Motorista responsável atual pela OT'
    )
    
    # ==============================================================================
    # DADOS DO TRANSPORTE
    # ==============================================================================
    
    status = models.CharField(
        'Status',
        max_length=20,
        choices=STATUS_CHOICES,
        default='INICIADA',
        help_text='Status atual da OT'
    )
    
    cliente_nome = models.CharField(
        'Nome do Cliente',
        max_length=200,
        blank=True,
        help_text='Nome ou razão social do cliente'
    )
    
    endereco_entrega = models.CharField(
        'Endereço de Entrega',
        max_length=300,
        help_text='Endereço completo de entrega'
    )
    
    cidade_entrega = models.CharField(
        'Cidade de Entrega',
        max_length=100,
        help_text='Cidade de destino'
    )
    
    observacoes = models.TextField(
        'Observações',
        blank=True,
        help_text='Observações gerais sobre a entrega'
    )
    
    observacoes_entrega = models.TextField(
        'Observações de Entrega',
        blank=True,
        help_text='Observações específicas do momento da entrega'
    )
    
    # ==============================================================================
    # 🌍 LOCALIZAÇÃO (GPS) - CORRIGIDO PARA SUPORTAR COORDENADAS REAIS
    # ==============================================================================
    
    # Localização de Origem (onde a OT foi criada)
    latitude_origem = models.DecimalField(
        'Latitude de Origem',
        max_digits=18,         # 🔧 NOVO: Suporta até -XX.XXXXXXXXXXXXXXX (15 decimais)
        decimal_places=15,     # 🔧 NOVO: Precisão submilimétrica
        null=True,
        blank=True,
        help_text='Latitude do local de criação da OT (-90 a +90)'
    )
    
    longitude_origem = models.DecimalField(
        'Longitude de Origem',
        max_digits=17,         # 🔧 NOVO: Suporta até -XXX.XXXXXXXXXXXXXX (14 decimais)
        decimal_places=15,     # 🔧 NOVO: Precisão submilimétrica
        null=True,
        blank=True,
        help_text='Longitude do local de criação da OT (-180 a +180)'
    )
    
    endereco_origem = models.CharField(
        'Endereço de Origem',
        max_length=255,
        blank=True,
        help_text='Endereço onde a OT foi criada (geocoding reverso)'
    )
    
    # Localização de Entrega (onde foi finalizada)
    latitude_entrega = models.DecimalField(
        'Latitude de Entrega',
        max_digits=18,         # 🔧 NOVO: Suporta até -XX.XXXXXXXXXXXXXXX (15 decimais)
        decimal_places=15,     # 🔧 NOVO: Precisão submilimétrica
        null=True,
        blank=True,
        help_text='Latitude do local de entrega (-90 a +90)'
    )
    
    longitude_entrega = models.DecimalField(
        'Longitude de Entrega',
        max_digits=17,         # 🔧 NOVO: Suporta até -XXX.XXXXXXXXXXXXXX (14 decimais)
        decimal_places=15,     # 🔧 NOVO: Precisão submilimétrica
        null=True,
        blank=True,
        help_text='Longitude do local de entrega (-180 a +180)'
    )
    
    endereco_entrega_real = models.CharField(
        'Endereço Real de Entrega',
        max_length=255,
        blank=True,
        help_text='Endereço onde realmente foi entregue (geocoding reverso)'
    )
    
    # ==============================================================================
    # DATAS E CONTROLE
    # ==============================================================================
    
    data_criacao = models.DateTimeField(
        'Data de Criação',
        auto_now_add=True,
        help_text='Data e hora de criação da OT'
    )
    
    data_atualizacao = models.DateTimeField(
        'Data de Atualização',
        auto_now=True,
        help_text='Data e hora da última atualização'
    )
    
    data_finalizacao = models.DateTimeField(
        'Data de Finalização',
        null=True,
        blank=True,
        help_text='Data e hora de finalização da OT'
    )
    
    ativa = models.BooleanField(
        'Ativa',
        default=True,
        help_text='Indica se a OT está ativa'
    )
    
    # ==============================================================================
    # META E CONFIGURAÇÕES
    # ==============================================================================
    
    class Meta:
        verbose_name = 'Ordem de Transporte'
        verbose_name_plural = 'Ordens de Transporte'
        ordering = ['-data_criacao']
        indexes = [
            models.Index(fields=['numero_ot']),
            models.Index(fields=['status']),
            models.Index(fields=['motorista_atual']),
            models.Index(fields=['-data_criacao']),
        ]
    
    def __str__(self):
        """Representação em string da OT."""
        return f'{self.numero_ot} - {self.cliente_nome} ({self.get_status_display()})'
    
    # ==============================================================================
    # MÉTODOS DE INSTÂNCIA
    # ==============================================================================
    
    def save(self, *args, **kwargs):
        """
        Override do save para:
        1. Gerar número de OT automaticamente
        2. Definir motorista_atual como motorista_criador na criação
        3. Atualizar data_finalizacao quando finalizada
        """
        # Gerar número de OT se for nova
        if not self.numero_ot:
            self.numero_ot = self.gerar_numero_ot()
        
        # Se for nova OT, motorista_atual = motorista_criador
        if not self.pk and not self.motorista_atual_id:
            self.motorista_atual = self.motorista_criador
        
        # Atualizar data_finalizacao se status for final
        if self.status in ['ENTREGUE', 'ENTREGUE_PARCIAL', 'CANCELADA']:
            if not self.data_finalizacao:
                self.data_finalizacao = timezone.now()
        else:
            self.data_finalizacao = None
        
        super().save(*args, **kwargs)
    
    def gerar_numero_ot(self):
        """
        Gera número único para a OT.
        Formato: OT + AAAAMMDD + XXXX (sequencial)
        Exemplo: OT20250606001
        """
        from django.db.models import Max
        
        hoje = timezone.now().date()
        prefixo = f"OT{hoje.strftime('%Y%m%d')}"
        
        # Buscar último número do dia
        ultima_ot = OrdemTransporte.objects.filter(
            numero_ot__startswith=prefixo
        ).aggregate(Max('numero_ot'))['numero_ot__max']
        
        if ultima_ot:
            ultimo_seq = int(ultima_ot[-3:])
            novo_seq = ultimo_seq + 1
        else:
            novo_seq = 1
        
        return f"{prefixo}{novo_seq:03d}"

    @property
    def pode_ser_editada(self):
        """Verifica se a OT pode ser editada."""
        return self.status not in ['ENTREGUE', 'ENTREGUE_PARCIAL', 'CANCELADA']
    
    @property
    def pode_ser_transferida(self):
        """Verifica se a OT pode ser transferida para outro motorista."""
        return self.status in ['INICIADA', 'EM_CARREGAMENTO', 'EM_TRANSITO']
    
    @property
    def esta_finalizada(self):
        """Verifica se a OT está finalizada."""
        return self.status in ['ENTREGUE', 'ENTREGUE_PARCIAL', 'CANCELADA']
    
    @property
    def pode_ser_finalizada(self):
        """
        🔧 NOVA PROPRIEDADE: Verifica se a OT pode ser finalizada.
        
        Regras:
        1. Status deve permitir transição para ENTREGUE
        2. Deve ter pelo menos um arquivo anexado
        """
        return (
            self.pode_transicionar_para('ENTREGUE') and 
            self.arquivos.count() > 0
        )
    
    @property
    def motivo_nao_finalizar(self):
        """
        🔧 NOVA PROPRIEDADE: Retorna o motivo pelo qual não pode finalizar.
        """
        motivos = []
        
        if not self.pode_transicionar_para('ENTREGUE'):
            motivos.append(f'Status atual ({self.get_status_display()}) não permite finalização')
        
        if self.arquivos.count() == 0:
            motivos.append('Nenhum documento anexado (obrigatório: canhoto, foto da entrega, etc.)')
        
        return motivos if motivos else ['OT pode ser finalizada']
    
    def get_arquivos_por_tipo(self):
        """
        🔧 NOVO MÉTODO: Retorna arquivos agrupados por tipo.
        """
        arquivos_dict = {}
        for arquivo in self.arquivos.all():
            tipo = arquivo.tipo
            if tipo not in arquivos_dict:
                arquivos_dict[tipo] = []
            arquivos_dict[tipo].append(arquivo)
        return arquivos_dict
    
    def tem_canhoto(self):
        """
        🔧 NOVO MÉTODO: Verifica se tem canhoto anexado.
        """
        return self.arquivos.filter(tipo='CANHOTO').exists()
    
    def tem_foto_entrega(self):
        """
        🔧 NOVO MÉTODO: Verifica se tem foto de entrega.
        """
        return self.arquivos.filter(tipo='FOTO_ENTREGA').exists()
    
    def pode_transicionar_para(self, novo_status):
        """
        Verifica se é possível transicionar para o novo status.
        
        Regras de transição:
        - INICIADA → EM_CARREGAMENTO, CANCELADA
        - EM_CARREGAMENTO → EM_TRANSITO, CANCELADA
        - EM_TRANSITO → ENTREGUE, ENTREGUE_PARCIAL, CANCELADA
        - Estados finais não podem transicionar
        """
        transicoes_validas = {
            'INICIADA': ['EM_CARREGAMENTO', 'CANCELADA'],
            'EM_CARREGAMENTO': ['EM_TRANSITO', 'CANCELADA'],
            'EM_TRANSITO': ['ENTREGUE', 'ENTREGUE_PARCIAL', 'CANCELADA'],
            'ENTREGUE': [],
            'ENTREGUE_PARCIAL': [],
            'CANCELADA': [],
        }
        
        return novo_status in transicoes_validas.get(self.status, [])
    
    def atualizar_status(self, novo_status, usuario, observacao=''):    
        """
        Atualiza o status da OT com validação e cria registro de atualização.
        
        Args:
            novo_status: Novo status desejado
            usuario: Usuário que está fazendo a atualização
            observacao: Observação sobre a mudança
            
        Returns:
            bool: True se atualizado com sucesso
            
        Raises:
            ValidationError: Se a transição não for válida
        """
        print(f"🔄 ATUALIZAR STATUS: {self.numero_ot}")
        print(f"🔄 Status atual: {self.status}")
        print(f"🔄 Novo status: {novo_status}")
        
        # 🔧 CORREÇÃO: Capturar status anterior ANTES de validar/alterar
        status_anterior = self.status
        
        # Validar transição
        if not self.pode_transicionar_para(novo_status):
            raise ValidationError(
                f'Não é possível transicionar de {self.get_status_display()} para {dict(self.STATUS_CHOICES)[novo_status]}'
            )
        
        # 🔧 CORREÇÃO: Atualizar status APENAS após validação
        self.status = novo_status
        self.save()
        
        print(f"✅ Status atualizado: {status_anterior} → {novo_status}")
        
        # 🔧 CORREÇÃO: Usar status_anterior capturado e novo_status real
        # Criar registro de atualização
        AtualizacaoOT.objects.create(
            ordem_transporte=self,
            usuario=usuario,
            tipo_atualizacao='STATUS',
            descricao=f'Status alterado para {self.get_status_display()}',
            observacao=observacao,
            status_anterior=status_anterior,  # ✅ Status anterior correto
            status_novo=novo_status           # ✅ Status novo correto
        )
        
        print(f"📝 Atualização registrada: {status_anterior} → {novo_status}")
        return True
    
    def transferir_para(self, novo_motorista, usuario_solicitante, motivo=''):
        """
        Transfere a OT para outro motorista com sistema de aceitação.
        
        🆕 NOVA LÓGICA COM ACEITAÇÃO:
        - Motorista atual → Outro motorista: AGUARDANDO_ACEITACAO (motorista destino deve aceitar)
        - Outros motoristas → Motorista: PENDENTE (logística deve aprovar)
        - Logística/Admin → Qualquer: APROVADA (aprovação automática)
        
        Args:
            novo_motorista: Motorista que receberá a OT
            usuario_solicitante: Usuário que está solicitando a transferência
            motivo: Motivo da transferência
            
        Returns:
            TransferenciaOT: Objeto de transferência criado
        """
        if not self.pode_ser_transferida:
            raise ValidationError('Esta OT não pode ser transferida no status atual')
        
        # Determinar status inicial baseado em quem está transferindo
        if usuario_solicitante.role in ['logistica', 'admin']:
            # Logística/Admin podem transferir diretamente
            print(f"🔄 Transferência por logística/admin - aprovação automática")
            status_inicial = 'APROVADA'
            aprovado_por = usuario_solicitante
            data_resposta = timezone.now()
            
        elif usuario_solicitante == self.motorista_atual:
            # Motorista atual transfere - aguarda aceitação do destino
            print(f"🔄 Transferência direta - aguardando aceitação do motorista destino")
            status_inicial = 'AGUARDANDO_ACEITACAO'
            aprovado_por = None
            data_resposta = None
            
        else:
            # Outro motorista solicita - aguarda aprovação da logística
            print(f"🔄 Solicitação de transferência - aguarda aprovação da logística")
            status_inicial = 'PENDENTE'
            aprovado_por = None
            data_resposta = None
        
        # Criar registro de transferência
        transferencia = TransferenciaOT.objects.create(
            ordem_transporte=self,
            motorista_origem=self.motorista_atual,
            motorista_destino=novo_motorista,
            solicitado_por=usuario_solicitante,
            aprovado_por=aprovado_por,
            motivo=motivo,
            status=status_inicial,
            data_resposta=data_resposta
        )
        
        # Se for aprovação automática (logística/admin), atualizar OT imediatamente
        if status_inicial == 'APROVADA':
            self.motorista_atual = novo_motorista
            self.save(update_fields=['motorista_atual'])
            
            # Criar registro de atualização
            AtualizacaoOT.objects.create(
                ordem_transporte=self,
                usuario=usuario_solicitante,
                tipo_atualizacao='TRANSFERENCIA',
                descricao=f'OT transferida de {transferencia.motorista_origem.full_name} para {transferencia.motorista_destino.full_name}',
                observacao=f'{motivo} (Aprovada automaticamente por {usuario_solicitante.role})'
            )
        
        print(f"✅ Transferência criada com status: {status_inicial}")
        return transferencia
    
    def adicionar_arquivo(self, arquivo, tipo, usuario, descricao=''):
        """
        Adiciona um arquivo à OT.
        
        Args:
            arquivo: Arquivo a ser adicionado
            tipo: Tipo do arquivo (CANHOTO, FOTO_ENTREGA, etc)
            usuario: Usuário que está adicionando
            descricao: Descrição do arquivo
            
        Returns:
            Arquivo: Objeto arquivo criado
        """
        return Arquivo.objects.create(
            ordem_transporte=self,
            arquivo=arquivo,
            tipo=tipo,
            enviado_por=usuario,
            descricao=descricao
        )
    
    def get_timeline(self):
        """
        Retorna a timeline completa da OT ordenada por data.
        Inclui atualizações, transferências e uploads de arquivos.
        """
        from itertools import chain
        from operator import attrgetter
        
        # Buscar todas as atualizações
        atualizacoes = self.atualizacoes.all()
        novo_seq = 1
        
        # Buscar todas as transferências
        transferencias = self.transferencias.all()
        
        # Buscar todos os arquivos
        arquivos = self.arquivos.all()
        
        # Combinar e ordenar por data
        timeline = sorted(
            chain(atualizacoes, transferencias, arquivos),
            key=attrgetter('created_at' if hasattr(atualizacoes.first(), 'created_at') else 'data_criacao'),
            reverse=True
        )
        
        return timeline
        return f"{prefixo}{novo_seq:03d}"

# ==============================================================================
# 📄 MODELO DE ARQUIVOS E DOCUMENTOS
# ==============================================================================

class Arquivo(models.Model):
    """
    Modelo para armazenar arquivos relacionados às OTs.
    
    🎯 PROPÓSITO: Centralizar todos os documentos da OT
    📁 TIPOS: Canhotos, fotos, comprovantes, etc.
    """
    
    TIPO_CHOICES = [
        ('CANHOTO', 'Canhoto de Entrega'),
        ('FOTO_ENTREGA', 'Foto da Entrega'),
        ('COMPROVANTE', 'Comprovante'),
        ('DOCUMENTO', 'Documento'),
        ('OUTRO', 'Outro'),
    ]
    
    ordem_transporte = models.ForeignKey(
        OrdemTransporte,
        on_delete=models.CASCADE,
        related_name='arquivos',
        verbose_name='Ordem de Transporte'
    )
    
    arquivo = models.FileField(
        'Arquivo',
        upload_to='ots/%Y/%m/',
        help_text='Arquivo do documento'
    )
    
    tipo = models.CharField(
        'Tipo de Arquivo',
        max_length=20,
        choices=TIPO_CHOICES,
        default='DOCUMENTO'
    )
    
    descricao = models.CharField(
        'Descrição',
        max_length=255,
        blank=True,
        help_text='Descrição do arquivo'
    )
    
    enviado_por = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='arquivos_enviados',
        verbose_name='Enviado por'
    )
    
    data_envio = models.DateTimeField(
        'Data do Envio',
        auto_now_add=True
    )
    @property
    def nome_arquivo(self):
        """Retorna apenas o nome do arquivo."""
        import os
        return os.path.basename(self.arquivo.name)
    
    @property
    def tamanho_formatado(self):
        """Retorna o tamanho do arquivo formatado."""
        tamanho = self.arquivo.size
        for unidade in ['B', 'KB', 'MB', 'GB']:
            if tamanho < 1024.0:
                return f"{tamanho:.1f} {unidade}"
            tamanho /= 1024.0
        return f"{tamanho:.1f} TB"
    
    class Meta:
        verbose_name = 'Arquivo'
        verbose_name_plural = 'Arquivos'
        ordering = ['-data_envio']
    
    def __str__(self):
        return f'{self.get_tipo_display()} - OT {self.ordem_transporte.numero_ot}'


# ==============================================================================
# 🔄 MODELO DE TRANSFERÊNCIAS ENTRE MOTORISTAS
# ==============================================================================

class TransferenciaOT(models.Model):
    """
    Modelo para transferências de OT entre motoristas.
    
    🎯 PROPÓSITO: Rastrear transferências com aprovação
    📋 FLUXO: Solicitação → Aprovação → Execução
    """
    
    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente de Aprovação'),
        ('AGUARDANDO_ACEITACAO', 'Aguardando Aceitação do Motorista'),
        ('APROVADA', 'Aprovada'),
        ('REJEITADA', 'Rejeitada'),
        ('CANCELADA', 'Cancelada'),
    ]
    
    ordem_transporte = models.ForeignKey(
        OrdemTransporte,
        on_delete=models.CASCADE,
        related_name='transferencias',
        verbose_name='Ordem de Transporte'
    )
    
    motorista_origem = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='transferencias_enviadas',
        verbose_name='Motorista de Origem'
    )
    
    motorista_destino = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='transferencias_recebidas',
        verbose_name='Motorista de Destino'
    )
    
    solicitado_por = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='transferencias_solicitadas',
        verbose_name='Solicitado por'
    )
    
    aprovado_por = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='transferencias_aprovadas',
        verbose_name='Aprovado por',
        null=True,
        blank=True
    )
    
    status = models.CharField(
        'Status',
        max_length=25,
        choices=STATUS_CHOICES,
        default='PENDENTE'
    )
    
    motivo = models.TextField(
        'Motivo da Transferência',
        help_text='Motivo ou justificativa para a transferência'
    )
    
    observacao_aprovacao = models.TextField(
        'Observação da Aprovação/Rejeição',
        blank=True,
        help_text='Observação do aprovador/rejeitador'
    )
    
    data_solicitacao = models.DateTimeField(
        'Data da Solicitação',
        auto_now_add=True
    )
    
    data_resposta = models.DateTimeField(
        'Data da Resposta',
        null=True,
        blank=True
    )
    
    # 🌍 LOCALIZAÇÃO DA TRANSFERÊNCIA (GPS CORRIGIDO)
    latitude = models.DecimalField(
        'Latitude',
        max_digits=18,         # 🔧 NOVO: Suporta até -XX.XXXXXXXXXXXXXXX (15 decimais)
        decimal_places=15,     # 🔧 NOVO: Precisão submilimétrica
        null=True,
        blank=True,
    )
    
    longitude = models.DecimalField(
        'Longitude',
        max_digits=17,         # 🔧 NOVO: Suporta até -XXX.XXXXXXXXXXXXXX (14 decimais)
        decimal_places=15,     # 🔧 NOVO: Precisão submilimétrica
        null=True,
        blank=True,
    )
    
    endereco = models.CharField(
        'Endereço da Transferência',
        max_length=255,
        blank=True
    )
    
    class Meta:
        verbose_name = 'Transferência de OT'
        verbose_name_plural = 'Transferências de OT'
        ordering = ['-data_solicitacao']
    
    def __str__(self):
        return f'Transferência OT {self.ordem_transporte.numero_ot}: {self.motorista_origem} → {self.motorista_destino} ({self.get_status_display()})'

    def aceitar(self, usuario_aceitador, observacao=''):
        """
        Aceita a transferência (motorista destino aceita).
        
        Args:
            usuario_aceitador: Usuário que está aceitando (deve ser motorista_destino)
            observacao: Observação sobre a aceitação
            
        Raises:
            ValidationError: Se não pode aceitar
        """
        print(f"✅ ACEITAR TRANSFERENCIA: {self.id}")
        
        # Validações
        if self.status != 'AGUARDANDO_ACEITACAO':
            raise ValidationError(f'Apenas transferências aguardando aceitação podem ser aceitas. Status atual: {self.status}')
        
        if usuario_aceitador != self.motorista_destino:
            raise ValidationError('Apenas o motorista de destino pode aceitar a transferência')
        
        # Aceitar transferência
        self.status = 'APROVADA'
        self.aprovado_por = usuario_aceitador
        self.data_resposta = timezone.now()
        self.observacao_aprovacao = observacao or 'Transferência aceita pelo motorista de destino'
        self.save()
        
        # Atualizar motorista atual da OT
        self.ordem_transporte.motorista_atual = self.motorista_destino
        self.ordem_transporte.save()
        
        # Criar registro de atualização
        AtualizacaoOT.objects.create(
            ordem_transporte=self.ordem_transporte,
            usuario=usuario_aceitador,
            tipo_atualizacao='TRANSFERENCIA',
            descricao=f'Transferência aceita: OT passou de {self.motorista_origem.full_name} para {self.motorista_destino.full_name}',
            observacao=self.observacao_aprovacao
        )
        
        print(f"✅ Transferência {self.id} aceita com sucesso")
    
    def recusar(self, usuario_recusador, observacao):
        """
        Recusa a transferência (motorista destino recusa).
        
        Args:
            usuario_recusador: Usuário que está recusando (deve ser motorista_destino)
            observacao: Motivo da recusa (obrigatório)
            
        Raises:
            ValidationError: Se não pode recusar
        """
        print(f"❌ RECUSAR TRANSFERENCIA: {self.id}")
        
        # Validações
        if self.status != 'AGUARDANDO_ACEITACAO':
            raise ValidationError(f'Apenas transferências aguardando aceitação podem ser recusadas. Status atual: {self.status}')
        
        if usuario_recusador != self.motorista_destino:
            raise ValidationError('Apenas o motorista de destino pode recusar a transferência')
        
        if not observacao:
            raise ValidationError('Observação é obrigatória para recusar transferência')
        
        # Recusar transferência
        self.status = 'REJEITADA'
        self.aprovado_por = usuario_recusador
        self.data_resposta = timezone.now()
        self.observacao_aprovacao = observacao
        self.save()
        
        # OT continua com motorista original (não alterar motorista_atual)
        
        print(f"❌ Transferência {self.id} recusada")
    
    def cancelar(self, usuario_cancelador, observacao=''):
        """
        Cancela a transferência (quem solicitou pode cancelar).
        
        Args:
            usuario_cancelador: Usuário que está cancelando
            observacao: Motivo do cancelamento
            
        Raises:
            ValidationError: Se não pode cancelar
        """
        print(f"🚫 CANCELAR TRANSFERENCIA: {self.id}")
        
        # Validações
        if self.status not in ['PENDENTE', 'AGUARDANDO_ACEITACAO']:
            raise ValidationError(f'Apenas transferências pendentes ou aguardando aceitação podem ser canceladas. Status atual: {self.status}')
        
        # Verificar permissões para cancelar
        pode_cancelar = (
            usuario_cancelador == self.solicitado_por or  # Quem solicitou
            usuario_cancelador == self.motorista_origem or  # Motorista origem
            usuario_cancelador.role in ['logistica', 'admin']  # Logística/Admin
        )
        
        if not pode_cancelar:
            raise ValidationError('Você não tem permissão para cancelar esta transferência')
        
        # Cancelar transferência
        self.status = 'CANCELADA'
        self.aprovado_por = usuario_cancelador
        self.data_resposta = timezone.now()
        self.observacao_aprovacao = observacao or 'Transferência cancelada'
        self.save()
        
        # OT continua com motorista original (não alterar motorista_atual)
        
        print(f"🚫 Transferência {self.id} cancelada")
    
    # ==============================================================================
    # 🔧 MÉTODOS EXISTENTES MANTIDOS E MELHORADOS
    # ==============================================================================
    
    def aprovar(self, usuario_aprovador, observacao=''):
        """
        Aprova a transferência (logística aprova solicitação).
        
        Args:
            usuario_aprovador: Usuário que está aprovando (logística/admin)
            observacao: Observação sobre a aprovação
        """
        print(f"✅ APROVAR TRANSFERENCIA LOGISTICA: {self.id}")
        
        if self.status != 'PENDENTE':
            raise ValidationError(f'Apenas transferências pendentes podem ser aprovadas pela logística. Status atual: {self.status}')
        
        if usuario_aprovador.role not in ['logistica', 'admin']:
            raise ValidationError('Apenas logística ou admin podem aprovar transferências')
        
        self.status = 'APROVADA'
        self.aprovado_por = usuario_aprovador
        self.data_resposta = timezone.now()
        self.observacao_aprovacao = observacao or 'Aprovada pela logística'
        self.save()
        
        # Atualizar motorista_atual da OT
        self.ordem_transporte.motorista_atual = self.motorista_destino
        self.ordem_transporte.save()
        
        # Criar registro de atualização
        AtualizacaoOT.objects.create(
            ordem_transporte=self.ordem_transporte,
            usuario=usuario_aprovador,
            tipo_atualizacao='TRANSFERENCIA',
            descricao=f'Transferência aprovada pela logística: {self.motorista_origem.full_name} → {self.motorista_destino.full_name}',
            observacao=self.observacao_aprovacao
        )
        
        print(f"✅ Transferência {self.id} aprovada pela logística")
    
    def rejeitar(self, usuario_rejeitador, observacao):
        """
        Rejeita a transferência (logística rejeita solicitação).
        
        Args:
            usuario_rejeitador: Usuário que está rejeitando (logística/admin)
            observacao: Motivo da rejeição (obrigatório)
        """
        print(f"❌ REJEITAR TRANSFERENCIA LOGISTICA: {self.id}")
        
        if self.status != 'PENDENTE':
            raise ValidationError(f'Apenas transferências pendentes podem ser rejeitadas pela logística. Status atual: {self.status}')
        
        if usuario_rejeitador.role not in ['logistica', 'admin']:
            raise ValidationError('Apenas logística ou admin podem rejeitar transferências')
        
        if not observacao:
            raise ValidationError('Observação é obrigatória para rejeitar transferência')
        
        self.status = 'REJEITADA'
        self.aprovado_por = usuario_rejeitador
        self.data_resposta = timezone.now()
        self.observacao_aprovacao = observacao
        self.save()
        
        print(f"❌ Transferência {self.id} rejeitada pela logística")
    
    # ==============================================================================
    # 🔍 MÉTODOS DE VERIFICAÇÃO
    # ==============================================================================
    
    def pode_ser_aceita_por(self, usuario):
        """
        Verifica se o usuário pode aceitar esta transferência.
        """
        return (
            self.status == 'AGUARDANDO_ACEITACAO' and
            usuario == self.motorista_destino
        )
    
    def pode_ser_recusada_por(self, usuario):
        """
        Verifica se o usuário pode recusar esta transferência.
        """
        return (
            self.status == 'AGUARDANDO_ACEITACAO' and
            usuario == self.motorista_destino
        )
    
    def pode_ser_cancelada_por(self, usuario):
        """
        Verifica se o usuário pode cancelar esta transferência.
        """
        return (
            self.status in ['PENDENTE', 'AGUARDANDO_ACEITACAO'] and
            (
                usuario == self.solicitado_por or
                usuario == self.motorista_origem or
                usuario.role in ['logistica', 'admin']
            )
        )
    
    def pode_ser_aprovada_por(self, usuario):
        """
        Verifica se o usuário pode aprovar esta transferência (logística).
        """
        return (
            self.status == 'PENDENTE' and
            usuario.role in ['logistica', 'admin']
        )
    
    def esta_finalizada(self):
        """
        Verifica se a transferência está em estado final.
        """
        return self.status in ['APROVADA', 'REJEITADA', 'CANCELADA']
    
    def get_tipo_transferencia(self):
        """
        Retorna o tipo de transferência baseado no fluxo.
        """
        if self.status == 'AGUARDANDO_ACEITACAO':
            return 'DIRETA'  # Motorista → Motorista (aguarda aceitação)
        elif self.status == 'PENDENTE':
            return 'SOLICITACAO'  # Outro → Motorista (aguarda aprovação logística)
        elif self.solicitado_por.role in ['logistica', 'admin']:
            return 'LOGISTICA'  # Logística → Qualquer (aprovação automática)
        else:
            return 'OUTROS'


# ==============================================================================
# 📊 MODELO DE ATUALIZAÇÕES E TIMELINE
# ==============================================================================

class AtualizacaoOT(models.Model):
    """
    Modelo para registrar todas as atualizações de uma OT.
    
    🎯 PROPÓSITO: Criar uma timeline completa de eventos
    📋 TIPOS: Status, observação, localização, transferência, arquivo
    """
    
    TIPO_ATUALIZACAO_CHOICES = [
        ('STATUS', 'Mudança de Status'),
        ('OBSERVACAO', 'Observação'),
        ('LOCALIZACAO', 'Atualização de Localização'),
        ('TRANSFERENCIA', 'Transferência'),
        ('ARQUIVO', 'Upload de Arquivo'),
        ('OUTRO', 'Outro'),
    ]
    
    ordem_transporte = models.ForeignKey(
        OrdemTransporte,
        on_delete=models.CASCADE,
        related_name='atualizacoes',
        verbose_name='Ordem de Transporte'
    )
    
    usuario = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='atualizacoes_ot',
        verbose_name='Usuário'
    )
    
    tipo_atualizacao = models.CharField(
        'Tipo de Atualização',
        max_length=20,
        choices=TIPO_ATUALIZACAO_CHOICES
    )
    
    descricao = models.TextField(
        'Descrição',
        help_text='Descrição da atualização'
    )
    
    observacao = models.TextField(
        'Observação',
        blank=True,
        help_text='Observação adicional'
    )
    
    # Campos específicos para mudança de status
    status_anterior = models.CharField(
        'Status Anterior',
        max_length=20,
        blank=True,
        choices=OrdemTransporte.STATUS_CHOICES
    )
    
    status_novo = models.CharField(
        'Status Novo',
        max_length=20,
        blank=True,
        choices=OrdemTransporte.STATUS_CHOICES
    )
    
    # 🌍 LOCALIZAÇÃO NO MOMENTO DA ATUALIZAÇÃO (GPS CORRIGIDO)
    latitude = models.DecimalField(
        'Latitude',
        max_digits=18,         # 🔧 NOVO: Suporta até -XX.XXXXXXXXXXXXXXX (15 decimais)
        decimal_places=15,     # 🔧 NOVO: Precisão submilimétrica
        null=True,
        blank=True,
    )
    
    longitude = models.DecimalField(
        'Longitude',
        max_digits=17,         # 🔧 NOVO: Suporta até -XXX.XXXXXXXXXXXXXX (14 decimais)
        decimal_places=15,     # 🔧 NOVO: Precisão submilimétrica
        null=True,
        blank=True,
    )
    
    endereco = models.CharField(
        'Endereço',
        max_length=255,
        blank=True,
        help_text='Endereço no momento da atualização'
    )
    
    data_criacao = models.DateTimeField(
        'Data da Atualização',
        auto_now_add=True
    )
    
    class Meta:
        verbose_name = 'Atualização de OT'
        verbose_name_plural = 'Atualizações de OT'
        ordering = ['-data_criacao']
    
    def __str__(self):
        return f'{self.get_tipo_atualizacao_display()} - OT {self.ordem_transporte.numero_ot}'


# ==============================================================================
# 🎯 SINAIS (SIGNALS) - Para automatizações
# ==============================================================================

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=OrdemTransporte)
def criar_atualizacao_inicial(sender, instance, created, **kwargs):
    """
    Cria uma atualização inicial quando uma OT é criada.
    """
    if created:
        AtualizacaoOT.objects.create(
            ordem_transporte=instance,
            usuario=instance.motorista_criador,
            tipo_atualizacao='STATUS',
            descricao=f'OT criada com status {instance.get_status_display()}',
            observacao=f'Cliente: {instance.cliente_nome}',
            status_novo=instance.status,
            latitude=instance.latitude_origem,
            longitude=instance.longitude_origem,
            endereco=instance.endereco_origem
        )

