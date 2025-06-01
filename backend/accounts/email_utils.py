# ==============================================================================
# SISTEMA DE EMAIL DIRETO VIA SMTP
# ==============================================================================

# Arquivo: backend/accounts/email_utils.py
# Crie este arquivo novo na pasta accounts/

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
    
    def send_password_reset_email(self, user, reset_token, reset_url, request_ip=None):
        """
        Enviar email de reset de senha usando templates.
        
        Args:
            user: Instância do CustomUser
            reset_token: Token de reset
            reset_url: URL completa para reset
            request_ip: IP da solicitação
            
        Returns:
            bool: True se enviado com sucesso
        """
        print(f"🔑 ENVIANDO EMAIL DE RESET para {user.email}")
        
        try:
            # Preparar contexto para templates
            context = {
                'user': user,
                'reset_url': reset_url,
                'reset_token': reset_token,
                'expiry_hours': getattr(settings, 'LOGITRACK_EMAIL_SETTINGS', {}).get('PASSWORD_RESET_TIMEOUT_HOURS', 24),
                'request_date': timezone.now().strftime('%d/%m/%Y às %H:%M'),
                'request_ip': request_ip,
                'support_email': self.support_email,
                'company_name': getattr(settings, 'LOGITRACK_EMAIL_SETTINGS', {}).get('COMPANY_NAME', 'LogiTrack'),
                'company_website': getattr(settings, 'LOGITRACK_EMAIL_SETTINGS', {}).get('COMPANY_WEBSITE', 'https://logitrack.com'),
                'current_year': datetime.datetime.now().year,
            }
            
            print(f"📝 Renderizando templates...")
            
            # Tentar renderizar templates
            try:
                html_content = render_to_string('emails/password_reset.html', context)
                print("✅ Template HTML renderizado")
            except Exception as e:
                print(f"⚠️ Erro no template HTML: {e}")
                html_content = self._get_fallback_html_template(context)
                print("🔄 Usando template HTML fallback")
            
            try:
                text_content = render_to_string('emails/password_reset.txt', context)
                print("✅ Template texto renderizado")
            except Exception as e:
                print(f"⚠️ Erro no template texto: {e}")
                text_content = self._get_fallback_text_template(context)
                print("🔄 Usando template texto fallback")
            
            # Enviar email
            subject = f"Redefinição de Senha - {context['company_name']}"
            
            return self.send_email(
                to_email=user.email,
                subject=subject,
                text_content=text_content,
                html_content=html_content
            )
            
        except Exception as e:
            print(f"❌ Erro ao preparar email de reset: {e}")
            logger.error(f"Erro ao preparar email de reset para {user.email}: {e}")
            return False
    
    def _get_fallback_text_template(self, context):
        """
        Template de texto fallback se o arquivo não existir.
        """
        return f"""
LOGITRACK - REDEFINIÇÃO DE SENHA
================================

Olá, {context['user'].first_name or context['user'].email}!

Recebemos uma solicitação para redefinir a senha da sua conta no LogiTrack.

LINK PARA REDEFINIR SENHA:
{context['reset_url']}

INFORMAÇÕES IMPORTANTES:
- Este link é válido por {context['expiry_hours']} horas
- Este link só pode ser usado uma vez
- Se você não solicitou esta redefinição, ignore este email
- Sua senha atual permanece inalterada até você criar uma nova

DADOS DA SOLICITAÇÃO:
- Data: {context['request_date']}
- IP: {context.get('request_ip', 'Não disponível')}

Se você não solicitou esta redefinição de senha, pode ignorar este email com segurança. 
Sua conta permanece protegida.

PRECISA DE AJUDA?
Entre em contato com nossa equipe de suporte:
Email: {context['support_email']}

---
{context['company_name']}
Sistema de Gerenciamento de Transporte
{context['company_website']}

Este email foi enviado automaticamente. Por favor, não responda.
© {context['current_year']} {context['company_name']}. Todos os direitos reservados.
        """
    
    def _get_fallback_html_template(self, context):
        """
        Template HTML fallback se o arquivo não existir.
        """
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Redefinição de Senha - {context['company_name']}</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #667eea; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; }}
        .button {{ background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }}
        .footer {{ background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚛 {context['company_name']}</h1>
            <p>Sistema de Gerenciamento de Transporte</p>
        </div>
        
        <div class="content">
            <h2>Olá, {context['user'].first_name or context['user'].email}!</h2>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no LogiTrack.</p>
            
            <p style="text-align: center;">
                <a href="{context['reset_url']}" class="button">🔑 Redefinir Minha Senha</a>
            </p>
            
            <h3>ℹ️ Informações Importantes:</h3>
            <ul>
                <li>Este link é válido por {context['expiry_hours']} horas</li>
                <li>Este link só pode ser usado uma vez</li>
                <li>Se você não solicitou esta redefinição, ignore este email</li>
                <li>Sua senha atual permanece inalterada até você criar uma nova</li>
            </ul>
            
            <p><strong>Link alternativo:</strong><br>
            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
            <a href="{context['reset_url']}">{context['reset_url']}</a></p>
            
            <p>Se você não solicitou esta redefinição de senha, pode ignorar este email com segurança.</p>
            
            <p><strong>Precisa de ajuda?</strong><br>
            Entre em contato: <a href="mailto:{context['support_email']}">{context['support_email']}</a></p>
        </div>
        
        <div class="footer">
            <p><strong>{context['company_name']}</strong><br>
            Sistema de Gerenciamento de Transporte</p>
            
            <p>Este email foi enviado automaticamente. Por favor, não responda.<br>
            © {context['current_year']} {context['company_name']}. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
        """


# ==============================================================================
# FUNÇÃO GLOBAL PARA USAR EM QUALQUER LUGAR
# ==============================================================================

def send_password_reset_email_direct(user, reset_token, reset_url, request_ip=None):
    """
    Função global para enviar email de reset usando SMTP direto.
    
    Args:
        user: Instância do CustomUser
        reset_token: Token de reset
        reset_url: URL completa para reset
        request_ip: IP da solicitação
        
    Returns:
        bool: True se enviado com sucesso
    """
    sender = DirectSMTPEmailSender()
    return sender.send_password_reset_email(user, reset_token, reset_url, request_ip)


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
# TESTES DA FUNCIONALIDADE
# ==============================================================================

def test_direct_smtp():
    """
    Função para testar SMTP direto.
    Execute: python manage.py shell -c "from accounts.email_utils import test_direct_smtp; test_direct_smtp()"
    """
    print("🧪 TESTANDO SMTP DIRETO...")
    
    result = send_simple_email_direct(
        to_email="development@rrbeauty.com.br",
        subject="✅ Teste SMTP Direto - LogiTrack",
        message="Este email foi enviado usando SMTP direto!\n\nSe você recebeu este email, o sistema está funcionando perfeitamente!"
    )
    
    if result:
        print("🎉 SMTP DIRETO FUNCIONANDO!")
    else:
        print("❌ Problemas no SMTP direto")
    
    return result