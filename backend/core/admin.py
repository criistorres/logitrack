from django.contrib import admin
from .models import OrdemTransporte, Arquivo, TransferenciaOT, AtualizacaoOT

@admin.register(OrdemTransporte)
class OrdemTransporteAdmin(admin.ModelAdmin):
    list_display = (
        'numero_ot', 'cliente_nome', 'motorista_criador', 'motorista_atual',
        'status', 'data_criacao', 'data_finalizacao', 'ativa'
    )
    list_filter = ('status', 'ativa', 'data_criacao')
    search_fields = ('numero_ot', 'cliente_nome', 'motorista_criador__username', 'motorista_atual__username')
    readonly_fields = ('data_criacao', 'data_atualizacao', 'data_finalizacao')
    ordering = ('-data_criacao',)


@admin.register(Arquivo)
class ArquivoAdmin(admin.ModelAdmin):
    list_display = ('ordem_transporte', 'tipo', 'descricao', 'enviado_por', 'data_envio')
    list_filter = ('tipo', 'data_envio')
    search_fields = ('ordem_transporte__numero_ot', 'descricao', 'enviado_por__username')
    readonly_fields = ('data_envio',)


@admin.register(TransferenciaOT)
class TransferenciaOTAdmin(admin.ModelAdmin):
    list_display = (
        'ordem_transporte', 'motorista_origem', 'motorista_destino',
        'status', 'solicitado_por', 'aprovado_por', 'data_solicitacao', 'data_resposta'
    )
    list_filter = ('status', 'data_solicitacao')
    search_fields = (
        'ordem_transporte__numero_ot',
        'motorista_origem__username',
        'motorista_destino__username'
    )
    readonly_fields = ('data_solicitacao', 'data_resposta')


@admin.register(AtualizacaoOT)
class AtualizacaoOTAdmin(admin.ModelAdmin):
    list_display = (
        'ordem_transporte', 'tipo_atualizacao', 'usuario',
        'status_anterior', 'status_novo', 'data_criacao'
    )
    list_filter = ('tipo_atualizacao', 'data_criacao')
    search_fields = ('ordem_transporte__numero_ot', 'descricao', 'usuario__username')
    readonly_fields = ('data_criacao',)
