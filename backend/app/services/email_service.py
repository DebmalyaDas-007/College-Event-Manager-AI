import os
from dotenv import load_dotenv
from pydantic import EmailStr

# Explicitly import from submodules to force your IDE to show suggestions
from fastapi_mail.config import ConnectionConfig
from fastapi_mail.fastmail import FastMail
from fastapi_mail.schemas import MessageSchema, MessageType

load_dotenv()

# 1. Setup connection configuration mapping to your .env variables
conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD"),
    MAIL_FROM = os.getenv("MAIL_FROM"),
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS = os.getenv("MAIL_STARTTLS", "True") == "True",
    MAIL_SSL_TLS = os.getenv("MAIL_SSL_TLS", "False") == "True",
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = False
)

async def send_recommendations_email(email_to: str, participant_name: str, recommended_events: list[dict]):
    """
    Compiles an optimized HTML template containing personalized event recommendations 
    and sends it asynchronously via SMTP from your Gmail account.
    """
    # 2. Build dynamic HTML content cards for each recommended event
    event_cards_html = ""
    for event in recommended_events:
        event_cards_html += f"""
        <div style="background-color: #1c1c1e; border: 1px solid #2c2c2e; border-radius: 12px; padding: 20px; margin-bottom: 16px; color: #ffffff;">
            <h3 style="color: #a855f7; margin-top: 0; font-size: 18px;">✨ {event.get('title')}</h3>
            <p style="color: #e4e4e7; font-size: 14px; margin: 8px 0;"><strong>Venue:</strong> {event.get('venue', 'Campus Arena')}</p>
            <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5;">{event.get('description', '')[:150]}...</p>
        </div>
        """

    # 3. Complete layout wrapper matching your dark, modern Nexus AI aesthetic
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #09090b; margin: 0; padding: 40px; color: #f4f4f5;">
            <div style="max-w: 600px; margin: 0 auto; background: #121214; border: 1px solid #27272a; border-radius: 16px; padding: 32px;">
                <h2 style="color: #c084fc; font-size: 24px; margin-bottom: 4px;">Nexus AI</h2>
                <p style="color: #a1a1aa; font-size: 14px; margin-top: 0; margin-bottom: 24px;">Your Intelligent Campus Event Concierge</p>
                
                <p style="font-size: 16px; color: #e4e4e7;">Hi {participant_name},</p>
                <p style="font-size: 15px; color: #d4d4d8; line-height: 1.6; margin-bottom: 24px;">
                    Based on your profile preferences, our AI recommendation engine has discovered upcoming campus events tailored specifically for you:
                </p>
                
                {event_cards_html}
                
                <p style="font-size: 12px; color: #71717a; margin-top: 32px; border-top: 1px solid #27272a; padding-top: 16px; text-align: center;">
                    Sent automatically by Nexus AI. Connecting student communities with intelligent recommendations.
                </p>
            </div>
        </body>
    </html>
    """

    # 4. Create the message payload schema configuration
    message = MessageSchema(
        subject="🚀 Your Personalized Nexus AI Event Lineup",
        recipients=[email_to],
        body=html_content,
        subtype=MessageType.html
    )

    # 5. Initialize the FastMail sender instance and dispatch
    fm = FastMail(conf)
    await fm.send_message(message)
    print(f" Recommendation email successfully sent to {email_to}")