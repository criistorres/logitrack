# ==============================================================================
# SERIALIZERS DE AUTENTICAÇÃO - GUIA COMPLETO COM EXPLICAÇÕES
# ==============================================================================

# Arquivo: backend/accounts/serializers.py
# Copie este código INTEIRO para o arquivo accounts/serializers.py

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import CustomUser
import logging

# Configurar logger para ver o que acontece
logger = logging.getLogger(__name__)

# ==============================================================================
# 📚 EXPLICAÇÃO: O QUE SÃO SERIALIZERS?
# ==============================================================================

"""
SERIALIZERS são como "tradutores" entre diferentes formatos de dados:

1. 📥 DESERIALIZAÇÃO (JSON → Python):
   - Recebe dados JSON da requisição HTTP
   - Converte para objetos Python
   - Valida os dados
   - Cria/atualiza objetos no banco

2. 📤 SERIALIZAÇÃO (Python → JSON):
   - Pega objetos Python (models do Django)
   - Converte para JSON
   - Envia na resposta HTTP

FLUXO DE EXECUÇÃO:
1. View recebe request.data (JSON)
2. View cria serializer(data=request.data)
3. View chama serializer.is_valid() ← AQUI entram os métodos validate()
4. Se válido, chama serializer.save() ← AQUI entra o método create() ou update()
5. View retorna Response com serializer.data (JSON)
"""

# ==============================================================================
# 🛠️ SERIALIZER DE REGISTRO - PASSO A PASSO
# ==============================================================================

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    📋 PROPÓSITO: Registrar novos usuários no sistema
    
    🔍 DEBUGGING: Para acompanhar este serializer:
    
    1. Coloque breakpoint na linha 86: "def validate_email(self, value):"
    2. Coloque breakpoint na linha 105: "def validate_cpf(self, value):"
    3. Coloque breakpoint na linha 125: "def validate(self, attrs):"
    4. Coloque breakpoint na linha 151: "def create(self, validated_data):"
    5. Faça requisição POST para /api/auth/register/
    6. Acompanhe a execução seguindo a ordem acima
    
    💡 DICA: Os métodos validate_* são chamados AUTOMATICAMENTE pelo DRF
    quando você chama serializer.is_valid()
    """
    
    # Campos extras que não estão no model
    password = serializers.CharField(
        write_only=True,  # Não aparece na resposta JSON
        min_length=8,
        style={'input_type': 'password'}  # Para forms HTML
    )
    
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = CustomUser
        fields = [
            'email', 'password', 'password_confirm', 
            'first_name', 'last_name', 'cpf', 'phone', 'role',
            'cnh_numero', 'cnh_categoria', 'cnh_validade'
        ]
        
        # Campos obrigatórios
        extra_kwargs = {
            'email': {'required': True},
            'cpf': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    # 🔍 MÉTODO 1: Validação individual do email
    def validate_email(self, value):
        """
        ⚡ ESTE MÉTODO É CHAMADO AUTOMATICAMENTE!
        
        Quando você chama serializer.is_valid(), o DRF procura por métodos
        com o padrão validate_<nome_do_campo> e os executa automaticamente.
        
        🐛 DEBUGGING:
        - Coloque breakpoint AQUI na linha abaixo
        - Faça uma requisição e veja como o método é chamado
        """
        print(f"🔍 VALIDATE_EMAIL chamado com: {value}")
        print(f"🔍 Tipo do valor: {type(value)}")
        
        # Verificar se email já existe
        if CustomUser.objects.filter(email=value).exists():
            print(f"❌ Email {value} já existe no banco!")
            raise serializers.ValidationError("Este email já está em uso.")
        
        print(f"✅ Email {value} está disponível")
        return value.lower()  # Retorna email em minúsculo

    # 🔍 MÉTODO 2: Validação individual do CPF
    def validate_cpf(self, value):
        """
        ⚡ TAMBÉM É CHAMADO AUTOMATICAMENTE!
        
        🐛 DEBUGGING: Coloque breakpoint aqui e observe:
        - Como o valor chega
        - Como é processado
        - Como é retornado
        """
        print(f"🔍 VALIDATE_CPF chamado com: {value}")
        
        # Limpar CPF (remover pontos e traços)
        cpf_limpo = ''.join(filter(str.isdigit, value))
        print(f"🔍 CPF após limpeza: {cpf_limpo}")
        
        # Validar tamanho
        if len(cpf_limpo) != 11:
            print(f"❌ CPF tem {len(cpf_limpo)} dígitos, precisa ter 11")
            raise serializers.ValidationError("CPF deve ter exatamente 11 dígitos.")
        
        # Verificar se já existe
        if CustomUser.objects.filter(cpf=cpf_limpo).exists():
            print(f"❌ CPF {cpf_limpo} já existe no banco!")
            raise serializers.ValidationError("Este CPF já está cadastrado.")
        
        print(f"✅ CPF {cpf_limpo} está válido")
        return cpf_limpo

    # 🔍 MÉTODO 3: Validação geral (todos os campos juntos)
    def validate(self, attrs):
        """
        ⚡ MÉTODO ESPECIAL: Valida o objeto completo
        
        Este método é chamado APÓS todos os validate_<campo> individuais.
        Aqui você pode validar regras que envolvem múltiplos campos.
        
        🐛 DEBUGGING: 
        - Coloque breakpoint aqui
        - Inspecione a variável 'attrs'
        - Veja todos os dados validados juntos
        """
        print(f"🔍 VALIDATE geral chamado!")
        print(f"🔍 Dados recebidos: {attrs}")
        
        # Verificar se senhas coincidem
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        print(f"🔍 Comparando senhas...")
        if password != password_confirm:
            print(f"❌ Senhas não coincidem!")
            raise serializers.ValidationError("As senhas não coincidem.")
        
        # Validar força da senha usando validadores do Django
        try:
            print(f"🔍 Validando força da senha...")
            validate_password(password)
            print(f"✅ Senha aprovada nos validadores Django")
        except ValidationError as e:
            print(f"❌ Senha rejeitada: {e.messages}")
            raise serializers.ValidationError({"password": e.messages})
        
        # Remover confirmação da senha (não vamos salvá-la)
        attrs.pop('password_confirm', None)
        print(f"🔍 password_confirm removido dos dados")
        
        print(f"🔍 Dados finais validados: {attrs}")
        return attrs

    # 🔍 MÉTODO 4: Criação do objeto
    def create(self, validated_data):
        """
        ⚡ MÉTODO DE CRIAÇÃO: Só é chamado quando você chama serializer.save()
        
        Recebe os dados já validados e limpos pelos métodos validate acima.
        
        🐛 DEBUGGING:
        - Coloque breakpoint aqui
        - Observe que validated_data já está limpo e validado
        - Acompanhe a criação do usuário
        """
        print(f"🔍 CREATE chamado!")
        print(f"🔍 Dados validados recebidos: {validated_data}")
        
        # Extrair senha dos dados
        password = validated_data.pop('password')
        print(f"🔍 Senha extraída dos dados")
        
        # Criar usuário usando nosso manager customizado
        print(f"🔍 Criando usuário com CustomUserManager...")
        user = CustomUser.objects.create_user(
            password=password,
            **validated_data
        )
        
        print(f"✅ Usuário criado com sucesso!")
        print(f"🔍 ID do usuário: {user.id}")
        print(f"🔍 Email do usuário: {user.email}")
        
        return user


# ==============================================================================
# 🔐 SERIALIZER DE LOGIN - MAIS SIMPLES
# ==============================================================================

class UserLoginSerializer(serializers.Serializer):
    """
    📋 PROPÓSITO: Validar credenciais de login
    
    Note que este NÃO herda de ModelSerializer, mas de Serializer comum.
    Isso porque não estamos criando/editando um model, apenas validando dados.
    
    🔍 DEBUGGING: Coloque breakpoint no método validate()
    """
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        """
        🔍 AQUI ACONTECE A AUTENTICAÇÃO!
        
        🐛 DEBUGGING: 
        - Coloque breakpoint aqui
        - Observe como o authenticate() funciona
        - Veja o que retorna quando credenciais estão corretas/erradas
        """
        print(f"🔍 LOGIN - Validando credenciais...")
        
        email = attrs.get('email')
        password = attrs.get('password')
        
        print(f"🔍 Email: {email}")
        print(f"🔍 Senha fornecida: {'*' * len(password)}")
        
        if email and password:
            # 🔑 FUNÇÃO MÁGICA: authenticate() do Django
            print(f"🔍 Chamando authenticate()...")
            user = authenticate(
                request=self.context.get('request'),
                username=email,  # Nosso modelo usa email como username
                password=password
            )
            
            print(f"🔍 Resultado do authenticate(): {user}")
            
            if not user:
                print(f"❌ authenticate() retornou None - credenciais inválidas")
                raise serializers.ValidationError("Credenciais inválidas.")
            
            if not user.is_active:
                print(f"❌ Usuário {user.email} está inativo")
                raise serializers.ValidationError("Conta desativada.")
            
            print(f"✅ Login válido para: {user.email}")
            attrs['user'] = user  # Adicionar usuário aos dados validados
            return attrs
        else:
            raise serializers.ValidationError("Email e senha são obrigatórios.")


# ==============================================================================
# 👤 SERIALIZER DE PERFIL - PARA LEITURA E EDIÇÃO
# ==============================================================================

class UserProfileSerializer(serializers.ModelSerializer):
    """
    📋 PROPÓSITO: Exibir e editar dados do perfil do usuário
    
    Este serializer é usado tanto para GET (mostrar dados) quanto para PUT/PATCH (editar).
    
    🔍 DEBUGGING: Coloque breakpoint no método update() se quiser ver edições
    """
    
    # Campos calculados (read-only)
    cpf_formatted = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    cnh_vencida = serializers.ReadOnlyField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'cpf', 'cpf_formatted', 'phone', 'role', 'is_active',
            'date_joined', 'cnh_numero', 'cnh_categoria', 
            'cnh_validade', 'cnh_vencida', 'foto_perfil'
        ]
        
        # Campos que não podem ser editados
        read_only_fields = ['id', 'email', 'cpf', 'role', 'is_active', 'date_joined']

    def update(self, instance, validated_data):
        """
        🔍 MÉTODO UPDATE: Chamado quando você faz PUT/PATCH
        
        🐛 DEBUGGING:
        - Coloque breakpoint aqui
        - Observe o 'instance' (usuário atual)
        - Observe 'validated_data' (novos dados)
        """
        print(f"🔍 UPDATE - Atualizando usuário: {instance.email}")
        print(f"🔍 Dados novos: {validated_data}")
        
        # Atualizar cada campo
        for attr, value in validated_data.items():
            print(f"🔍 Atualizando {attr}: {getattr(instance, attr)} → {value}")
            setattr(instance, attr, value)
        
        instance.save()
        print(f"✅ Usuário atualizado com sucesso!")
        return instance


# ==============================================================================
# 🔄 SERIALIZERS DE RESET DE SENHA - SISTEMA DE CÓDIGO
# ==============================================================================

class PasswordResetSerializer(serializers.Serializer):
    """
    📋 PROPÓSITO: Solicitar reset de senha com envio de CÓDIGO de 6 dígitos via email
    
    🔄 MUDANÇAS:
    - Gera código de 6 dígitos ao invés de token longo
    - Email mostra apenas o código
    - Código expira em 30 minutos
    - Máximo 3 tentativas por código
    
    🔍 DEBUGGING: Para acompanhar processo completo de reset
    1. Coloque breakpoint no método validate_email()
    2. Observe geração de código de 6 dígitos
    3. Acompanhe envio de email com código
    """
    
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """
        🔍 Verificar se email existe e criar código de reset
        
        🐛 DEBUGGING: Coloque breakpoint aqui para ver processo completo
        """
        print(f"🔄 RESET REQUEST: Solicitação para email: {value}")
        
        try:
            user = CustomUser.objects.get(email=value, is_active=True)
            print(f"✅ Usuário encontrado: {user.email}")
            
            # Armazenar usuário no contexto para uso posterior
            self.context['reset_user'] = user
            print(f"🔄 Usuário adicionado ao contexto")
            
        except CustomUser.DoesNotExist:
            print(f"❌ Email não encontrado ou usuário inativo: {value}")
            # Por segurança, não revelamos se o email existe
            # Mas internamente não processamos
            pass
        
        return value
    
    def save(self):
        """
        Gera código de 6 dígitos e envia email.
        
        🐛 DEBUGGING: Processo completo de envio de código por email
        """
        # Verificar se usuário existe (foi validado anteriormente)
        user = self.context.get('reset_user')
        if not user:
            print(f"⚠️ Usuário não encontrado no contexto - email pode não existir")
            return False
        
        print(f"📧 SEND CODE: Preparando envio de código para {user.email}")
        
        # Obter IP da requisição
        request = self.context.get('request')
        ip_address = None
        if request:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR')
        
        print(f"📧 IP da solicitação: {ip_address}")
        
        # Gerar código de 6 dígitos usando nosso modelo
        try:
            from .models import PasswordResetToken
            reset_token, raw_code = PasswordResetToken.generate_code_for_user(user, ip_address)
            print(f"📧 Código gerado - ID: {reset_token.id}, Código: {raw_code}")
        except Exception as e:
            print(f"❌ Erro ao gerar código: {e}")
            return False
        
        # Enviar email com código
        try:
            print(f"📧 Enviando email com código...")
            
            # Importar nossa função de email para códigos
            from .email_utils import send_password_reset_code_email_direct
            
            email_sent = send_password_reset_code_email_direct(
                user=user,
                reset_code=raw_code,
                request_ip=ip_address,
                expires_minutes=30  # 30 minutos
            )
            
            if email_sent:
                print(f"✅ Email com código enviado com sucesso!")
                return True
            else:
                print(f"❌ Falha no envio do email")
                # Deletar código se email falhou
                reset_token.delete()
                print(f"🗑️ Código deletado devido falha no envio")
                return False
                
        except Exception as e:
            print(f"❌ Erro no envio de email: {e}")
            print(f"❌ Tipo do erro: {type(e).__name__}")
            
            # Em desenvolvimento, mostrar detalhes do erro
            from django.conf import settings
            if settings.DEBUG:
                import traceback
                print(f"❌ Traceback completo:")
                traceback.print_exc()
            
            # Deletar código se email falhou
            try:
                reset_token.delete()
                print(f"🗑️ Código deletado devido falha no envio")
            except:
                pass
                
            return False


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    📋 PROPÓSITO: Confirmar redefinição de senha com código de 6 dígitos
    
    🔄 MUDANÇAS:
    - Recebe código de 6 dígitos ao invés de token longo
    - Valida código de 6 dígitos
    - Código expira em 30 minutos
    - Máximo 3 tentativas por código
    
    🔍 DEBUGGING: Para acompanhar validação de código e mudança de senha
    """
    
    code = serializers.CharField(
        required=True, 
        min_length=6, 
        max_length=6,
        help_text='Código de 6 dígitos enviado por email'
    )
    new_password = serializers.CharField(
        required=True, 
        min_length=8,
        help_text='Nova senha (mínimo 8 caracteres)'
    )
    confirm_password = serializers.CharField(
        required=True,
        help_text='Confirmação da nova senha'
    )

    def validate_code(self, value):
        """
        🔍 Validar código de reset de senha
        
        🐛 DEBUGGING: Coloque breakpoint aqui para ver validação de código
        """
        from .models import PasswordResetToken
        
        print(f"🔑 CODE VALIDATION: Validando código {value}")
        
        # Validar formato básico
        if not value.isdigit() or len(value) != 6:
            print(f"❌ Código com formato inválido: {value}")
            raise serializers.ValidationError("Código deve ter exatamente 6 dígitos numéricos.")
        
        # Validar código
        reset_token = PasswordResetToken.validate_code(value)
        
        if not reset_token:
            print(f"❌ Código inválido, expirado ou excedeu tentativas")
            raise serializers.ValidationError("Código inválido, expirado ou já usado.")
        
        print(f"✅ Código válido para usuário: {reset_token.user.email}")
        
        # Armazenar no contexto para uso posterior
        self.context['reset_token'] = reset_token
        self.context['reset_user'] = reset_token.user
        
        return value

    def validate(self, attrs):
        """
        🔍 Validar senhas coincidem e força da senha
        """
        print(f"🔍 PASSWORD VALIDATION: Validando nova senha")
        
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')
        
        if new_password != confirm_password:
            print(f"❌ Senhas não coincidem")
            raise serializers.ValidationError("As senhas não coincidem.")
        
        # Validar força da senha
        try:
            validate_password(new_password)
            print(f"✅ Senha aprovada nos validadores Django")
        except ValidationError as e:
            print(f"❌ Senha rejeitada: {e.messages}")
            raise serializers.ValidationError({"new_password": e.messages})
        
        return attrs
    
    def save(self):
        """
        Salva a nova senha e marca código como usado.
        
        🐛 DEBUGGING: Processo de mudança de senha
        """
        print(f"💾 SAVE PASSWORD: Salvando nova senha")
        
        # Obter dados do contexto
        reset_token = self.context['reset_token']
        user = self.context['reset_user']
        new_password = self.validated_data['new_password']
        
        print(f"💾 Alterando senha para: {user.email}")
        
        # Alterar senha
        user.set_password(new_password)
        user.save(update_fields=['password'])
        print(f"✅ Senha alterada com sucesso")
        
        # Marcar código como usado
        reset_token.mark_as_used()
        print(f"🔑 Código marcado como usado")
        
        return user


# ==============================================================================
# 🛠️ SERIALIZER PARA VERIFICAR CÓDIGO (OPCIONAL)
# ==============================================================================

class PasswordResetCodeCheckSerializer(serializers.Serializer):
    """
    📋 PROPÓSITO: Verificar se um código está válido (sem usar)
    
    🎯 USO: Endpoint opcional para o app verificar se código está válido
    antes de mostrar tela de nova senha
    """
    
    code = serializers.CharField(
        required=True, 
        min_length=6, 
        max_length=6
    )

    def validate_code(self, value):
        """
        Verificar código sem marcá-lo como usado.
        """
        from .models import PasswordResetToken
        
        print(f"🔍 CODE CHECK: Verificando código {value}")
        
        # Validar formato básico
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("Código deve ter exatamente 6 dígitos numéricos.")
        
        # Verificar se existe e está válido (sem incrementar tentativas)
        import hashlib
        code_hash = hashlib.sha256(value.encode()).hexdigest()
        
        try:
            reset_token = PasswordResetToken.objects.get(code_hash=code_hash)
            
            # Verificar condições sem incrementar tentativas
            if reset_token.used_at:
                raise serializers.ValidationError("Código já foi usado.")
            
            if reset_token.is_expired():
                raise serializers.ValidationError("Código expirado.")
            
            if reset_token.attempts >= 3:
                raise serializers.ValidationError("Código bloqueado por excesso de tentativas.")
            
            # Retornar informações úteis
            self.context['reset_token'] = reset_token
            self.context['reset_user'] = reset_token.user
            self.context['minutes_remaining'] = reset_token.get_expiry_minutes_remaining()
            
            return value
            
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Código inválido.")


# ==============================================================================
# 👤 SERIALIZER PARA ATIVAÇÃO/DESATIVAÇÃO DE USUÁRIOS
# ==============================================================================

class UserActivationSerializer(serializers.ModelSerializer):
    """
    📋 PROPÓSITO: Ativar/desativar usuários (apenas logística/admin)
    
    🔍 DEBUGGING: Para acompanhar ativações
    1. Coloque breakpoint no método update()
    2. Teste com usuário logística vs motorista
    3. Observe como as permissões são verificadas
    """
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'full_name', 'is_active', 'role']
        read_only_fields = ['id', 'email', 'full_name', 'role']
    
    def update(self, instance, validated_data):
        """
        🐛 DEBUGGING: Ativação/desativação de usuário
        
        Coloque breakpoint aqui para ver:
        - Qual usuário está sendo ativado/desativado
        - Quem está fazendo a ação
        - Estado antes e depois
        """
        print(f"🔐 USER ACTIVATION: Atualizando status do usuário")
        print(f"🔐 Usuário alvo: {instance.email}")
        print(f"🔐 Status atual: {instance.is_active}")
        print(f"🔐 Novo status: {validated_data.get('is_active')}")
        
        # Verificar se há mudança no status
        new_status = validated_data.get('is_active')
        if new_status is not None and new_status != instance.is_active:
            instance.is_active = new_status
            instance.save(update_fields=['is_active'])
            
            action = "ativado" if new_status else "desativado"
            print(f"✅ Usuário {instance.email} foi {action}")
        else:
            print(f"ℹ️ Nenhuma mudança no status do usuário")
        
        return instance


class UserListSerializer(serializers.ModelSerializer):
    """
    📋 PROPÓSITO: Listar usuários (para logística/admin)
    
    Versão simplificada para listagem, sem dados sensíveis.
    """
    
    cpf_formatted = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    cnh_vencida = serializers.ReadOnlyField()
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'full_name', 'role', 'is_active',
            'date_joined', 'cpf_formatted', 'phone',
            'cnh_numero', 'cnh_categoria', 'cnh_validade', 'cnh_vencida'
        ]
        read_only_fields = '__all__'  # Apenas leitura para listagem


# ==============================================================================
# 🛠️ FUNÇÃO HELPER PARA DEBUGGING
# ==============================================================================

def debug_serializer_flow(serializer_instance, step=""):
    """
    Função para debuggar o estado do serializer em qualquer momento.
    
    Como usar na view:
    serializer = UserRegistrationSerializer(data=request.data)
    debug_serializer_flow(serializer, "Serializer criado")
    
    if serializer.is_valid():
        debug_serializer_flow(serializer, "Após validação")
    """
    print(f"\n{'='*50}")
    print(f"🔍 DEBUG SERIALIZER: {step}")
    print(f"{'='*50}")
    
    # Dados iniciais (o que chegou na requisição)
    initial_data = getattr(serializer_instance, 'initial_data', None)
    print(f"📥 Dados iniciais: {initial_data}")
    
    # Verificar se foi validado antes de acessar validated_data
    try:
        # Tenta verificar se _validated_data existe (indica que is_valid() foi chamado)
        has_validated_data = hasattr(serializer_instance, '_validated_data')
        if has_validated_data:
            validated_data = serializer_instance.validated_data
            print(f"✅ Dados validados: {validated_data}")
        else:
            print(f"⏳ Dados validados: [Ainda não validado - chame is_valid() primeiro]")
    except AssertionError:
        print(f"⏳ Dados validados: [Ainda não validado - chame is_valid() primeiro]")
    
    # Erros (só existem após validação)
    try:
        if hasattr(serializer_instance, '_errors'):
            errors = serializer_instance.errors
            print(f"❌ Erros: {errors}")
        else:
            print(f"❌ Erros: [Nenhuma validação executada ainda]")
    except:
        print(f"❌ Erros: [Nenhuma validação executada ainda]")
    
    # Status de validação
    has_validated = hasattr(serializer_instance, '_validated_data')
    has_errors = hasattr(serializer_instance, '_errors')
    
    if has_validated and has_errors:
        is_valid = len(serializer_instance.errors) == 0
        print(f"🔍 Status: {'✅ VÁLIDO' if is_valid else '❌ INVÁLIDO'}")
    else:
        print(f"🔍 Status: ⏳ Aguardando validação")
    
    # Se tem instância (para updates)
    instance = getattr(serializer_instance, 'instance', None)
    if instance:
        print(f"📄 Instância: {instance} (para UPDATE)")
    else:
        print(f"📄 Instância: None (para CREATE)")
    
    # Informações do serializer
    print(f"🏷️ Tipo: {type(serializer_instance).__name__}")
    
    print(f"{'='*50}\n")


# ==============================================================================
# 📚 RESUMO: COMO OS SERIALIZERS FUNCIONAM
# ==============================================================================

"""
🎯 FLUXO COMPLETO DE UM SERIALIZER:

1. VIEW recebe request.data (JSON)
   {'email': 'test@test.com', 'password': '123', ...}

2. VIEW cria serializer
   serializer = UserRegistrationSerializer(data=request.data)

3. VIEW chama is_valid()
   serializer.is_valid()
   
   🔄 AQUI O DRF FAZ AUTOMATICAMENTE:
   a) Chama validate_email(value)
   b) Chama validate_cpf(value)
   c) Chama validate(attrs) [validação geral]
   d) Se tudo OK, cria serializer.validated_data

4. SE VÁLIDO, VIEW chama save()
   user = serializer.save()
   
   🔄 AQUI O DRF CHAMA:
   - create(validated_data) se é criação nova
   - update(instance, validated_data) se é edição

5. VIEW retorna resposta
   return Response(serializer.data)

🎯 DICAS DE DEBUGGING:

1. Sempre coloque prints no início de cada método validate
2. Use breakpoints nos métodos validate para ver os dados
3. Use a função debug_serializer_flow() para ver o estado completo
4. Lembre-se: os métodos validate só são chamados em is_valid()
5. O método create/update só é chamado em save()
"""