#!/bin/bash

# ============================================================================
# SCRIPT DE SETUP E EXECUÇÃO - CRIAR USUÁRIOS E TESTAR OT
# ============================================================================
#
# 📁 Salvar como: backend/setup_test_users.sh
# 🚀 Executar: chmod +x setup_test_users.sh && ./setup_test_users.sh
#
# ============================================================================

set -e  # Parar execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Cabeçalho
echo -e "${BLUE}"
echo "============================================================================"
echo "🚀 SCRIPT DE CRIAÇÃO DE USUÁRIOS DE TESTE E SIMULAÇÃO DE ERRO OT"
echo "============================================================================"
echo -e "${NC}"

# Verificar se estamos no diretório correto
if [ ! -f "manage.py" ]; then
    print_error "manage.py não encontrado!"
    print_info "Execute este script no diretório backend/ do projeto"
    exit 1
fi

print_success "Diretório correto identificado (backend/)"

# Etapa 1: Criar estrutura de diretórios para management commands
print_step "Criando estrutura de diretórios para management commands..."

# Criar diretórios se não existirem
mkdir -p core/management/commands

# Criar arquivos __init__.py se não existirem
touch core/management/__init__.py
touch core/management/commands/__init__.py

print_success "Estrutura de diretórios criada"

# Etapa 2: Verificar se o arquivo do comando existe
COMMAND_FILE="core/management/commands/create_test_users.py"

if [ ! -f "$COMMAND_FILE" ]; then
    print_warning "Arquivo $COMMAND_FILE não encontrado"
    print_info "Certifique-se de ter copiado o código Python para este arquivo"
    print_info "Caminho completo: $(pwd)/$COMMAND_FILE"
    
    # Criar um arquivo de exemplo se não existir
    cat > "$COMMAND_FILE" << 'EOF'
# ARQUIVO PLACEHOLDER - SUBSTITUA PELO CÓDIGO PYTHON FORNECIDO
# Copie o código Python completo aqui
print("⚠️ SUBSTITUA ESTE ARQUIVO PELO CÓDIGO PYTHON FORNECIDO")
EOF
    
    print_error "Arquivo placeholder criado. Substitua pelo código Python!"
    exit 1
fi

print_success "Arquivo de comando encontrado"

# Etapa 3: Verificar se o ambiente virtual está ativo
if [ -z "$VIRTUAL_ENV" ]; then
    print_warning "Ambiente virtual não detectado"
    print_info "Recomenda-se ativar o ambiente virtual primeiro:"
    print_info "source venv/bin/activate"
    echo ""
    read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Ativando ambiente virtual e tentando novamente..."
        if [ -f "venv/bin/activate" ]; then
            source venv/bin/activate
            print_success "Ambiente virtual ativado"
        else
            print_error "Arquivo venv/bin/activate não encontrado"
            print_info "Crie o ambiente virtual primeiro: python -m venv venv"
            exit 1
        fi
    fi
else
    print_success "Ambiente virtual ativo: $VIRTUAL_ENV"
fi

# Etapa 4: Verificar dependências
print_step "Verificando dependências do Django..."

if ! python -c "import django" 2>/dev/null; then
    print_error "Django não instalado!"
    print_info "Instale as dependências: pip install -r requirements.txt"
    exit 1
fi

print_success "Django instalado"

# Etapa 5: Executar migrações (se necessário)
print_step "Verificando status das migrações..."

python manage.py showmigrations --plan | grep "\[ \]" > /dev/null && PENDING_MIGRATIONS=true || PENDING_MIGRATIONS=false

if [ "$PENDING_MIGRATIONS" = true ]; then
    print_warning "Migrações pendentes detectadas"
    echo ""
    read -p "Deseja aplicar as migrações agora? (Y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        print_step "Aplicando migrações..."
        python manage.py migrate
        print_success "Migrações aplicadas"
    else
        print_warning "Migrações não aplicadas. Isso pode causar erros."
    fi
else
    print_success "Todas as migrações estão aplicadas"
fi

# Etapa 6: Executar o comando de criação de usuários
print_step "Executando comando de criação de usuários..."

echo ""
echo "Opções disponíveis:"
echo "1. Criar usuários normalmente"
echo "2. Forçar recriação (se já existirem)"
echo "3. Apenas criar usuários (pular teste OT)"
echo "4. Forçar recriação + pular teste OT"
echo ""

read -p "Escolha uma opção (1-4): " -n 1 -r
echo ""

case $REPLY in
    1)
        print_info "Executando criação normal..."
        python manage.py create_test_users
        ;;
    2)
        print_info "Executando com --force..."
        python manage.py create_test_users --force
        ;;
    3)
        print_info "Executando apenas criação de usuários..."
        python manage.py create_test_users --skip-ot
        ;;
    4)
        print_info "Executando com --force --skip-ot..."
        python manage.py create_test_users --force --skip-ot
        ;;
    *)
        print_info "Opção inválida, executando criação normal..."
        python manage.py create_test_users
        ;;
esac

# Etapa 7: Verificar resultados
if [ $? -eq 0 ]; then
    print_success "Comando executado com sucesso!"
    
    echo ""
    print_info "USUÁRIOS CRIADOS:"
    echo "📧 Superusuário: ctorres@beautyservices.com.br"
    echo "🔑 Senha: Laura@2024"
    echo ""
    echo "📧 Motorista: clara@email.com"
    echo "🔑 Senha: Laura@2024"
    
    echo ""
    print_info "PRÓXIMOS PASSOS:"
    echo "1. Acessar admin Django: python manage.py runserver"
    echo "   URL: http://127.0.0.1:8000/admin/"
    echo ""
    echo "2. Para corrigir o erro de coordenadas GPS:"
    echo "   - Criar nova migração ajustando max_digits"
    echo "   - Aplicar migração"
    echo "   - Testar criação da OT novamente"
    
else
    print_error "Erro na execução do comando!"
    print_info "Verifique os logs acima para detalhes do erro"
fi

echo ""
print_info "Script finalizado!"