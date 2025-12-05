"""
Email Service for Export Compliance Assistant
Supports SendGrid and Gmail SMTP
"""
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import json

# Try to import SendGrid (optional)
try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
    import base64
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False

class EmailService:
    def __init__(self):
        self.provider = os.getenv('EMAIL_PROVIDER', 'gmail').lower()
        self.sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
        self.gmail_user = os.getenv('GMAIL_USER')
        self.gmail_app_password = os.getenv('GMAIL_APP_PASSWORD')
        self.from_email = os.getenv('FROM_EMAIL', self.gmail_user)
    
    def is_configured(self):
        """Check if email service is properly configured."""
        if self.provider == 'sendgrid':
            return bool(self.sendgrid_api_key) and SENDGRID_AVAILABLE
        elif self.provider == 'gmail':
            return bool(self.gmail_user and self.gmail_app_password)
        return False
    
    def get_status(self):
        """Return current email configuration status."""
        return {
            'provider': self.provider,
            'configured': self.is_configured(),
            'from_email': self.from_email,
            'sendgrid_available': SENDGRID_AVAILABLE if self.provider == 'sendgrid' else None
        }
    
    def send_email(self, to_email, subject, html_content, attachments=None):
        """
        Send email with optional attachments.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML body content
            attachments: List of dicts with 'filename', 'content', 'type'
        
        Returns:
            dict with success status and message
        """
        if not self.is_configured():
            return {
                'success': False,
                'error': f'Email not configured. Provider: {self.provider}. Please set environment variables.'
            }
        
        try:
            if self.provider == 'sendgrid':
                return self._send_sendgrid(to_email, subject, html_content, attachments)
            elif self.provider == 'gmail':
                return self._send_gmail(to_email, subject, html_content, attachments)
            else:
                return {'success': False, 'error': f'Unknown provider: {self.provider}'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _send_sendgrid(self, to_email, subject, html_content, attachments):
        """Send email via SendGrid API."""
        message = Mail(
            from_email=self.from_email,
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        
        if attachments:
            for att in attachments:
                encoded = base64.b64encode(att['content']).decode()
                attachment = Attachment(
                    FileContent(encoded),
                    FileName(att['filename']),
                    FileType(att.get('type', 'application/octet-stream')),
                    Disposition('attachment')
                )
                message.add_attachment(attachment)
        
        sg = SendGridAPIClient(self.sendgrid_api_key)
        response = sg.send(message)
        
        return {
            'success': response.status_code in [200, 201, 202],
            'status_code': response.status_code,
            'message': 'Email sent successfully via SendGrid'
        }
    
    def _send_gmail(self, to_email, subject, html_content, attachments):
        """Send email via Gmail SMTP."""
        msg = MIMEMultipart()
        msg['From'] = self.from_email
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(html_content, 'html'))
        
        if attachments:
            for att in attachments:
                part = MIMEApplication(att['content'])
                part.add_header('Content-Disposition', 'attachment', filename=att['filename'])
                msg.attach(part)
        
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(self.gmail_user, self.gmail_app_password)
            server.send_message(msg)
        
        return {
            'success': True,
            'message': 'Email sent successfully via Gmail SMTP'
        }


def generate_compliance_email_html(report_data):
    """Generate HTML email content for compliance report."""
    inp = report_data.get('input', {})
    results = report_data.get('results', [])
    
    exceptions_html = ""
    for r in results:
        color = '#10b981' if r.get('type') == 'EXCEPTION' else '#ef4444' if r.get('type') == 'LICENSE_REQUIRED' else '#f59e0b'
        exceptions_html += f"""
        <div style="padding: 12px; margin: 8px 0; border-left: 4px solid {color}; background: #f8fafc; border-radius: 4px;">
            <strong style="color: {color};">{r.get('code', 'N/A')}</strong> - {r.get('title', '')}
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #475569;">{r.get('justification', '')}</p>
        </div>
        """
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; }}
            .header {{ background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 24px; border-radius: 8px 8px 0 0; }}
            .content {{ padding: 24px; background: white; border: 1px solid #e2e8f0; }}
            .footer {{ padding: 16px; background: #f8fafc; font-size: 12px; color: #64748b; text-align: center; }}
            table {{ width: 100%; border-collapse: collapse; margin: 16px 0; }}
            th, td {{ text-align: left; padding: 10px; border-bottom: 1px solid #e2e8f0; }}
            th {{ background: #f1f5f9; font-weight: 600; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🛡️ Export Compliance Report</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Report ID: {report_data.get('report_id', 'N/A')}</p>
        </div>
        <div class="content">
            <h2 style="margin-top: 0;">Input Parameters</h2>
            <table>
                <tr><th>ECCN</th><td>{inp.get('eccn', 'N/A')}</td></tr>
                <tr><th>Destination</th><td>{inp.get('destination', 'N/A')}</td></tr>
                <tr><th>Value</th><td>${inp.get('value', 0)}</td></tr>
                <tr><th>End User Type</th><td>{inp.get('end_user_type', 'N/A')}</td></tr>
            </table>
            
            <h2>Compliance Results</h2>
            {exceptions_html}
            
            <h2>AI Recommendation</h2>
            <p style="padding: 12px; background: #eff6ff; border-radius: 6px; font-style: italic;">
                {report_data.get('ai_suggestion', 'No AI suggestion available.')}
            </p>
        </div>
        <div class="footer">
            <p>This report was generated by Export Compliance Assistant on {report_data.get('generated_at', 'N/A')[:10]}</p>
            <p>For regulatory guidance, visit <a href="https://www.bis.gov">BIS.gov</a></p>
        </div>
    </body>
    </html>
    """
    return html


# Initialize global email service
email_service = EmailService()
