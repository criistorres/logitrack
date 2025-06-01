# ==============================================================================
# SISTEMA DE EMAIL PARA CÓDIGOS DE RESET DE SENHA
# ==============================================================================

# Arquivo: backend/accounts/email_utils.py
# SUBSTITUA COMPLETAMENTE o conteúdo do arquivo email_utils.py

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
import datetime
import logging

logger = logging.getLogger(__name__)


class DirectSMTPEmailSender:
    """
    Classe para envio direto de emails via SMTP.
    
    🎯 PROPÓSITO: Usar SMTP direto ao invés do sistema de email do Django
    para garantir que o envio funcione 100%.
    
    🔧 CONFIGURAÇÃO: Usa as mesmas configurações do settings.py
    """
    
    def __init__(self):
        """
        Inicializar com configurações do Django settings.
        """
        self.smtp_host = getattr(settings, 'EMAIL_HOST', 'smtp.office365.com')
        self.smtp_port = getattr(settings, 'EMAIL_PORT', 587)
        self.smtp_user = getattr(settings, 'EMAIL_HOST_USER', '')
        self.smtp_password = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
        self.use_tls = getattr(settings, 'EMAIL_USE_TLS', True)
        self.use_ssl = getattr(settings, 'EMAIL_USE_SSL', False)
        self.timeout = getattr(settings, 'EMAIL_TIMEOUT', 30)
        
        # Configurações do LogiTrack
        logitrack_settings = getattr(settings, 'LOGITRACK_EMAIL_SETTINGS', {})
        self.from_name = logitrack_settings.get('FROM_NAME', 'LogiTrack Sistema')
        self.from_email = logitrack_settings.get('FROM_EMAIL', self.smtp_user)
        self.support_email = logitrack_settings.get('SUPPORT_EMAIL', self.smtp_user)
        
        print(f"📧 SMTP DIRETO: Configurado para {self.smtp_host}:{self.smtp_port}")
        print(f"📧 From: {self.from_name} <{self.from_email}>")
    
    def create_connection(self):
        """
        Criar conexão SMTP.
        
        Returns:
            smtplib.SMTP: Conexão SMTP configurada
            
        Raises:
            Exception: Se não conseguir conectar ou autenticar
        """
        print(f"📡 Conectando ao {self.smtp_host}:{self.smtp_port}...")
        
        try:
            # Criar conexão
            if self.use_ssl:
                server = smtplib.SMTP_SSL(self.smtp_host, self.smtp_port, timeout=self.timeout)
            else:
                server = smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=self.timeout)
            
            # TLS se necessário
            if self.use_tls and not self.use_ssl:
                print("🔒 Iniciando TLS...")
                server.starttls()
            
            print("✅ Conexão SMTP estabelecida")
            
            # Autenticação
            if self.smtp_user and self.smtp_password:
                print(f"🔐 Autenticando como {self.smtp_user}...")
                server.login(self.smtp_user, self.smtp_password)
                print("✅ Autenticação bem-sucedida")
            
            return server
            
        except smtplib.SMTPAuthenticationError as e:
            print(f"❌ Erro de autenticação SMTP: {e}")
            logger.error(f"Erro de autenticação SMTP: {e}")
            raise Exception(f"Falha na autenticação: {e}")
            
        except smtplib.SMTPConnectError as e:
            print(f"❌ Erro de conexão SMTP: {e}")
            logger.error(f"Erro de conexão SMTP: {e}")
            raise Exception(f"Falha na conexão: {e}")
            
        except Exception as e:
            print(f"❌ Erro inesperado SMTP: {e}")
            logger.error(f"Erro inesperado SMTP: {e}")
            raise Exception(f"Erro SMTP: {e}")
    
    def send_email(self, to_email, subject, text_content, html_content=None):
        """
        Enviar email usando SMTP direto.
        
        Args:
            to_email (str): Email do destinatário
            subject (str): Assunto do email
            text_content (str): Conteúdo em texto
            html_content (str, optional): Conteúdo em HTML
            
        Returns:
            bool: True se enviado com sucesso, False caso contrário
        """
        print(f"📧 ENVIANDO EMAIL DIRETO:")
        print(f"   Para: {to_email}")
        print(f"   Assunto: {subject}")
        print(f"   HTML: {'Sim' if html_content else 'Não'}")
        
        try:
            # Criar conexão
            server = self.create_connection()
            
            # Criar mensagem
            if html_content:
                msg = MIMEMultipart('alternative')
                text_part = MIMEText(text_content, 'plain', 'utf-8')
                html_part = MIMEText(html_content, 'html', 'utf-8')
                msg.attach(text_part)
                msg.attach(html_part)
            else:
                msg = MIMEText(text_content, 'plain', 'utf-8')
            
            # Configurar headers
            msg['Subject'] = subject
            msg['From'] = formataddr((self.from_name, self.from_email))
            msg['To'] = to_email
            msg['Date'] = formataddr(('', timezone.now().strftime('%a, %d %b %Y %H:%M:%S %z')))
            
            # Enviar
            print(f"📤 Enviando mensagem...")
            server.send_message(msg)
            server.quit()
            
            print(f"✅ Email enviado com sucesso para {to_email}")
            logger.info(f"Email enviado com sucesso para {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Erro no envio: {e}")
            logger.error(f"Erro no envio de email para {to_email}: {e}")
            return False
    
    def send_password_reset_code_email(self, user, reset_code, request_ip=None, expires_minutes=30):
        """
        Enviar email de reset de senha com CÓDIGO DE 6 DÍGITOS.
        
        🔄 NOVA FUNCIONALIDADE:
        - Envia código de 6 dígitos ao invés de link
        - Email profissional e moderno
        - Código destacado visualmente
        - Instruções claras de uso
        
        Args:
            user: Instância do CustomUser
            reset_code: Código de 6 dígitos (ex: "123456")
            request_ip: IP da solicitação
            expires_minutes: Minutos até expiração (padrão: 30)
            
        Returns:
            bool: True se enviado com sucesso
        """
        print(f"🔑 ENVIANDO EMAIL DE CÓDIGO DE RESET para {user.email}")
        print(f"🔑 Código: {reset_code}")
        print(f"🔑 Expira em: {expires_minutes} minutos")
        
        try:
            # Preparar contexto para templates
            context = {
                'user': user,
                'reset_code': reset_code,
                'expires_minutes': expires_minutes,
                'request_date': timezone.now().strftime('%d/%m/%Y às %H:%M'),
                'request_ip': request_ip,
                'support_email': self.support_email,
                'company_name': getattr(settings, 'LOGITRACK_EMAIL_SETTINGS', {}).get('COMPANY_NAME', 'LogiTrack'),
                'company_website': getattr(settings, 'LOGITRACK_EMAIL_SETTINGS', {}).get('COMPANY_WEBSITE', 'https://logitrack.com'),
                'current_year': datetime.datetime.now().year,
            }
            
            print(f"📝 Renderizando templates de código...")
            
            # Tentar renderizar templates
            try:
                html_content = render_to_string('emails/password_reset_code.html', context)
                print("✅ Template HTML de código renderizado")
            except Exception as e:
                print(f"⚠️ Erro no template HTML: {e}")
                html_content = self._get_fallback_code_html_template(context)
                print("🔄 Usando template HTML de código fallback")
            
            try:
                text_content = render_to_string('emails/password_reset_code.txt', context)
                print("✅ Template texto de código renderizado")
            except Exception as e:
                print(f"⚠️ Erro no template texto: {e}")
                text_content = self._get_fallback_code_text_template(context)
                print("🔄 Usando template texto de código fallback")
            
            # Enviar email
            subject = f"Código de Redefinição de Senha - {context['company_name']}"
            
            return self.send_email(
                to_email=user.email,
                subject=subject,
                text_content=text_content,
                html_content=html_content
            )
            
        except Exception as e:
            print(f"❌ Erro ao preparar email de código: {e}")
            logger.error(f"Erro ao preparar email de código para {user.email}: {e}")
            return False
    
    def _get_fallback_code_text_template(self, context):
        """
        Template de texto fallback para código se o arquivo não existir.
        """
        return f"""
╔═══════════════════════════════════════════════════════════════╗
║                    LOGITRACK - REDEFINIÇÃO DE SENHA           ║
╚═══════════════════════════════════════════════════════════════╝

Olá, {context['user'].first_name or context['user'].email}!

Recebemos uma solicitação para redefinir a senha da sua conta no LogiTrack.

═══════════════════════════════════════════════════════════════
🔑 SEU CÓDIGO DE REDEFINIÇÃO: {context['reset_code']}
═══════════════════════════════════════════════════════════════

COMO USAR:
1. Abra o aplicativo LogiTrack
2. Toque em "Esqueci minha senha"
3. Digite este código: {context['reset_code']}
4. Escolha sua nova senha

⏰ IMPORTANTE:
• Este código expira em {context['expires_minutes']} minutos
• Este código só pode ser usado uma vez
• Máximo 3 tentativas por código

📱 Se você não solicitou esta redefinição, ignore este email.
🔒 Sua senha atual permanece protegida.

═══════════════════════════════════════════════════════════════
DADOS DA SOLICITAÇÃO:
• Data: {context['request_date']}
• IP: {context.get('request_ip', 'Não disponível')}
═══════════════════════════════════════════════════════════════

PRECISA DE AJUDA?
📧 Email: {context['support_email']}
🌐 Site: {context['company_website']}

---
{context['company_name']} - Sistema de Gerenciamento de Transporte
© {context['current_year']} {context['company_name']}. Todos os direitos reservados.

Este email foi enviado automaticamente. Por favor, não responda.
        """
    
    def _get_fallback_code_html_template(self, context):
        """
        Template HTML fallback para código se o arquivo não existir.
        """
        return f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Redefinição de Senha - {context['company_name']}</title>
    <style>
        body {{ 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f5f7fa; 
            margin: 0; 
            padding: 20px; 
        }}
        .email-container {{ 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 16px; 
            overflow: hidden; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
        }}
        .header {{ 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            padding: 40px 20px; 
            text-align: center; 
            color: white; 
        }}
        .logo {{ 
            font-size: 32px; 
            font-weight: bold; 
            margin-bottom: 10px; 
        }}
        .content {{ 
            padding: 40px 30px; 
        }}
        .greeting {{ 
            font-size: 20px; 
            margin-bottom: 20px; 
            color: #2c3e50; 
        }}
        .code-container {{ 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            border-radius: 16px; 
            padding: 30px; 
            text-align: center; 
            margin: 30px 0; 
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3); 
        }}
        .code-label {{ 
            color: #e8e8ff; 
            font-size: 14px; 
            margin-bottom: 10px; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
        }}
        .code {{ 
            font-size: 48px; 
            font-weight: bold; 
            color: white; 
            letter-spacing: 8px; 
            margin: 0; 
            text-shadow: 0 2px 4px rgba(0,0,0,0.3); 
        }}
        .instructions {{ 
            background: #f8f9ff; 
            border-radius: 12px; 
            padding: 25px; 
            margin: 25px 0; 
            border-left: 4px solid #667eea; 
        }}
        .step {{ 
            margin: 10px 0; 
            padding-left: 25px; 
            position: relative; 
        }}
        .step::before {{ 
            content: counter(step-counter); 
            counter-increment: step-counter; 
            position: absolute; 
            left: 0; 
            background: #667eea; 
            color: white; 
            border-radius: 50%; 
            width: 20px; 
            height: 20px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 12px; 
            font-weight: bold; 
        }}
        .steps {{ 
            counter-reset: step-counter; 
        }}
        .warning {{ 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
        }}
        .footer {{ 
            background: #2c3e50; 
            color: #ecf0f1; 
            padding: 30px 20px; 
            text-align: center; 
            font-size: 14px; 
        }}
        .highlight {{ 
            color: #667eea; 
            font-weight: bold; 
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🚛 {context['company_name']}</div>
            <p>Sistema de Gerenciamento de Transporte</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Olá, {context['user'].first_name or context['user'].email}!
            </div>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no LogiTrack.</p>
            
            <div class="code-container">
                <div class="code-label">🔑 Seu Código de Redefinição</div>
                <div class="code">{context['reset_code']}</div>
            </div>
            
            <div class="instructions">
                <h3 style="margin-top: 0; color: #2c3e50;">📱 Como usar este código:</h3>
                <div class="steps">
                    <div class="step">Abra o aplicativo LogiTrack</div>
                    <div class="step">Toque em "Esqueci minha senha"</div>
                    <div class="step">Digite o código: <span class="highlight">{context['reset_code']}</span></div>
                    <div class="step">Escolha sua nova senha</div>
                </div>
            </div>
            
            <div class="warning">
                <strong>⏰ Informações Importantes:</strong><br>
                • Este código expira em <strong>{context['expires_minutes']} minutos</strong><br>
                • Este código só pode ser usado <strong>uma vez</strong><br>
                • Máximo <strong>3 tentativas</strong> por código<br>
                • Se você não solicitou esta redefinição, ignore este email
            </div>
            
            <p style="font-size: 14px; color: #666;">
                <strong>Dados da solicitação:</strong><br>
                Data: {context['request_date']}<br>
                IP: {context.get('request_ip', 'Não disponível')}
            </p>
            
            <p>
                <strong>Precisa de ajuda?</strong><br>
                Entre em contato: <a href="mailto:{context['support_email']}" style="color: #667eea;">{context['support_email']}</a>
            </p>
        </div>
        
        <div class="footer">
            <strong>{context['company_name']}</strong><br>
            Sistema de Gerenciamento de Transporte<br><br>
            Este email foi enviado automaticamente. Por favor, não responda.<br>
            © {context['current_year']} {context['company_name']}. Todos os direitos reservados.
        </div>
    </div>
</body>
</html>
        """


# ==============================================================================
# FUNÇÃO GLOBAL PARA USAR EM QUALQUER LUGAR - SISTEMA DE CÓDIGO
# ==============================================================================

def send_password_reset_code_email_direct(user, reset_code, request_ip=None, expires_minutes=30):
    """
    Função global para enviar email de reset com CÓDIGO usando SMTP direto.
    
    🔄 NOVA FUNCIONALIDADE: Sistema de código ao invés de link
    
    Args:
        user: Instância do CustomUser
        reset_code: Código de 6 dígitos (ex: "123456")
        request_ip: IP da solicitação
        expires_minutes: Minutos até expiração (padrão: 30)
        
    Returns:
        bool: True se enviado com sucesso
    """
    sender = DirectSMTPEmailSender()
    return sender.send_password_reset_code_email(user, reset_code, request_ip, expires_minutes)


def send_simple_email_direct(to_email, subject, message):
    """
    Função para enviar email simples usando SMTP direto.
    
    Args:
        to_email (str): Email destinatário
        subject (str): Assunto
        message (str): Mensagem
        
    Returns:
        bool: True se enviado com sucesso
    """
    sender = DirectSMTPEmailSender()
    return sender.send_email(to_email, subject, message)


# ==============================================================================
# MANTER FUNÇÃO ORIGINAL PARA COMPATIBILIDADE (DEPRECADA)
# ==============================================================================

def send_password_reset_email_direct(user, reset_token, reset_url, request_ip=None):
    """
    ⚠️ FUNÇÃO DEPRECADA - Mantida para compatibilidade
    
    Use send_password_reset_code_email_direct() para o novo sistema de códigos.
    """
    print("⚠️ ATENÇÃO: Usando função deprecada send_password_reset_email_direct")
    print("⚠️ Use send_password_reset_code_email_direct() para o novo sistema de códigos")
    
    # Por enquanto, extrair código do token se possível
    if len(reset_token) == 6 and reset_token.isdigit():
        return send_password_reset_code_email_direct(user, reset_token, request_ip)
    else:
        print("⚠️ Token não é código de 6 dígitos, usando sistema antigo")
        sender = DirectSMTPEmailSender()
        return sender.send_password_reset_email(user, reset_token, reset_url, request_ip)


# ==============================================================================
# TESTES DA FUNCIONALIDADE DE CÓDIGO
# ==============================================================================

def test_direct_smtp_code():
    """
    Função para testar SMTP direto com código.
    Execute: python manage.py shell -c "from accounts.email_utils import test_direct_smtp_code; test_direct_smtp_code()"
    """
    print("🧪 TESTANDO SMTP DIRETO COM CÓDIGO...")
    
    # Criar usuário fake para teste
    class FakeUser:
        email = "teste@logitrack.com"
        first_name = "Teste"
        def __str__(self):
            return self.email
    
    fake_user = FakeUser()
    test_code = "123456"
    
    result = send_password_reset_code_email_direct(
        user=fake_user,
        reset_code=test_code,
        request_ip="127.0.0.1",
        expires_minutes=30
    )
    
    if result:
        print("🎉 SMTP DIRETO COM CÓDIGO FUNCIONANDO!")
        print(f"✅ Código {test_code} enviado para {fake_user.email}")
    else:
        print("❌ Problemas no SMTP direto com código")
    
    return result


def test_direct_smtp():
    """
    Função para testar SMTP direto básico.
    Execute: python manage.py shell -c "from accounts.email_utils import test_direct_smtp; test_direct_smtp()"
    """
    print("🧪 TESTANDO SMTP DIRETO BÁSICO...")
    
    result = send_simple_email_direct(
        to_email="teste@logitrack.com",
        subject="✅ Teste SMTP Direto - LogiTrack Sistema de Códigos",
        message="Este email foi enviado usando SMTP direto com o novo sistema de códigos!\n\nSe você recebeu este email, o sistema está funcionando perfeitamente!"
    )
    
    if result:
        print("🎉 SMTP DIRETO FUNCIONANDO!")
    else:
        print("❌ Problemas no SMTP direto")
    
    return result