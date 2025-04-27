# LogiTrack - Roadmap de Desenvolvimento

## Visão Geral

O LogiTrack é um sistema completo de gerenciamento de transporte que acompanha todo o ciclo de vida de uma entrega, desde a chegada do motorista ao Centro de Distribuição (CD) até a conclusão da entrega com documentação assinada. O sistema suporta transferências entre motoristas, rastreamento de notas fiscais e documentação completa do processo logístico.

## Estrutura do Repositório

```
logitrack/
  ├── backend/   # Projeto Django + Django REST Framework
  ├── mobile/    # Aplicativo React Native
  └── frontend/  # Painel web em React.js
```

## Fase 1: MVP (Minimum Viable Product) - Autenticação e Estrutura Básica

### Etapa 1.1: Configuração do Ambiente e Estrutura do Projeto

**Backend:**
1. Criar projeto Django com Django REST Framework
2. Configurar banco de dados SQLite (inicialmente)
3. Implementar modelo de usuário personalizado (CustomUser)
4. Configurar sistema de autenticação JWT

**Mobile:**
1. Configurar projeto React Native
2. Implementar navegação básica (React Navigation)
3. Criar estrutura de pastas
4. Configurar cliente HTTP (Axios)

**Frontend (Web):**
1. Configurar projeto React
2. Implementar estrutura de pastas
3. Configurar cliente HTTP (Axios)
4. Implementar gerenciamento de estado básico (Redux ou Context API)

### Etapa 1.2: Sistema de Autenticação

**Backend:**
1. Implementar endpoints de autenticação:
   - Login (`POST /api/auth/login/`)
   - Logout (`POST /api/auth/logout/`)
   - Cadastro de usuário (`POST /api/auth/signup/`)
   - Dados do usuário (`GET /api/auth/user/`)
   - Redefinição de senha (`POST /api/auth/password/reset/`)
2. Implementar middleware de autenticação

**Mobile:**
1. Criar telas de autenticação:
   - Login
   - Cadastro (apenas para testes)
   - Esqueci minha senha
2. Implementar armazenamento de token (AsyncStorage)
3. Criar contexto de autenticação para gerenciar estado do usuário

**Frontend (Web):**
1. Criar páginas de autenticação:
   - Login
   - Cadastro de novos usuários (para admin)
   - Redefinição de senha
2. Implementar armazenamento de token (localStorage)
3. Criar rotas protegidas

### Etapa 1.3: Gerenciamento de Usuários (Painel Admin)

**Backend:**
1. Implementar endpoints para gerenciamento de usuários:
   - Listar usuários (`GET /api/usuarios/`)
   - Detalhes do usuário (`GET /api/usuarios/{id}/`)
   - Criar usuário (`POST /api/usuarios/`)
   - Atualizar usuário (`PUT /api/usuarios/{id}/`)
   - Ativar/desativar usuário (`PATCH /api/usuarios/{id}/ativar/` e `/desativar/`)

**Frontend (Web):**
1. Criar interface de gerenciamento de usuários
2. Implementar formulário de criação/edição de usuários
3. Implementar listagem de usuários com filtros e paginação

## Fase 2: Funcionalidades Essenciais - Ordens de Transporte

### Etapa 2.1: Modelo de Dados Básico

**Backend:**
1. Implementar modelos principais:
   - OrdemTransporte
   - NotaFiscal
   - Arquivo
2. Configurar relações entre os modelos
3. Criar migrações e verificar estrutura do banco de dados

### Etapa 2.2: Criação e Gerenciamento de OTs

**Backend:**
1. Implementar endpoints de Ordens de Transporte:
   - Criar OT (`POST /api/ots/`)
   - Listar OTs (`GET /api/ots/`)
   - Detalhes da OT (`GET /api/ots/{id}/`)
   - Modificar OT (`PATCH /api/ots/{id}/`)

**Mobile:**
1. Criar tela de dashboard principal com lista de OTs do motorista
2. Implementar tela de criação de OT
3. Implementar tela de detalhes da OT

**Frontend (Web):**
1. Criar dashboard para visualização de todas as OTs
2. Implementar filtros e busca de OTs
3. Criar tela de detalhes da OT com histórico

### Etapa 2.3: Vinculação de Notas Fiscais

**Backend:**
1. Implementar endpoints para notas fiscais:
   - Vincular NF à OT (`POST /api/ots/{ot_id}/notas-fiscais/`)
   - Detalhes da NF (`GET /api/notas-fiscais/{id}/`)
   - Atualizar NF (`PATCH /api/notas-fiscais/{id}/`)

**Mobile:**
1. Criar interface para escanear código de barras/QR das NFs
2. Implementar tela para preenchimento manual dos dados da NF
3. Desenvolver funcionalidade para vincular NFs a uma OT existente

**Frontend (Web):**
1. Criar interface para visualização das NFs vinculadas a uma OT
2. Implementar funcionalidade para adicionar NFs manualmente

## Fase 3: Ciclo de Vida da OT e Fluxo de Trabalho

### Etapa 3.1: Gerenciamento de Status da OT

**Backend:**
1. Implementar endpoints para alteração de status:
   - Iniciar carregamento (`POST /api/ots/{id}/iniciar-carregamento/`)
   - Iniciar trânsito (`POST /api/ots/{id}/iniciar-transito/`)
   - Finalizar OT (`POST /api/ots/{id}/finalizar/`)

**Mobile:**
1. Criar interfaces para transição de status no fluxo de trabalho
2. Implementar validações para mudanças de status
3. Desenvolver indicadores visuais de status da OT

**Frontend (Web):**
1. Criar visualização do ciclo de vida da OT
2. Implementar controles para alteração manual de status (equipe de logística)
3. Desenvolver timeline visual de eventos da OT

### Etapa 3.2: Upload de Arquivos e Documentação

**Backend:**
1. Configurar armazenamento de arquivos (sistema local inicialmente)
2. Implementar endpoints para arquivos:
   - Upload de arquivo (`POST /api/ots/{id}/arquivos/`)
   - Listar arquivos (`GET /api/ots/{id}/arquivos/`)

**Mobile:**
1. Implementar captura de fotos usando a câmera
2. Criar funcionalidade para upload de documentos (canhotos, comprovantes)
3. Desenvolver visualização de arquivos anexados

**Frontend (Web):**
1. Criar interface para visualização de todos os arquivos vinculados
2. Implementar upload de documentos pela web
3. Desenvolver preview de imagens e PDFs

### Etapa 3.3: Transferência de OTs entre Motoristas

**Backend:**
1. Implementar endpoints de transferência:
   - Transferir diretamente (`POST /api/ots/{id}/transferir/`)
   - Solicitar transferência (`POST /api/ots/{id}/solicitar-transferencia/`)
   - Aprovar transferência (`POST /api/ots/{id}/aprovar-transferencia/`)
2. Implementar modelo TransferenciaOT para histórico

**Mobile:**
1. Criar interface para solicitação de transferência
2. Implementar busca de OT por número de nota fiscal
3. Desenvolver notificações de solicitação/aprovação

**Frontend (Web):**
1. Criar interface para gerenciamento de transferências
2. Implementar aprovação/rejeição de transferências solicitadas
3. Desenvolver histórico de transferências

## Fase 4: Recursos Avançados e Otimizações

### Etapa 4.1: Geolocalização e Rastreamento

**Backend:**
1. Implementar endpoints para registro de localização
2. Incorporar campos de latitude/longitude nos momentos críticos

**Mobile:**
1. Implementar serviço de localização em background
2. Criar funcionalidade para registrar localização em eventos importantes
3. Desenvolver visualização de mapa com rotas percorridas

**Frontend (Web):**
1. Criar dashboard de rastreamento em tempo real
2. Implementar visualização de mapas para todas as OTs ativas
3. Desenvolver histórico de localizações

### Etapa 4.2: Sistema de Ocorrências

**Backend:**
1. Implementar modelo de Ocorrencia
2. Criar endpoints para ocorrências:
   - Registrar ocorrência (`POST /api/ocorrencias/`)
   - Listar ocorrências (`GET /api/ocorrencias/`)
   - Resolver ocorrência (`POST /api/ocorrencias/{id}/resolver/`)

**Mobile:**
1. Criar interface para registro de ocorrências
2. Implementar anexos de fotos para ocorrências
3. Desenvolver acompanhamento de ocorrências abertas

**Frontend (Web):**
1. Criar dashboard de ocorrências
2. Implementar sistema de tratativas para equipe de logística
3. Desenvolver relatórios de ocorrências mais frequentes

### Etapa 4.3: Funcionamento Offline

**Mobile:**
1. Implementar banco de dados local (SQLite via React Native SQLite Storage)
2. Criar sistema de filas para sincronização
3. Desenvolver indicadores de status de sincronização

### Etapa 4.4: Relatórios e Análises

**Backend:**
1. Implementar endpoints para dados estatísticos
2. Criar cálculos de métricas importantes (tempo médio, ocorrências, etc.)

**Frontend (Web):**
1. Criar dashboard com gráficos e indicadores
2. Implementar filtros para relatórios
3. Desenvolver exportação para Excel/PDF

## Fase 5: Refinamentos e Integração

### Etapa 5.1: Melhorias de UX/UI

**Mobile e Frontend:**
1. Refinar interfaces com base no feedback dos usuários
2. Otimizar fluxos de trabalho
3. Implementar temas claro/escuro

### Etapa 5.2: Migração para PostgreSQL (Opcional)

**Backend:**
1. Configurar ambiente de produção com PostgreSQL
2. Migrar dados de SQLite para PostgreSQL
3. Ajustar configurações e otimizar consultas

### Etapa 5.3: Integração com Sistemas Externos

**Backend:**
1. Criar APIs para integração com sistemas ERP
2. Implementar webhooks para notificações
3. Desenvolver sistema de importação/exportação em massa

### Etapa 5.4: Testes e Otimização

1. Implementar testes automatizados
2. Otimizar consultas ao banco de dados
3. Melhorar performance geral

### Etapa 5.5: Implantação e Monitoramento

1. Configurar ambiente de produção
2. Implementar sistema de logs e monitoramento
3. Estabelecer processo de deployment contínuo

## Notas sobre Implementação

1. **SQLite vs PostgreSQL**: Inicialmente usaremos SQLite para facilitar o desenvolvimento e os testes. Em produção, pode ser necessário migrar para PostgreSQL para melhor desempenho e concorrência.

2. **Armazenamento de Arquivos**: Inicialmente, os arquivos serão armazenados localmente. Para produção, considerar migração para AWS S3 ou similar.

3. **Autenticação**: Utilizaremos JWT (JSON Web Tokens) para autenticação e autorização.

4. **Testes em Ambiente Local**: Durante o desenvolvimento, o backend e o frontend serão executados em localhost, enquanto o mobile será testado em emuladores ou dispositivos físicos.

## Comandos Importantes

Para cada etapa do desenvolvimento, serão fornecidos comandos específicos para execução. Todos os comandos serão documentados nos respectivos arquivos:

- `backend/backend-comandos.md`
- `mobile/mobile-comandos.md`
- `frontend/frontend-comandos.md`