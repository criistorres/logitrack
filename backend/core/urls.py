# ==============================================================================
# URLs DO CORE - ORDENS DE TRANSPORTE (VERSÃO CORRIGIDA)
# ==============================================================================

# Arquivo: backend/core/urls.py
# SUBSTITUA COMPLETAMENTE o conteúdo do arquivo core/urls.py

from django.urls import path
from .views import (
    # Views principais CRUD
    OrdemTransporteListCreateView,
    OrdemTransporteDetailView,
    
    # Views de ações específicas
    TransferirOTView,
    AtualizarStatusOTView,
    FinalizarOTView,
    UploadArquivoOTView,
    
    # Views de busca e relatórios
    BuscarOTView,
    estatisticas_ots,
    
    # Views de transferências
    AceitarTransferenciaView,
    RecusarTransferenciaView,
    CancelarTransferenciaView,
    MinhasTransferenciasView,
    TransferenciaOTDetailView,
    
    # Views de debugging
    debug_ot_info,
    debug_endpoints_ot,
)

# ==============================================================================
# 📋 MAPEAMENTO DE URLs - ORDENS DE TRANSPORTE
# ==============================================================================

"""
🎯 ESTRUTURA COMPLETA DOS ENDPOINTS DE OT:

CRUD BÁSICO:
- GET    /api/ots/                     → OrdemTransporteListCreateView (listar)
- POST   /api/ots/                     → OrdemTransporteListCreateView (criar)
- GET    /api/ots/{id}/                → OrdemTransporteDetailView (detalhes)
- PUT    /api/ots/{id}/                → OrdemTransporteDetailView (editar completo)
- PATCH  /api/ots/{id}/                → OrdemTransporteDetailView (editar parcial)

AÇÕES ESPECÍFICAS:
- POST   /api/ots/{id}/transferir/     → TransferirOTView
- PATCH  /api/ots/{id}/status/         → AtualizarStatusOTView
- POST   /api/ots/{id}/finalizar/      → FinalizarOTView
- POST   /api/ots/{id}/arquivos/       → UploadArquivoOTView

TRANSFERÊNCIAS:
- GET    /api/ots/transferencias/minhas/                → MinhasTransferenciasView
- POST   /api/ots/transferencias/{id}/aceitar/         → AceitarTransferenciaView
- POST   /api/ots/transferencias/{id}/recusar/         → RecusarTransferenciaView
- POST   /api/ots/transferencias/{id}/cancelar/        → CancelarTransferenciaView

BUSCA E RELATÓRIOS:
- GET    /api/ots/buscar/              → BuscarOTView
- GET    /api/ots/stats/               → estatisticas_ots

DEBUGGING:
- GET    /api/ots/debug/               → debug_ot_info (info geral)
- GET    /api/ots/debug/{id}/          → debug_ot_info (info específica)
- GET    /api/ots/endpoints/           → debug_endpoints_ot
"""

app_name = 'core'  # Namespace para as URLs

urlpatterns = [
    
    # ==============================================================================
    # 🚚 ENDPOINTS PRINCIPAIS - CRUD DE OTs
    # ==============================================================================
    
    path(
        '',
        OrdemTransporteListCreateView.as_view(),
        name='ot_list_create'
    ),
    # GET /api/ots/ - Lista OTs do usuário
    # POST /api/ots/ - Cria nova OT
    
    path(
        '<int:pk>/',
        OrdemTransporteDetailView.as_view(),
        name='ot_detail'
    ),
    # GET /api/ots/{id}/ - Detalhes da OT
    # PUT /api/ots/{id}/ - Editar OT (completo)
    # PATCH /api/ots/{id}/ - Editar OT (parcial)
    
    # ==============================================================================
    # 🔄 ENDPOINTS DE AÇÕES ESPECÍFICAS
    # ==============================================================================
    
    path(
        '<int:pk>/transferir/',
        TransferirOTView.as_view(),
        name='ot_transferir'
    ),
    # POST /api/ots/{id}/transferir/ - Transferir OT para outro motorista
    
    path(
        '<int:pk>/status/',
        AtualizarStatusOTView.as_view(),
        name='ot_status'
    ),
    # PATCH /api/ots/{id}/status/ - Atualizar apenas o status
    
    path(
        '<int:pk>/finalizar/',
        FinalizarOTView.as_view(),
        name='ot_finalizar'
    ),
    # POST /api/ots/{id}/finalizar/ - Finalizar OT como entregue
    
    path(
        '<int:pk>/arquivos/',
        UploadArquivoOTView.as_view(),
        name='ot_upload_arquivo'
    ),
    # POST /api/ots/{id}/arquivos/ - Upload de arquivos (canhotos, fotos, etc)
    
    # ==============================================================================
    # 🔄 ENDPOINTS DE TRANSFERÊNCIAS
    # ==============================================================================
    
    path(
        'transferencias/minhas/',
        MinhasTransferenciasView.as_view(),
        name='minhas_transferencias'
    ),
    # GET /api/ots/transferencias/minhas/ - Lista transferências do usuário

    path(
        'transferencias/<int:pk>/',
        TransferenciaOTDetailView.as_view(),
        name='transferencia_detail'
    ),
    
    path(
        'transferencias/<int:pk>/aceitar/',
        AceitarTransferenciaView.as_view(),
        name='aceitar_transferencia'
    ),
    # POST /api/ots/transferencias/{id}/aceitar/ - Aceitar transferência
    
    path(
        'transferencias/<int:pk>/recusar/',
        RecusarTransferenciaView.as_view(),
        name='recusar_transferencia'
    ),
    # POST /api/ots/transferencias/{id}/recusar/ - Recusar transferência
    
    path(
        'transferencias/<int:pk>/cancelar/',
        CancelarTransferenciaView.as_view(),
        name='cancelar_transferencia'
    ),
    # POST /api/ots/transferencias/{id}/cancelar/ - Cancelar transferência
    
    # ==============================================================================
    # 🔍 ENDPOINTS DE BUSCA E RELATÓRIOS
    # ==============================================================================
    
    path(
        'buscar/',
        BuscarOTView.as_view(),
        name='ot_buscar'
    ),
    # GET /api/ots/buscar/ - Buscar OTs por critérios
    # Query params: numero_ot, cliente_nome, status, motorista_id, data_inicio, data_fim
    
    path(
        'stats/',
        estatisticas_ots,
        name='ot_stats'
    ),
    # GET /api/ots/stats/ - Estatísticas e relatórios das OTs
    
    # ==============================================================================
    # 🛠️ ENDPOINTS DE DEBUGGING
    # ==============================================================================
    
    path(
        'debug/',
        debug_ot_info,
        name='ot_debug_general'
    ),
    # GET /api/ots/debug/ - Informações gerais de debug
    
    path(
        'debug/<int:pk>/',
        debug_ot_info,
        name='ot_debug_specific'
    ),
    # GET /api/ots/debug/{id}/ - Debug de OT específica
    
    path(
        'endpoints/',
        debug_endpoints_ot,
        name='ot_endpoints'
    ),
    # GET /api/ots/endpoints/ - Lista todos os endpoints disponíveis
]

# ==============================================================================
# 📝 DOCUMENTAÇÃO RÁPIDA DOS ENDPOINTS
# ==============================================================================

"""
🚀 COMO TESTAR:

1. **Criar OT:**
   POST /api/ots/
   Body: {"cliente_nome": "ABC", "endereco_entrega": "Rua X", "cidade_entrega": "SP"}

2. **Transferir OT:**
   POST /api/ots/1/transferir/
   Body: {"motorista_destino_id": 2, "motivo": "Problema mecânico"}

3. **Ver transferências:**
   GET /api/ots/transferencias/minhas/

4. **Aceitar transferência:**
   POST /api/ots/transferencias/1/aceitar/
   Body: {"observacao": "Aceito a transferência"}

5. **Finalizar OT:**
   POST /api/ots/1/finalizar/
   Body: {"observacoes_entrega": "Entregue com sucesso"}

📋 PRÓXIMOS PASSOS:
1. Aplicar esta correção
2. Corrigir o modelo TransferenciaOT  
3. Fazer as migrações
4. Testar endpoints
"""