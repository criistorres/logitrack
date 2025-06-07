# ============================================================================
# DJANGO MANAGEMENT COMMAND - CRIAR USUÁRIOS E TESTAR CRIAÇÃO DE OT
# ============================================================================
# 
# 📁 Salvar em: backend/core/management/commands/create_test_users.py
#
# 🎯 PROPÓSITO: 
# - Criar superuser ctorres@beautyservices.com.br
# - Criar motorista clara@email.com  
# - Simular criação da OT com erro de coordenadas
#
# 🚀 COMANDO PARA EXECUTAR:
# python manage.py create_test_users
#
# ============================================================================

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from core.models import OrdemTransporte
from core.serializers import OrdemTransporteCreateSerializer
from django.test.client import RequestFactory
from rest_framework.request import Request
import traceback


class Command(BaseCommand):
    """
    Django Management Command para criar usuários de teste e simular erro de OT.
    
    Este comando:
    1. Cria um superusuário (administrador)
    2. Cria um motorista
    3. Simula a criação da OT que está gerando erro
    4. Mostra detalhes do erro de coordenadas
    """
    
    help = 'Cria usuários de teste e simula erro na criação de OT'
    
    def add_arguments(self, parser):
        """Adiciona argumentos opcionais ao comando."""
        parser.add_argument(
            '--force',
            action='store_true',
            help='Força recriação dos usuários se já existirem',
        )
        
        parser.add_argument(
            '--skip-ot',
            action='store_true',
            help='Pula o teste de criação da OT',
        )
    
    def handle(self, *args, **options):
        """Método principal do comando."""
        self.stdout.write(
            self.style.HTTP_INFO('🚀 INICIANDO CRIAÇÃO DE USUÁRIOS DE TESTE')
        )
        
        try:
            # Executar em transação para rollback em caso de erro
            with transaction.atomic():
                # 1. Criar superusuário
                superuser = self.create_superuser(options['force'])
                
                # 2. Criar motorista
                motorista = self.create_motorista(options['force'])
                
                # 3. Simular criação da OT (se não pulado)
                if not options['skip_ot']:
                    self.simulate_ot_creation(motorista)
                
                self.stdout.write(
                    self.style.SUCCESS('✅ SCRIPT EXECUTADO COM SUCESSO!')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ ERRO NA EXECUÇÃO: {str(e)}')
            )
            self.stdout.write(
                self.style.ERROR(f'📋 DETALHES: {traceback.format_exc()}')
            )
    
    def create_superuser(self, force=False):
        """
        Cria o superusuário com os dados especificados.
        
        Args:
            force (bool): Se True, recria o usuário mesmo que já exista
            
        Returns:
            CustomUser: Instância do superusuário criado
        """
        User = get_user_model()
        email = 'ctorres@beautyservices.com.br'
        cpf = '45495658884'
        password = 'Laura@2024'
        
        self.stdout.write('🔧 Criando superusuário...')
        
        # Verificar se usuário já existe
        if User.objects.filter(email=email).exists():
            if force:
                User.objects.filter(email=email).delete()
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Usuário {email} existia e foi removido')
                )
            else:
                user = User.objects.get(email=email)
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Usuário {email} já existe, usando existente')
                )
                return user
        
        # Criar superusuário
        user = User.objects.create_superuser(
            email=email,
            cpf=cpf,
            password=password,
            first_name='Carlos',
            last_name='Torres',
            phone='11999888777',
            role='admin'
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Superusuário criado: {email}')
        )
        self.stdout.write(f'   📧 Email: {email}')
        self.stdout.write(f'   🆔 CPF: {cpf}')
        self.stdout.write(f'   🔑 Senha: {password}')
        self.stdout.write(f'   👤 Tipo: {user.get_role_display()}')
        
        return user
    
    def create_motorista(self, force=False):
        """
        Cria o motorista com os dados especificados.
        
        Args:
            force (bool): Se True, recria o usuário mesmo que já exista
            
        Returns:
            CustomUser: Instância do motorista criado
        """
        User = get_user_model()
        email = 'clara@email.com'
        cpf = '12345678901'  # CPF fictício para o motorista
        password = 'Laura@2024'
        
        self.stdout.write('🚚 Criando motorista...')
        
        # Verificar se usuário já existe
        if User.objects.filter(email=email).exists():
            if force:
                User.objects.filter(email=email).delete()
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Usuário {email} existia e foi removido')
                )
            else:
                user = User.objects.get(email=email)
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Usuário {email} já existe, usando existente')
                )
                return user
        
        # Criar motorista
        user = User.objects.create_user(
            email=email,
            cpf=cpf,
            password=password,
            first_name='Clara',
            last_name='Silva',
            phone='11888777666',
            role='motorista',
            cnh_numero='12345678901',
            cnh_categoria='B',
            is_active=True,
            cnh_validade='2026-12-01'
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Motorista criado: {email}')
        )
        self.stdout.write(f'   📧 Email: {email}')
        self.stdout.write(f'   🆔 CPF: {cpf}')
        self.stdout.write(f'   🔑 Senha: {password}')
        self.stdout.write(f'   👤 Tipo: {user.get_role_display()}')
        self.stdout.write(f'   🚗 CNH: {user.cnh_numero} (Categoria {user.cnh_categoria})')
        
        return user
    
    def simulate_ot_creation(self, motorista):
        """
        Simula a criação da OT que está gerando erro.
        
        Args:
            motorista (CustomUser): Instância do motorista que criará a OT
        """
        self.stdout.write('🔍 Simulando criação da OT com erro...')
        
        # Dados que estão causando erro (mesmos do log)
        dados_ot = {
            'endereco_entrega': 'Rua 0, 445',
            'cidade_entrega': 'sao paulo',
            'cliente_nome': 'ABC',
            'observacoes': 'Teste',
            'latitude_origem': -23.624670676644218,  # 🔥 PROBLEMA: 17 dígitos totais
            'longitude_origem': -46.72625889193125,   # 🔥 PROBLEMA: 16 dígitos totais
            'endereco_origem': 'Rua Deputado Laércio Corte, 390 - São Paulo, SP'
        }
        
        self.stdout.write('📊 DADOS ENVIADOS:')
        for campo, valor in dados_ot.items():
            self.stdout.write(f'   {campo}: {valor}')
        
        # Criar request simulado para o serializer
        factory = RequestFactory()
        request = factory.post('/api/ots/', dados_ot)
        request.user = motorista
        drf_request = Request(request)
        
        # Tentar validar com o serializer
        try:
            serializer = OrdemTransporteCreateSerializer(
                data=dados_ot,
                context={'request': drf_request}
            )
            
            self.stdout.write('🔍 Validando dados com o serializer...')
            
            # Verificar se é válido
            if serializer.is_valid():
                self.stdout.write(
                    self.style.SUCCESS('✅ Dados válidos! OT seria criada normalmente.')
                )
                
                # Mostrar dados validados
                self.stdout.write('📋 DADOS VALIDADOS:')
                for campo, valor in serializer.validated_data.items():
                    self.stdout.write(f'   {campo}: {valor}')
                    
            else:
                # Mostrar os erros detalhadamente
                self.stdout.write(
                    self.style.ERROR('❌ DADOS INVÁLIDOS - ERROS ENCONTRADOS:')
                )
                
                for campo, erros in serializer.errors.items():
                    self.stdout.write(f'   🔥 {campo}:')
                    for erro in erros:
                        self.stdout.write(f'      - {erro}')
                
                # Análise detalhada dos campos problemáticos
                self.analyze_coordinate_fields(dados_ot)
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ ERRO DURANTE VALIDAÇÃO: {str(e)}')
            )
            self.stdout.write(f'📋 STACK TRACE: {traceback.format_exc()}')
    
    def analyze_coordinate_fields(self, dados):
        """
        Analisa os campos de coordenadas para mostrar o problema.
        
        Args:
            dados (dict): Dados da OT sendo analisados
        """
        self.stdout.write('')
        self.stdout.write(self.style.HTTP_INFO('🔬 ANÁLISE DETALHADA DOS CAMPOS PROBLEMÁTICOS:'))
        
        # Analisar latitude
        lat = dados['latitude_origem']
        self.stdout.write(f'📍 LATITUDE: {lat}')
        self.stdout.write(f'   Valor como string: "{str(lat)}"')
        self.stdout.write(f'   Número total de caracteres: {len(str(lat))}')
        self.stdout.write(f'   Dígitos totais (sem ponto/sinal): {len(str(lat).replace(".", "").replace("-", ""))}')
        
        # Contar dígitos antes e depois do ponto
        str_lat = str(abs(lat))  # Remove o sinal negativo para análise
        if '.' in str_lat:
            antes_ponto, depois_ponto = str_lat.split('.')
            self.stdout.write(f'   Dígitos antes do ponto: {len(antes_ponto)}')
            self.stdout.write(f'   Dígitos depois do ponto: {len(depois_ponto)}')
        
        # Analisar longitude
        lng = dados['longitude_origem']
        self.stdout.write(f'📍 LONGITUDE: {lng}')
        self.stdout.write(f'   Valor como string: "{str(lng)}"')
        self.stdout.write(f'   Número total de caracteres: {len(str(lng))}')
        self.stdout.write(f'   Dígitos totais (sem ponto/sinal): {len(str(lng).replace(".", "").replace("-", ""))}')
        
        # Contar dígitos antes e depois do ponto
        str_lng = str(abs(lng))  # Remove o sinal negativo para análise
        if '.' in str_lng:
            antes_ponto, depois_ponto = str_lng.split('.')
            self.stdout.write(f'   Dígitos antes do ponto: {len(antes_ponto)}')
            self.stdout.write(f'   Dígitos depois do ponto: {len(depois_ponto)}')
        
        self.stdout.write('')
        self.stdout.write(self.style.HTTP_INFO('💡 CONFIGURAÇÃO ATUAL DO MODELO:'))
        self.stdout.write('   latitude_origem: max_digits=9, decimal_places=6')
        self.stdout.write('   longitude_origem: max_digits=10, decimal_places=6')
        
        self.stdout.write('')
        self.stdout.write(self.style.HTTP_INFO('🔧 PROBLEMA IDENTIFICADO:'))
        self.stdout.write('   Os valores GPS reais excedem o limite de dígitos definido no modelo!')
        self.stdout.write('   A migração inicial criou campos menores que o necessário.')
        
        self.stdout.write('')
        self.stdout.write(self.style.HTTP_INFO('✅ SOLUÇÃO NECESSÁRIA:'))
        self.stdout.write('   1. Criar nova migração ajustando max_digits dos campos de coordenadas')
        self.stdout.write('   2. Aplicar a migração no banco de dados')
        self.stdout.write('   3. Testar novamente a criação da OT')


# ============================================================================
# INSTRUCÕES DE USO
# ============================================================================

"""
📋 COMO USAR ESTE SCRIPT:

1. CRIAR OS DIRETÓRIOS (se não existirem):
   mkdir -p backend/core/management
   mkdir -p backend/core/management/commands
   touch backend/core/management/__init__.py
   touch backend/core/management/commands/__init__.py

2. SALVAR ESTE ARQUIVO:
   Salvar como: backend/core/management/commands/create_test_users.py

3. EXECUTAR O COMANDO:
   cd backend
   python manage.py create_test_users

4. OPÇÕES DISPONÍVEIS:
   # Forçar recriação dos usuários
   python manage.py create_test_users --force
   
   # Pular teste da OT (só criar usuários)
   python manage.py create_test_users --skip-ot
   
   # Ambas as opções
   python manage.py create_test_users --force --skip-ot

5. VERIFICAR CRIAÇÃO:
   # Verificar no admin Django
   python manage.py runserver
   # Acessar: http://127.0.0.1:8000/admin/
   
   # Ou verificar no shell Django
   python manage.py shell
   >>> from django.contrib.auth import get_user_model
   >>> User = get_user_model()
   >>> User.objects.filter(email__in=['ctorres@beautyservices.com.br', 'clara@email.com'])

6. LOGIN NO SISTEMA:
   Superusuário:
   - Email: ctorres@beautyservices.com.br
   - Senha: Laura@2024
   
   Motorista:
   - Email: clara@email.com
   - Senha: Laura@2024
"""