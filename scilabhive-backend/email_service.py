from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
import os
from dotenv import load_dotenv

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME   = os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD   = os.getenv("MAIL_PASSWORD"),
    MAIL_FROM       = os.getenv("MAIL_FROM"),
    MAIL_PORT       = 587,
    MAIL_SERVER     = "smtp.gmail.com",
    MAIL_STARTTLS   = True,
    MAIL_SSL_TLS    = False,
    USE_CREDENTIALS = True,
)

async def send_otp_email(email: EmailStr, otp: str, name: str):
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#1e1b4b;margin-bottom:8px">Verify your SciLabHive account</h2>
      <p style="color:#6d6a8a;margin-bottom:24px">Hi {name}, enter this code to verify your email:</p>
      <div style="background:#ede9fe;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
        <span style="font-size:36px;font-weight:700;color:#7c3aed;letter-spacing:8px">{otp}</span>
      </div>
      <p style="color:#a9a5c8;font-size:13px">This code expires in 10 minutes. If you didn't create an account, ignore this email.</p>
    </div>
    """
    message = MessageSchema(
        subject    = "Your SciLabHive verification code",
        recipients = [email],
        body       = html,
        subtype    = "html"
    )
    fm = FastMail(conf)
    await fm.send_message(message)