from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx
import os
from dotenv import load_dotenv

from database import get_db
from models import User
from security import create_access_token, hash_password
import secrets

load_dotenv()

router = APIRouter(
    prefix="/auth",
    tags=["OAuth"]
)

GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI  = os.getenv("GOOGLE_REDIRECT_URI")

GITHUB_CLIENT_ID     = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI  = os.getenv("GITHUB_REDIRECT_URI")

FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:5173")


# ── GOOGLE ──────────────────────────────────────────────────

@router.get("/google")
def google_login():
    # Redirect user to Google's OAuth page
    params = (
        f"client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=openid email profile"
        f"&access_type=offline"
    )
    return RedirectResponse(
        f"https://accounts.google.com/o/oauth2/v2/auth?{params}"
    )


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:

        # Step 1 — Exchange code for access token
        token_res = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code":          code,
                "client_id":     GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri":  GOOGLE_REDIRECT_URI,
                "grant_type":    "authorization_code",
            }
        )
        token_data = token_res.json()

        if "error" in token_data:
            raise HTTPException(status_code=400, detail="Google auth failed")

        access_token = token_data.get("access_token")

        # Step 2 — Get user info from Google
        user_res = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_info = user_res.json()

    email     = user_info.get("email")
    full_name = user_info.get("name", "")
    avatar    = user_info.get("picture", "")

    if not email:
        raise HTTPException(status_code=400, detail="Could not get email from Google")

    # Step 3 — Find or create user
    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(
            full_name      = full_name,
            email          = email,
            hashed_password= hash_password(secrets.token_hex(16)),
            role           = "user",
            is_verified    = True,   # Google already verified the email
            avatar_url     = avatar,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update avatar if they log in with Google
        if avatar and not user.avatar_url:
            user.avatar_url = avatar
            db.commit()

    # Step 4 — Create JWT and redirect to frontend
    jwt_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )

    # Redirect to frontend with token in URL
    return RedirectResponse(
        f"{FRONTEND_URL}/oauth-callback?token={jwt_token}"
    )


# ── GITHUB ──────────────────────────────────────────────────

@router.get("/github")
def github_login():
    params = (
        f"client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={GITHUB_REDIRECT_URI}"
        f"&scope=user:email"
    )
    return RedirectResponse(
        f"https://github.com/login/oauth/authorize?{params}"
    )


@router.get("/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:

        # Step 1 — Exchange code for access token
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id":     GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code":          code,
                "redirect_uri":  GITHUB_REDIRECT_URI,
            },
            headers={"Accept": "application/json"}
        )
        token_data = token_res.json()
        access_token = token_data.get("access_token")

        if not access_token:
            raise HTTPException(status_code=400, detail="GitHub auth failed")

        # Step 2 — Get user info
        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_info = user_res.json()

        # Step 3 — Get email (GitHub may not return it in user info)
        email = user_info.get("email")
        if not email:
            email_res = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            emails = email_res.json()
            # Get primary verified email
            primary = next(
                (e for e in emails if e.get("primary") and e.get("verified")),
                None
            )
            if primary:
                email = primary.get("email")

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Could not get email from GitHub. Make sure your GitHub email is public or verified."
        )

    full_name = user_info.get("name") or user_info.get("login", "")
    avatar    = user_info.get("avatar_url", "")

    # Step 4 — Find or create user
    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(
            full_name      = full_name,
            email          = email,
            hashed_password= hash_password(secrets.token_hex(16)),
            role           = "user",
            is_verified    = True,   # GitHub already verified the email
            avatar_url     = avatar,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if avatar and not user.avatar_url:
            user.avatar_url = avatar
            db.commit()

    # Step 5 — Create JWT and redirect to frontend
    jwt_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )

    return RedirectResponse(
        f"{FRONTEND_URL}/oauth-callback?token={jwt_token}"
    )