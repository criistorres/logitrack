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

