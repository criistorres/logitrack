# ==============================================================================
# URLs DO CORE - ORDENS DE TRANSPORTE
# ==============================================================================

# Arquivo: backend/core/urls.py
# CRIE este arquivo na pasta core/

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
# 📝 DOCUMENTAÇÃO DOS ENDPOINTS
# ==============================================================================

"""
🎯 GUIA DE USO DOS ENDPOINTS:

1. **CRIAR OT:**
   POST /api/ots/
   Headers: Authorization: Bearer <token>
   Body: {
       "cliente_nome": "Empresa ABC",
       "endereco_entrega": "Rua das Flores, 123",
       "cidade_entrega": "São Paulo",
       "observacoes": "Entrega urgente",
       "latitude_origem": -23.5505,
       "longitude_origem": -46.6333
   }

2. **LISTAR OTs:**
   GET /api/ots/
   Headers: Authorization: Bearer <token>
   Query params opcionais: ?status=EM_TRANSITO&motorista=123

3. **VER DETALHES:**
   GET /api/ots/123/
   Headers: Authorization: Bearer <token>

4. **ATUALIZAR OT:**
   PATCH /api/ots/123/
   Headers: Authorization: Bearer <token>
   Body: {
       "observacoes": "Nova observação",
       "status": "EM_TRANSITO"
   }

5. **TRANSFERIR OT:**
   POST /api/ots/123/transferir/
   Headers: Authorization: Bearer <token>
   Body: {
       "motorista_destino_id": 456,
       "motivo": "Veículo quebrou",
       "latitude": -23.5505,
       "longitude": -46.6333
   }

6. **ATUALIZAR STATUS:**
   PATCH /api/ots/123/status/
   Headers: Authorization: Bearer <token>
   Body: {
       "status": "EM_TRANSITO",
       "observacao": "Saindo do CD"
   }

7. **FINALIZAR OT:**
   POST /api/ots/123/finalizar/
   Headers: Authorization: Bearer <token>
   Body: {
       "observacoes_entrega": "Entregue ao Sr. João",
       "latitude_entrega": -23.5505,
       "longitude_entrega": -46.6333,
       "endereco_entrega_real": "Portaria principal"
   }

8. **UPLOAD DE ARQUIVO:**
   POST /api/ots/123/arquivos/
   Headers: Authorization: Bearer <token>
   Form Data:
       arquivo: <file>
       tipo: "CANHOTO"
       descricao: "Canhoto assinado"

9. **BUSCAR OTs:**
   GET /api/ots/buscar/?numero_ot=OT20250426001
   GET /api/ots/buscar/?cliente_nome=Empresa
   GET /api/ots/buscar/?status=EM_TRANSITO
   Headers: Authorization: Bearer <token>

10. **ESTATÍSTICAS:**
    GET /api/ots/stats/
    Headers: Authorization: Bearer <token>

🔐 PERMISSÕES POR ENDPOINT:

- **Motoristas**: Podem criar, ver suas próprias OTs, transferir, atualizar status, upload arquivos
- **Logística**: Podem ver todas as OTs, aprovar transferências, relatórios completos
- **Admin**: Podem tudo

🚨 CÓDIGOS DE RESPOSTA:

- **200 OK**: Operação bem-sucedida
- **201 Created**: Recurso criado (OT, transferência, arquivo)
- **400 Bad Request**: Dados inválidos
- **401 Unauthorized**: Token inválido/ausente
- **403 Forbidden**: Sem permissão para esta ação
- **404 Not Found**: OT não encontrada
- **500 Internal Server Error**: Erro interno (veja logs)

🎯 COMO TESTAR:

1. Use a documentação .rest que será criada
2. Teste com diferentes tipos de usuário
3. Verifique logs no terminal Django
4. Use endpoints de debug para troubleshooting

📱 PRÓXIMOS PASSOS:

Após testar estes endpoints, implementaremos:
- Interface mobile React Native
- Dashboard web Next.js
- Notificações push
- Relatórios avançados
"""