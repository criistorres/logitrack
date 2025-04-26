# Sistema de Gerenciamento de Transporte - LogiTrack

## Visão Geral do Sistema

O LogiTrack é um sistema completo de gerenciamento de transporte que acompanha todo o ciclo de vida de uma entrega, desde a chegada do motorista ao Centro de Distribuição (CD) até a conclusão da entrega com documentação assinada. O sistema suporta transferências entre motoristas, rastreamento de notas fiscais e documentação completa do processo logístico.

## Perfis de Usuários

### 1. Motorista
- **Permissões**:
  - Criar novas Ordens de Transporte (OTs)
  - Vincular notas fiscais às OTs que criou
  - Atualizar status de OTs sob sua responsabilidade
  - Buscar OTs por número de nota fiscal
  - Transferir OTs para outros motoristas
  - Finalizar OTs com upload de documentação
  - Visualizar histórico de suas OTs

### 2. Equipe de Logística
- **Permissões**: 
  - Todas as permissões do motorista
  - Visualizar todas as OTs no sistema
  - Vincular notas fiscais a qualquer OT
  - Transferir qualquer OT entre motoristas
  - Aprovar transferências solicitadas
  - Adicionar/modificar OTs existentes
  - Acessar relatórios de desempenho e status
  - Gerenciar ocorrências e exceções

### 3. Administrador
- **Permissões**:
  - Todas as permissões da Equipe de Logística
  - Gerenciar usuários (criar, editar, ativar, desativar)
  - Configurar parâmetros do sistema
  - Acessar logs de auditoria
  - Definir regras de negócio e fluxos de trabalho
  - Gerar e exportar relatórios avançados

## Modelagem de Dados

### 1. Modelo: CustomUser (Usuários)
```python
class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Modelo de usuário que estende o AbstractBaseUser para personalização
    """
    email = models.EmailField('Email', unique=True)
    first_name = models.CharField('Nome', max_length=30, blank=True)
    last_name = models.CharField('Sobrenome', max_length=30, blank=True)
    is_active = models.BooleanField('Ativo', default=False)
    is_staff = models.BooleanField('Staff', default=False)
    date_joined = models.DateTimeField('Data de registro', default=timezone.now)
    
    ROLE_CHOICES = [
        ('motorista', 'Motorista'),
        ('logistica', 'Logística'),
        ('admin', 'Administrador'),
    ]
    role = models.CharField('Função', max_length=30, choices=ROLE_CHOICES)
    phone = models.CharField('Telefone', max_length=15, blank=True)
    cpf = models.CharField('CPF', max_length=11, unique=True)
    
    # Campos adicionais para motoristas
    cnh_numero = models.CharField('Número CNH', max_length=20, blank=True)
    cnh_categoria = models.CharField('Categoria CNH', max_length=5, blank=True)
    cnh_validade = models.DateField('Validade CNH', null=True, blank=True)
    
    # Foto do perfil
    foto_perfil = models.ImageField('Foto de Perfil', upload_to='usuarios/perfil/', null=True, blank=True)
    
    # Gerenciador personalizado
    objects = CustomUserManager()
    
    # Campo usado para login
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['cpf']
    
    # Métodos auxiliares
    def is_motorista(self):
        return self.role == 'motorista'
    
    def is_logistica(self):
        return self.role == 'logistica'
    
    def is_admin(self):
        return self.role == 'admin'
```

### 2. Modelo: OrdemTransporte (OT)
```python
class OrdemTransporte(models.Model):
    """
    Representa o ciclo completo de uma operação de transporte
    """
    # Identificação
    numero_ot = models.CharField('Número OT', max_length=20, unique=True)
    
    # Status do ciclo de vida
    STATUS_CHOICES = [
        ('iniciada', 'Iniciada'),
        ('em_carregamento', 'Em Carregamento'),
        ('em_transito', 'Em Trânsito'),
        ('entregue', 'Entregue'),
        ('entregue_parcial', 'Entregue Parcialmente'),
        ('cancelada', 'Cancelada'),
    ]
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='iniciada')
    
    # Relacionamentos com motoristas
    motorista_retirada = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='ots_retirada',
        limit_choices_to={'role': 'motorista'},
    )
    motorista_entrega = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='ots_entrega',
        null=True, blank=True,
        limit_choices_to={'role': 'motorista'},
    )
    
    # Datas de tracking
    data_criacao = models.DateTimeField('Criação', default=timezone.now)
    data_carregamento = models.DateTimeField('Carregamento', null=True, blank=True)
    data_inicio_transito = models.DateTimeField('Início do Trânsito', null=True, blank=True)
    data_entrega = models.DateTimeField('Entrega', null=True, blank=True)
    
    # Geolocalização de retirada e entrega
    local_retirada_lat = models.DecimalField('Latitude Retirada', max_digits=9, decimal_places=6, null=True, blank=True)
    local_retirada_lng = models.DecimalField('Longitude Retirada', max_digits=9, decimal_places=6, null=True, blank=True)
    local_entrega_lat = models.DecimalField('Latitude Entrega', max_digits=9, decimal_places=6, null=True, blank=True)
    local_entrega_lng = models.DecimalField('Longitude Entrega', max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Observações e comentários
    observacao_retirada = models.TextField('Observação Retirada', blank=True)
    observacao_entrega = models.TextField('Observação Entrega', blank=True)
    observacao_interna = models.TextField('Observação Interna', blank=True, help_text='Visível apenas para equipe de logística e admin')
    
    # Métricas operacionais
    tempo_espera_cd = models.DurationField('Tempo de Espera CD', null=True, blank=True)
    tempo_total_entrega = models.DurationField('Tempo Total de Entrega', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Ordem de Transporte'
        verbose_name_plural = 'Ordens de Transporte'
        ordering = ['-data_criacao']
    
    def __str__(self):
        return f"OT {self.numero_ot} - {self.get_status_display()}"
    
    # Métodos para transição de status
    def iniciar_carregamento(self):
        if self.status == 'iniciada':
            self.status = 'em_carregamento'
            self.data_carregamento = timezone.now()
            self.save(update_fields=['status', 'data_carregamento'])
            return True
        return False
    
    def iniciar_transito(self, motorista_entrega=None):
        if self.status in ['iniciada', 'em_carregamento']:
            self.status = 'em_transito'
            self.data_inicio_transito = timezone.now()
            
            # Se não houver troca de motorista, usa o mesmo da retirada
            if motorista_entrega:
                self.motorista_entrega = motorista_entrega
            else:
                self.motorista_entrega = self.motorista_retirada
                
            self.save(update_fields=['status', 'data_inicio_transito', 'motorista_entrega'])
            return True
        return False
    
    def finalizar_entrega(self, completa=True, latitude=None, longitude=None, observacao=None):
        if self.status == 'em_transito':
            self.status = 'entregue' if completa else 'entregue_parcial'
            self.data_entrega = timezone.now()
            
            if latitude and longitude:
                self.local_entrega_lat = latitude
                self.local_entrega_lng = longitude
                
            if observacao:
                self.observacao_entrega = observacao
                
            # Calcular tempo total da operação
            if self.data_criacao:
                self.tempo_total_entrega = self.data_entrega - self.data_criacao
                
            self.save()
            return True
        return False
    
    def transferir_motorista(self, novo_motorista):
        if self.status in ['iniciada', 'em_carregamento', 'em_transito']:
            self.motorista_entrega = novo_motorista
            
            # Se já estiver em trânsito, registra a transferência
            if self.status == 'em_transito':
                TransferenciaOT.objects.create(
                    ordem_transporte=self,
                    motorista_origem=self.motorista_entrega,
                    motorista_destino=novo_motorista,
                    data_transferencia=timezone.now()
                )
                
            self.save(update_fields=['motorista_entrega'])
            return True
        return False
        
    def gerar_numero_ot(self):
        """Gera um número único para a OT baseado na data e contador sequencial"""
        hoje = timezone.now().strftime('%Y%m%d')
        ultimo_numero = OrdemTransporte.objects.filter(
            numero_ot__startswith=f'OT{hoje}'
        ).order_by('-numero_ot').first()
        
        if ultimo_numero:
            sequencia = int(ultimo_numero.numero_ot[-5:]) + 1
        else:
            sequencia = 1
            
        self.numero_ot = f'OT{hoje}{sequencia:05d}'
        return self.numero_ot
```

### 3. Modelo: NotaFiscal
```python
class NotaFiscal(models.Model):
    """
    Representa uma nota fiscal vinculada a uma Ordem de Transporte
    """
    # Relacionamento com OT
    ordem_transporte = models.ForeignKey(
        OrdemTransporte,
        on_delete=models.CASCADE,
        related_name='notas_fiscais'
    )
    
    # Dados da nota fiscal
    numero = models.CharField('Número NF', max_length=50)
    serie = models.CharField('Série', max_length=10, blank=True)
    chave_acesso = models.CharField('Chave de Acesso', max_length=44, blank=True)
    data_emissao = models.DateField('Data Emissão', null=True, blank=True)
    
    # Informações de valor
    valor_total = models.DecimalField('Valor Total', max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Destinatário
    destinatario_nome = models.CharField('Nome Destinatário', max_length=200, blank=True)
    destinatario_cnpj = models.CharField('CNPJ Destinatário', max_length=14, blank=True)
    
    # Endereço de entrega
    endereco_entrega = models.TextField('Endereço Entrega', blank=True)
    cidade_entrega = models.CharField('Cidade', max_length=100, blank=True)
    uf_entrega = models.CharField('UF', max_length=2, blank=True)
    cep_entrega = models.CharField('CEP', max_length=8, blank=True)
    
    # Status da entrega desta nota específica
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('entregue', 'Entregue'),
        ('recusada', 'Recusada'),
        ('entregue_parcial', 'Entregue Parcialmente'),
    ]
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='pendente')
    
    # Motivo em caso de recusa
    motivo_recusa = models.TextField('Motivo de Recusa', blank=True)
    
    # Observações
    observacoes = models.TextField('Observações', blank=True)
    
    # Data e hora da entrega específica desta NF
    data_entrega = models.DateTimeField('Data/Hora da Entrega', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Nota Fiscal'
        verbose_name_plural = 'Notas Fiscais'
        # Garantir que não haja duplicidade de NF na mesma OT
        unique_together = [['ordem_transporte', 'numero', 'serie']]
    
    def __str__(self):
        return f"NF {self.numero} - {self.destinatario_nome}"
```

### 4. Modelo: Arquivo
```python
class Arquivo(models.Model):
    """
    Representa os arquivos anexados durante o processo de transporte
    """
    # Tipos de arquivo
    TIPO_CHOICES = [
        ('foto_retirada', 'Foto na Retirada'),
        ('foto_entrega', 'Foto na Entrega'),
        ('canhoto', 'Canhoto Assinado'),
        ('documento_fiscal', 'Documento Fiscal'),
        ('comprovante', 'Comprovante'),
        ('ocorrencia', 'Registro de Ocorrência'),
        ('outro', 'Outro'),
    ]
    
    # Relacionamentos
    ordem_transporte = models.ForeignKey(
        OrdemTransporte,
        on_delete=models.CASCADE,
        related_name='arquivos'
    )
    nota_fiscal = models.ForeignKey(
        NotaFiscal,
        on_delete=models.CASCADE,
        related_name='arquivos',
        null=True, blank=True  # Opcional, pois pode estar vinculado à OT sem NF específica
    )
    
    # Detalhes do arquivo
    tipo = models.CharField('Tipo', max_length=20, choices=TIPO_CHOICES)
    arquivo = models.FileField('Arquivo', upload_to='transportes/arquivos/%Y/%m/%d/')
    nome_arquivo = models.CharField('Nome do Arquivo', max_length=255)
    data_upload = models.DateTimeField('Data do Upload', default=timezone.now)
    
    # Quem enviou
    enviado_por = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        related_name='arquivos_enviados',
        null=True
    )
    
    # Campo para descrição adicional
    descricao = models.TextField('Descrição', blank=True)
    
    class Meta:
        verbose_name = 'Arquivo'
        verbose_name_plural = 'Arquivos'
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.nome_arquivo}"
```

### 5. Modelo: TransferenciaOT
```python
class TransferenciaOT(models.Model):
    """
    Registra histórico de transferências entre motoristas
    """
    ordem_transporte = models.ForeignKey(
        OrdemTransporte,
        on_delete=models.CASCADE,
        related_name='transferencias'
    )
    motorista_origem = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='transferencias_origem'
    )
    motorista_destino = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='transferencias_destino'
    )
    data_transferencia = models.DateTimeField('Data da Transferência', default=timezone.now)
    
    # Quem autorizou (se foi feito pela logística)
    autorizado_por = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        related_name='transferencias_autorizadas',
        null=True, blank=True
    )
    
    # Motivo da transferência
    motivo = models.TextField('Motivo', blank=True)
    
    # Localização da transferência
    latitude = models.DecimalField('Latitude', max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField('Longitude', max_digits=9, decimal_places=6, null=True, blank=True)
    
    class Meta:
        verbose_name = 'Transferência'
        verbose_name_plural = 'Transferências'
        ordering = ['-data_transferencia']
    
    def __str__(self):
        return f"Transferência de {self.motorista_origem} para {self.motorista_destino}"
```

### 6. Modelo: Ocorrencia
```python
class Ocorrencia(models.Model):
    """
    Registro de ocorrências durante o transporte
    """
    TIPO_CHOICES = [
        ('atraso', 'Atraso'),
        ('dano', 'Dano à Mercadoria'),
        ('extravio', 'Extravio'),
        ('recusa', 'Recusa de Recebimento'),
        ('divergencia', 'Divergência de Produto/Quantidade'),
        ('endereco', 'Endereço Não Localizado'),
        ('cliente_ausente', 'Cliente Ausente'),
        ('veiculo', 'Problema com Veículo'),
        ('outro', 'Outro'),
    ]
    
    ordem_transporte = models.ForeignKey(
        OrdemTransporte,
        on_delete=models.CASCADE,
        related_name='ocorrencias'
    )
    nota_fiscal = models.ForeignKey(
        NotaFiscal,
        on_delete=models.SET_NULL,
        related_name='ocorrencias',
        null=True, blank=True
    )
    
    tipo = models.CharField('Tipo', max_length=20, choices=TIPO_CHOICES)
    descricao = models.TextField('Descrição')
    
    # Quem registrou
    registrado_por = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='ocorrencias_registradas'
    )
    
    # Data e localização
    data_ocorrencia = models.DateTimeField('Data da Ocorrência', default=timezone.now)
    latitude = models.DecimalField('Latitude', max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField('Longitude', max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Tratativa
    STATUS_CHOICES = [
        ('aberta', 'Aberta'),
        ('em_analise', 'Em Análise'),
        ('resolvida', 'Resolvida'),
        ('cancelada', 'Cancelada'),
    ]
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='aberta')
    resolvido_por = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        related_name='ocorrencias_resolvidas',
        null=True, blank=True
    )
    data_resolucao = models.DateTimeField('Data da Resolução', null=True, blank=True)
    resolucao = models.TextField('Resolução', blank=True)
    
    class Meta:
        verbose_name = 'Ocorrência'
        verbose_name_plural = 'Ocorrências'
        ordering = ['-data_ocorrencia']
    
    def __str__(self):
        return f"{self.get_tipo_display()} - OT {self.ordem_transporte.numero_ot}"
```

## API Endpoints

### Autenticação

```
POST /api/auth/login/
POST /api/auth/logout/
POST /api/auth/signup/
GET /api/auth/user/
POST /api/auth/password/reset/
```

### Usuários (Admin)

```
GET /api/usuarios/
GET /api/usuarios/{id}/
POST /api/usuarios/
PUT /api/usuarios/{id}/
PATCH /api/usuarios/{id}/ativar/
PATCH /api/usuarios/{id}/desativar/
```

### Ordens de Transporte

```
# Listagem e detalhes
GET /api/ots/
GET /api/ots/{id}/
GET /api/ots/buscar-por-nota/{numero}/

# Criação e modificação
POST /api/ots/
PATCH /api/ots/{id}/

# Fluxo de status
POST /api/ots/{id}/iniciar-carregamento/
POST /api/ots/{id}/iniciar-transito/
POST /api/ots/{id}/finalizar/

# Transferência
POST /api/ots/{id}/transferir/
POST /api/ots/{id}/solicitar-transferencia/
POST /api/ots/{id}/aprovar-transferencia/

# Arquivos
POST /api/ots/{id}/arquivos/
GET /api/ots/{id}/arquivos/
```

### Notas Fiscais

```
GET /api/notas-fiscais/{id}/
POST /api/ots/{ot_id}/notas-fiscais/
PATCH /api/notas-fiscais/{id}/
POST /api/notas-fiscais/{id}/finalizar/
POST /api/notas-fiscais/{id}/registrar-ocorrencia/
```

### Ocorrências

```
GET /api/ocorrencias/
GET /api/ocorrencias/{id}/
POST /api/ocorrencias/
PATCH /api/ocorrencias/{id}/
POST /api/ocorrencias/{id}/resolver/
```

## Fluxo Principal do Sistema

### Fluxo 1: Entrega Direta por Único Motorista

1. **Chegada ao CD e Criação da OT**
   - **Ator**: Motorista
   - **Ação**: Registra chegada ao CD, criando nova OT
   - **Endpoint**: `POST /api/ots/`
   - **Status OT**: `iniciada`

2. **Vinculação de Notas Fiscais**
   - **Ator**: Motorista ou Logística
   - **Ação**: Escaneia/digita as NFs e vincula à OT
   - **Endpoint**: `POST /api/ots/{ot_id}/notas-fiscais/`
   - **Mudança**: OT passa para status `em_carregamento`

3. **Início do Transporte**
   - **Ator**: Motorista
   - **Ação**: Confirma início do transporte
   - **Endpoint**: `POST /api/ots/{id}/iniciar-transito/`
   - **Status OT**: `em_transito`

4. **Entrega ao Destinatário**
   - **Ator**: Motorista
   - **Ação**: Finaliza entrega, anexa canhotos
   - **Endpoint**: `POST /api/ots/{id}/finalizar/`
   - **Status OT**: `entregue` ou `entregue_parcial`

### Fluxo 2: Transferência entre Motoristas

1. **Chegada ao CD e Criação da OT**
   - **Ator**: Motorista A
   - **Ação**: Cria OT inicial
   - **Endpoint**: `POST /api/ots/`
   
2. **Vinculação de Notas e Início do Transporte**
   - **Ator**: Motorista A
   - **Ação**: Vincula NFs e inicia transporte
   - **Endpoints**: 
     - `POST /api/ots/{ot_id}/notas-fiscais/`
     - `POST /api/ots/{id}/iniciar-transito/`

3. **Transferência para Outro Motorista**
   - **Ator**: Motorista A
   - **Ação**: Transfere OT para Motorista B
   - **Endpoint**: `POST /api/ots/{id}/transferir/`
   - **Dados**: `{ "motorista_destino_id": 123, "motivo": "Troca de veículo" }`

4. **Continuação e Finalização pelo Novo Motorista**
   - **Ator**: Motorista B
   - **Ação**: Recebe OT e finaliza entrega
   - **Endpoint**: `POST /api/ots/{id}/finalizar/`

### Fluxo 3: Busca e Transferência por Nota Fiscal

1. **Busca da OT por Nota Fiscal**
   - **Ator**: Motorista B
   - **Ação**: Busca OT existente pelo número da NF
   - **Endpoint**: `GET /api/ots/buscar-por-nota/{numero}/`

2. **Solicitação de Transferência**
   - **Ator**: Motorista B
   - **Ação**: Solicita transferência da OT
   - **Endpoint**: `POST /api/ots/{id}/solicitar-transferencia/`

3. **Aprovação pela Logística**
   - **Ator**: Equipe de Logística
   - **Ação**: Aprova a transferência solicitada
   - **Endpoint**: `POST /api/ots/{id}/aprovar-transferencia/`

4. **Finalização pelo Novo Motorista**
   - **Ator**: Motorista B
   - **Ação**: Finaliza a entrega
   - **Endpoint**: `POST /api/ots/{id}/finalizar/`

## Permissões de Usuários

### Motorista
- Criar novas OTs
- Ver suas próprias OTs
- Vincular NFs às suas OTs
- Atualizar status das suas OTs
- Buscar OTs por número de NF
- Solicitar transferência de OTs
- Finalizar suas OTs
- Registrar ocorrências nas suas OTs

### Logística
- Ver todas as OTs
- Criar OTs para qualquer motorista
- Editar qualquer OT
- Aprovar/rejeitar transferências
- Resolver ocorrências
- Gerar relatórios operacionais
- Transferir OTs entre motoristas

### Administrador
- Gerenciar usuários (criar, editar, ativar/desativar)
- Configurar parâmetros do sistema
- Acessar logs e auditorias
- Todas as permissões da Logística

## Requisitos Técnicos

### Backend
- **Framework**: Django + Django REST Framework
- **Banco de Dados**: PostgreSQL
- **Autenticação**: Token-based (JWT)
- **Armazenamento de Arquivos**: AWS S3 ou sistema de arquivos local
- **Geolocalização**: Integração com API de mapas

### Frontend (App Móvel)
- **Framework**: React Native
- **Armazenamento Local**: AsyncStorage para dados offline
- **Captura de Imagem**: Camera API
- **Geolocalização**: Integração com GPS
- **Scanner**: Integração com leitor de código de barras/QR

### Frontend (Painel Web - Logística/Admin)
- **Framework**: React.js
- **Dashboard**: Visualização em tempo real das OTs
- **Mapas**: Rastreamento de entregas com geolocalização
- **Relatórios**: Gráficos e exportação para Excel/PDF

## Considerações de Implementação

### Funcionamento Offline
- O aplicativo móvel deve funcionar offline, sincronizando quando houver conexão
- Armazenar dados das OTs e NFs localmente
- Filas de sincronização para uploads de arquivos e atualizações

### Segurança
- Autenticação via JWT com refresh tokens
- Autorização baseada em roles (RBAC)
- Comunicação via HTTPS
- Validação de dados em frontend e backend

### Performance
- Paginação para listas grandes
- Compressão de imagens antes do upload
- Cache de dados frequentemente acessados
- Otimização de consultas ao banco de dados

### Integração
- API para integração com sistemas de ERP
- Webhooks para notificações
- Suporte a importação/exportação em massa

## Roadmap de Desenvolvimento

### Fase 1: MVP (Minimum Viable Product)
- Autenticação de usuários
- Criação e gerenciamento básico de OTs
- Fluxo de transferência simples
- Upload de canhotos

### Fase 2: Funcionalidades Completas
- Rastreamento por geolocalização
- Busca por NF
- Fluxo completo de transferência
- Sistema de ocorrências

### Fase 3: Otimização e Integrações
- Funcionamento offline
- Integração com sistemas externos
- Dashboard avançado
- Relatórios personalizados

### Fase 4: Escalabilidade e Recursos Avançados
- Previsão de entrega com IA
- Otimização de rotas
- Notificações para clientes
- APIs públicas para parceiros

## Casos de Uso

[Os casos de uso 1, 2 e 3 correspondem aos fluxos detalhados anteriormente]

## Conclusão

O Sistema de Gerenciamento de Transporte LogiTrack oferece uma solução completa para o rastreamento e gerenciamento de entregas, suportando o ciclo completo de transporte desde a retirada até a entrega final. Com suporte para transferências entre motoristas, registro de documentação e uma interface intuitiva, o sistema visa otimizar os processos logísticos, reduzir erros e fornecer visibilidade em tempo real para todos os envolvidos.
