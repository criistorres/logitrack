# Situações Reais de Utilização do Sistema de Rastreamento Logístico

## Caso 1: Entrega Direta com Único Motorista

**Contexto**: Carlos é motorista da transportadora e precisa fazer um carregamento no CD de São Paulo para entrega em Campinas.

**Passo a passo real**:

1. **Chegada ao CD (7:30h)**
   - Carlos chega ao CD de São Paulo
   - Abre o aplicativo e registra sua chegada, criando uma OT
   - Seleciona "Criar nova OT", adiciona a observação "Chegando para carregamento - Rota Campinas" e o sistema captura sua localização
   - O sistema gera o número de OT: "OT2025042600123"

2. **Processo de Carregamento (8:00h)**
   - Enquanto a equipe do CD carrega o caminhão, Carlos ou um funcionário do CD escaneia as notas fiscais
   - No aplicativo, ele seleciona "Vincular Nota Fiscal", escolhe a OT e digitaliza os números das notas: "NFE-789456123", "NFE-789456124" e "NFE-789456125"
   - Para cada nota, o sistema registra o destinatário e valor correspondente
   - O status da OT muda automaticamente para "Em Carregamento"

3. **Início do Transporte (9:15h)**
   - Após concluir o carregamento, Carlos seleciona "Iniciar Transporte" no aplicativo
   - Confirma que ele mesmo fará a entrega
   - O sistema atualiza o status para "Em Trânsito" e registra o horário de saída

4. **Entrega ao Cliente (11:30h)**
   - Carlos chega ao destinatário em Campinas
   - Realiza a entrega e coleta o canhoto assinado
   - No aplicativo, seleciona "Finalizar Entrega", adiciona observação "Entregue ao Sr. Paulo no setor de recebimento", tira foto do canhoto assinado
   - O sistema finaliza a OT, marca como "Entregue" e registra hora e localização da entrega

5. **Visualização pela Equipe de Logística**
   - O time de logística vê em tempo real que a entrega foi concluída
   - Podem acessar fotos do canhoto e confirmar a entrega sem precisar esperar o retorno físico do documento

## Caso 2: Transferência Planejada entre Motoristas

**Contexto**: Sistema de transferência de carga entre um veículo maior que não pode entrar na região central e um veículo menor para última milha.

**Passo a passo real**:

1. **Início com o Primeiro Motorista (José)**
   - José chega ao CD com seu caminhão grande
   - Cria a OT "OT2025042600124" e escaneia as notas fiscais para entregas no centro da cidade
   - O sistema registra que estas entregas serão transferidas para veículos menores

2. **Cross-docking em Terminal Urbano (12:00h)**
   - José chega ao terminal urbano da transportadora
   - No aplicativo, seleciona "Transferir OT" e escolhe "Transferir para outro motorista"
   - Seleciona o motorista Antônio, que fará as entregas com uma van
   - Adiciona observação "Transferência para entrega em zona de restrição"

3. **Recebimento pelo Segundo Motorista (12:30h)**
   - Antônio recebe notificação no aplicativo sobre a transferência
   - Aceita a transferência, o que marca o horário exato do repasse
   - Confere as mercadorias fisicamente enquanto o aplicativo já mostra quais notas fiscais fazem parte da OT

4. **Realização das Entregas pelo Segundo Motorista (13:30h - 17:00h)**
   - Antônio faz várias entregas no centro da cidade
   - Para cada entrega, seleciona a nota fiscal correspondente dentro da OT
   - Marca cada nota como "Entregue" individualmente, anexando foto do canhoto
   - O sistema permite finalizar parcialmente, nota por nota

5. **Finalização Completa (17:15h)**
   - Após entregar todas as notas da OT, Antônio finaliza a OT completa
   - O sistema marca a OT como "Entregue" e notifica tanto a logística quanto José (motorista original)

## Caso 3: Transferência Não Planejada com Busca por Nota Fiscal

**Contexto**: Problemas com veículo exigem transferência de carga para outro motorista de forma emergencial.

**Passo a passo real**:

1. **Início Normal (8:00h)**
   - Márcia inicia seu dia criando uma OT "OT2025042600125" ao chegar no CD
   - Carrega mercadorias para várias cidades da região e vincula 12 notas fiscais à OT
   - Inicia o transporte normalmente

2. **Problema Mecânico (10:20h)**
   - O caminhão de Márcia apresenta problemas mecânicos na estrada
   - Ela contata a base que despacha outro motorista (Ricardo) para assumir a carga
   - Por pressa e problemas de sinal, Márcia não consegue fazer a transferência formal no aplicativo

3. **Localização da Carga pelo Novo Motorista (11:05h)**
   - Ricardo chega ao local e precisa encontrar a OT no sistema
   - Ele pega uma das notas fiscais e usa a função "Buscar por Nota Fiscal"
   - Digita "NFE-123987456" e o sistema localiza a OT de Márcia

4. **Transferência Manual (11:10h)**
   - Ricardo seleciona "Solicitar Transferência" na OT encontrada
   - O sistema envia uma notificação para a equipe de logística
   - Um supervisor de logística aprova a transferência remotamente

5. **Continuação da Entrega (11:30h)**
   - Ricardo continua o trajeto com as entregas pendentes
   - O sistema mantém o histórico mostrando que a OT foi iniciada por Márcia e transferida para Ricardo
   - As entregas são realizadas normalmente e os canhotos são vinculados à mesma OT

## Caso 4: Operação com Cliente de Grande Porte e Conferência Detalhada

**Contexto**: Entrega para um grande varejista que exige conferência detalhada e pode aceitar parcialmente a carga.

**Passo a passo real**:

1. **Criação Normal da OT (6:00h)**
   - João cria a OT "OT2025042600126" ao chegar no CD
   - Vincula as notas fiscais para entrega em um grande centro de distribuição de uma rede varejista

2. **Chegada ao Cliente com Tempo de Espera (9:30h)**
   - João chega ao cliente e entra na fila de recebimento
   - No aplicativo, adiciona uma atualização na OT: "Aguardando na fila para descarregamento - posição 8"
   - O sistema registra essa informação, permitindo à logística monitorar os tempos de espera

3. **Início do Processo de Conferência (11:45h)**
   - João é chamado para descarregamento
   - Adiciona nova atualização: "Iniciando processo de conferência"
   - O sistema registra o tempo entre chegada e início da conferência

4. **Recebimento Parcial (13:20h)**
   - O cliente aceita parte da mercadoria, mas recusa alguns itens por divergências
   - João usa a função "Recebimento Parcial" no aplicativo
   - Marca as notas fiscais que foram aceitas e as que foram recusadas
   - Para cada nota recusada, adiciona o motivo e fotos da ocorrência

5. **Finalização com Documentação (13:45h)**
   - João recebe um documento formal do cliente detalhando o que foi aceito e recusado
   - No aplicativo, finaliza a OT com status "Entregue Parcialmente"
   - Anexa fotos do documento de divergência e dos canhotos das notas aceitas
   - O sistema notifica automaticamente a equipe de logística sobre a entrega parcial

6. **Tratamento pela Logística**
   - A equipe de logística visualiza imediatamente a divergência
   - Inicia processo de tratativa comercial ou reentrega dos itens recusados
   - Pode gerar uma nova OT vinculada à original para a reentrega dos itens pendentes

