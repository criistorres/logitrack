# 📚 Documentação da API LogiTrack

## 🎯 Como usar os arquivos .rest

Os arquivos `.rest` contêm exemplos práticos de todas as requisições HTTP para a API. São ideais para:

- ✅ Testar endpoints durante desenvolvimento
- ✅ Debuggar problemas de autenticação
- ✅ Entender como usar cada endpoint
- ✅ Servir como documentação viva

## 🛠️ Configuração no VS Code

### 1. Instalar extensão REST Client

```bash
# No VS Code:
1. Abra a aba Extensions (Ctrl+Shift+X)
2. Busque por "REST Client"
3. Instale a extensão de Huachao Mao
```

### 2. Como usar

1. Abra qualquer arquivo `.rest` no VS Code
2. Você verá um botão "Send Request" acima de cada requisição
3. Clique no botão para executar a requisição
4. A resposta aparece em uma nova aba

## 📋 Arquivos disponíveis

### `auth.rest` - Autenticação completa

Contém todos os endpoints de autenticação:

- 📝 Registro de usuário
- 🔐 Login/Logout
- 👤 Perfil do usuário
- 🔄 Reset de senha
- 🎫 Refresh de tokens
- 🛠️ Endpoints de debugging

## 🔧 Variáveis importantes

Os arquivos `.rest` usam variáveis para facilitar o uso:

```http
# Configuração base
@baseURL = http://localhost:8000
@authURL = {{baseURL}}/api/auth

# Tokens (atualize após login)
@accessToken = seu_token_aqui
@refreshToken = seu_refresh_token_aqui
```

## 🎯 Fluxo recomendado para testes

### 1. Verificar se API está rodando
```http
GET {{baseURL}}
```

### 2. Listar endpoints disponíveis
```http
GET {{authURL}}/endpoints/
```

### 3. Registrar um usuário
```http
POST {{authURL}}/register/
# (copie o exemplo do arquivo auth.rest)
```

### 4. Fazer login
```http
POST {{authURL}}/login/
# (copie o access_token da resposta)
```

### 5. Testar endpoint autenticado
```http
GET {{authURL}}/user/
Authorization: Bearer SEU_ACCESS_TOKEN
```

## 🐛 Debugging com arquivos .rest

### 1. Logs detalhados

Os arquivos `.rest` são sincronizados com os prints de debugging no código:

```python
# No código Python você verá:
print("🔍 VALIDATE_EMAIL chamado com: user@test.com")

# Na resposta do .rest você verá o resultado
```

### 2. Cenários de teste

Cada arquivo `.rest` inclui:

- ✅ Casos de sucesso
- ❌ Casos de erro
- 🔄 Fluxos completos
- 🛠️ Endpoints de debugging

### 3. Acompanhar no terminal

Enquanto usa os arquivos `.rest`, acompanhe o terminal do Django:

```bash
# Terminal mostrará logs como:
🎯 REGISTER VIEW: Iniciando registro
🔍 VALIDATE_EMAIL chamado com: user@test.com
✅ Email user@test.com está disponível
🔍 CREATE chamado!
✅ Usuário criado com sucesso!
```

## 📊 Códigos de resposta

### Sucesso
- `200 OK` - Operação bem-sucedida
- `201 Created` - Recurso criado com sucesso

### Erro do cliente
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Token inválido/ausente
- `404 Not Found` - Recurso não encontrado

### Erro do servidor
- `500 Internal Server Error` - Erro interno (veja logs)

## 🔍 Solução de problemas

### Erro "Connection refused"
```bash
# Certifique-se que o Django está rodando:
cd backend
python manage.py runserver
```

### Erro 401 "Invalid token"
```bash
# Faça login novamente e atualize o token:
POST {{authURL}}/login/
# Copie o novo access_token
```

### Erro 400 "Validation error"
```bash
# Veja detalhes na resposta JSON
# Confira se todos os campos obrigatórios estão preenchidos
```

### Erro 500 "Internal server error"
```bash
# Veja logs detalhados no terminal do Django
# Verifique se todas as migrações foram aplicadas:
python manage.py migrate
```

## 🎨 Personalização

Você pode criar seus próprios arquivos `.rest`:

```http
# exemplo-personalizado.rest

@baseURL = http://localhost:8000

### Meu teste personalizado
POST {{baseURL}}/api/auth/login/
Content-Type: application/json

{
    "email": "meu@email.com",
    "password": "minhasenha"
}
```

## 📱 Próximos arquivos

Nas próximas etapas, criaremos:

- `ots.rest` - Ordens de Transporte
- `notas-fiscais.rest` - Notas Fiscais
- `transferencias.rest` - Transferências
- `reports.rest` - Relatórios

## 💡 Dicas avançadas

### 1. Usar variáveis dinâmicas

```http
### Login e capturar token automaticamente
# @name login
POST {{authURL}}/login/
Content-Type: application/json

{
    "email": "user@test.com",
    "password": "senha123"
}

### Usar token do login anterior
GET {{authURL}}/user/
Authorization: Bearer {{login.response.body.data.tokens.access}}
```

### 2. Testes em sequência

```http
### 1. Registrar
# @name register
POST {{authURL}}/register/
# ... dados ...

### 2. Login com dados do registro
POST {{authURL}}/login/
Content-Type: application/json

{
    "email": "{{register.response.body.data.user.email}}",
    "password": "senha_usada_no_registro"
}
```

### 3. Ambientes diferentes

```http
# Para desenvolvimento
@baseURL = http://localhost:8000

# Para produção (quando disponível)
# @baseURL = https://api.logitrack.com
```

---

## 📞 Suporte

Se encontrar problemas:

1. ✅ Verifique se o Django está rodando
2. ✅ Confira se as migrações foram aplicadas
3. ✅ Veja os logs no terminal
4. ✅ Compare com os exemplos nos arquivos `.rest`
5. ✅ Use os endpoints de debugging: `/api/auth/debug/`